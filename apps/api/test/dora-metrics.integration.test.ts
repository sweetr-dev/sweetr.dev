import { describe, it, expect } from "vitest";
import { PullRequestState } from "@prisma/client";
import { createTestContextWithGitProfile } from "./integration-setup/context";
import {
  seedRepository,
  seedApplication,
  seedEnvironment,
  seedGitProfile,
  seedPullRequest,
  seedDeployment,
  seedDeploymentPullRequest,
  seedIncident,
} from "./seed";
import {
  generateDeploymentTimeline,
  generateIncidentResolutionTimeline,
} from "./scenarios/timeline";

/**
 * DORA Metrics Tests
 *
 * These tests validate the correctness of DORA metric calculations
 * using real Postgres queries. All tests:
 * - Create their own workspace (multi-tenant isolation)
 * - Use explicit UTC timestamps (determinism)
 * - Assert on counts, ratios, and durations (not fragile internals)
 * - Read like business scenarios
 */

describe("DORA Metrics", () => {
  describe("Lead Time", () => {
    it("calculates lead time for a single PR to deployment", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create a PR merged 2 hours before deployment
      const prCreatedAt = new Date("2024-01-15T10:00:00Z");
      const prMergedAt = new Date("2024-01-15T12:00:00Z");
      const deployedAt = new Date("2024-01-15T14:00:00Z");

      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Feature PR",
          state: PullRequestState.MERGED,
          mergedAt: prMergedAt,
          createdAt: prCreatedAt,
        }
      );

      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt,
          authorId: gitProfile.gitProfileId,
        }
      );

      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      // Query: Calculate lead time (PR creation to deployment)
      const result = await ctx.prisma.$queryRaw<
        Array<{ lead_time_hours: bigint }>
      >`
        SELECT 
          EXTRACT(EPOCH FROM (d."deployedAt" - pr."createdAt")) / 3600 AS lead_time_hours
        FROM "Deployment" d
        INNER JOIN "DeploymentPullRequest" dpr ON d.id = dpr."deploymentId"
        INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr.id
        WHERE d."workspaceId" = ${ctx.workspaceId}
        LIMIT 1
      `;

      expect(result.length).toBe(1);
      const leadTimeHours = Number(result[0].lead_time_hours);
      expect(leadTimeHours).toBeCloseTo(4, 1); // 4 hours: 10:00 to 14:00
    });

    it("calculates lead time for batched PRs (multiple PRs per deployment)", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      const deployedAt = new Date("2024-01-15T14:00:00Z");

      // Create 3 PRs with different creation times
      const pr1 = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          number: "1",
          createdAt: new Date("2024-01-15T08:00:00Z"),
          mergedAt: new Date("2024-01-15T12:00:00Z"),
        }
      );

      const pr2 = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          number: "2",
          createdAt: new Date("2024-01-15T10:00:00Z"),
          mergedAt: new Date("2024-01-15T12:00:00Z"),
        }
      );

      const pr3 = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          number: "3",
          createdAt: new Date("2024-01-15T12:00:00Z"),
          mergedAt: new Date("2024-01-15T13:00:00Z"),
        }
      );

      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt,
          authorId: gitProfile.gitProfileId,
        }
      );

      // Link all PRs to the same deployment
      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr1.pullRequestId
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr2.pullRequestId
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr3.pullRequestId
      );

      // Query: Calculate lead time using the earliest PR creation time
      const result = await ctx.prisma.$queryRaw<
        Array<{ lead_time_hours: bigint }>
      >`
        SELECT 
          EXTRACT(EPOCH FROM (d."deployedAt" - MIN(pr."createdAt"))) / 3600 AS lead_time_hours
        FROM "Deployment" d
        INNER JOIN "DeploymentPullRequest" dpr ON d.id = dpr."deploymentId"
        INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr.id
        WHERE d."workspaceId" = ${ctx.workspaceId}
          AND d.id = ${deployment.deploymentId}
        GROUP BY d.id, d."deployedAt"
      `;

      expect(result.length).toBe(1);
      const leadTimeHours = Number(result[0].lead_time_hours);
      expect(leadTimeHours).toBeCloseTo(6, 1); // 6 hours: earliest PR (08:00) to deployment (14:00)
    });
  });

  describe("Change Failure Rate", () => {
    it("calculates change failure rate across several weeks", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Generate 4 weeks of deployments, every 5th deployment causes an incident
      const timeline = await generateDeploymentTimeline(
        ctx,
        gitProfile,
        application,
        environment,
        repository.repositoryId,
        {
          startDate: new Date("2024-01-01T00:00:00Z"),
          weeks: 4,
          deploymentsPerWeek: 5,
          everyNthIncident: 5,
        }
      );

      // Query: Calculate change failure rate (incidents / deployments)
      const result = await ctx.prisma.$queryRaw<
        Array<{
          total_deployments: bigint;
          total_incidents: bigint;
          failure_rate: number;
        }>
      >`
        SELECT 
          COUNT(DISTINCT d.id)::bigint AS total_deployments,
          COUNT(DISTINCT i.id)::bigint AS total_incidents,
          ROUND(
            (COUNT(DISTINCT i.id)::numeric / NULLIF(COUNT(DISTINCT d.id), 0)::numeric) * 100,
            2
          )::double precision AS failure_rate
        FROM "Deployment" d
        LEFT JOIN "Incident" i ON i."causeDeploymentId" = d.id
        WHERE d."workspaceId" = ${ctx.workspaceId}
          AND d."deployedAt" >= '2024-01-01T00:00:00Z'::timestamp
          AND d."deployedAt" < '2024-02-01T00:00:00Z'::timestamp
      `;

      expect(result.length).toBe(1);
      const metrics = result[0];

      // 4 weeks * 5 deployments/week = 20 deployments
      expect(Number(metrics.total_deployments)).toBe(20);

      // Every 5th deployment causes an incident = 4 incidents
      expect(Number(metrics.total_incidents)).toBe(4);

      // Failure rate = 4/20 = 20%
      expect(Number(metrics.failure_rate)).toBeCloseTo(20, 1);
    });

    it("handles zero incidents correctly", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Generate deployments without incidents
      await generateDeploymentTimeline(
        ctx,
        gitProfile,
        application,
        environment,
        repository.repositoryId,
        {
          startDate: new Date("2024-01-01T00:00:00Z"),
          weeks: 2,
          deploymentsPerWeek: 3,
        }
      );

      const result = await ctx.prisma.$queryRaw<
        Array<{
          total_deployments: bigint;
          total_incidents: bigint;
          failure_rate: number | null;
        }>
      >`
        SELECT 
          COUNT(DISTINCT d.id)::bigint AS total_deployments,
          COUNT(DISTINCT i.id)::bigint AS total_incidents,
          ROUND(
            (COUNT(DISTINCT i.id)::numeric / NULLIF(COUNT(DISTINCT d.id), 0)::numeric) * 100,
            2
          )::double precision AS failure_rate
        FROM "Deployment" d
        LEFT JOIN "Incident" i ON i."causeDeploymentId" = d.id
        WHERE d."workspaceId" = ${ctx.workspaceId}
      `;

      expect(result.length).toBe(1);
      const metrics = result[0];

      expect(Number(metrics.total_deployments)).toBe(6);
      expect(Number(metrics.total_incidents)).toBe(0);
      // Prisma returns Decimal for numeric types, convert to number
      expect(Number(metrics.failure_rate)).toBe(0);
    });
  });

  describe("Mean Time To Recover (MTTR)", () => {
    it("calculates MTTR with incidents resolved after deploy", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Generate timeline with incidents resolved by subsequent deployments
      // The test validates that MTTR is calculated correctly from incident detection to resolution.
      // Note: Actual MTTR depends on deployment frequency - if deployments are daily,
      // incidents may take ~24 hours to resolve even if detected quickly.
      const timeline = await generateIncidentResolutionTimeline(
        ctx,
        gitProfile,
        application,
        environment,
        repository.repositoryId,
        {
          startDate: new Date("2024-01-01T00:00:00Z"),
          weeks: 2,
          deploymentsPerWeek: 5,
          resolutionDelayHours: 4, // Target resolution time (but actual depends on next deployment)
        }
      );

      // Query: Calculate MTTR (average time from incident detection to resolution)
      const result = await ctx.prisma.$queryRaw<
        Array<{
          mttr_hours: number | null;
          incident_count: bigint;
        }>
      >`
        SELECT 
          ROUND(
            AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."detectedAt")) / 3600),
            2
          )::double precision AS mttr_hours,
          COUNT(*)::bigint AS incident_count
        FROM "Incident" i
        WHERE i."workspaceId" = ${ctx.workspaceId}
          AND i."resolvedAt" IS NOT NULL
      `;

      expect(result.length).toBe(1);
      const metrics = result[0];

      expect(Number(metrics.incident_count)).toBeGreaterThan(0);

      // MTTR is the time from incident detection to resolution.
      // With 5 deployments/week (roughly daily), the next deployment after an incident
      // will typically be the next day (~24 hours later), not the target 4 hours.
      // This is realistic behavior - MTTR depends on deployment frequency.
      // Prisma returns Decimal for numeric types, convert to number
      if (metrics.mttr_hours !== null) {
        const mttrHours = Number(metrics.mttr_hours);
        // With daily deployments, MTTR will be approximately 24 hours
        // (incident detected ~30 min after deploy, resolved at next day's deployment)
        expect(mttrHours).toBeGreaterThan(20); // At least 20 hours (next day deployment)
        expect(mttrHours).toBeLessThan(30); // Less than 30 hours (reasonable upper bound)
      }
    });

    it("excludes unresolved incidents from MTTR calculation", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      const deployedAt = new Date("2024-01-15T10:00:00Z");
      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt,
          authorId: gitProfile.gitProfileId,
        }
      );

      // Create resolved incident
      await seedIncident(ctx, deployment.deploymentId, {
        detectedAt: new Date("2024-01-15T10:30:00Z"),
        resolvedAt: new Date("2024-01-15T12:30:00Z"),
      });

      // Create unresolved incident
      await seedIncident(ctx, deployment.deploymentId, {
        detectedAt: new Date("2024-01-15T11:00:00Z"),
        // resolvedAt is undefined
      });

      const result = await ctx.prisma.$queryRaw<
        Array<{
          mttr_hours: number | null;
          resolved_count: bigint;
          total_count: bigint;
        }>
      >`
        SELECT 
          ROUND(
            AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."detectedAt")) / 3600),
            2
          )::double precision AS mttr_hours,
          COUNT(*) FILTER (WHERE i."resolvedAt" IS NOT NULL)::bigint AS resolved_count,
          COUNT(*)::bigint AS total_count
        FROM "Incident" i
        WHERE i."workspaceId" = ${ctx.workspaceId}
      `;

      expect(result.length).toBe(1);
      const metrics = result[0];

      expect(Number(metrics.total_count)).toBe(2);
      expect(Number(metrics.resolved_count)).toBe(1);
      // Prisma returns Decimal for numeric types, convert to number
      expect(Number(metrics.mttr_hours)).toBeCloseTo(2, 1); // 2 hours: 10:30 to 12:30
    });
  });

  describe("Deployment Frequency", () => {
    it("calculates deployment frequency per week", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Generate 4 weeks of deployments
      await generateDeploymentTimeline(
        ctx,
        gitProfile,
        application,
        environment,
        repository.repositoryId,
        {
          startDate: new Date("2024-01-01T00:00:00Z"),
          weeks: 4,
          deploymentsPerWeek: 5,
        }
      );

      // Query: Calculate deployment frequency per week
      const result = await ctx.prisma.$queryRaw<
        Array<{
          week_start: Date;
          deployment_count: bigint;
        }>
      >`
        SELECT 
          DATE_TRUNC('week', d."deployedAt") AS week_start,
          COUNT(*)::bigint AS deployment_count
        FROM "Deployment" d
        WHERE d."workspaceId" = ${ctx.workspaceId}
          AND d."deployedAt" >= '2024-01-01T00:00:00Z'::timestamp
        GROUP BY DATE_TRUNC('week', d."deployedAt")
        ORDER BY week_start
      `;

      expect(result.length).toBe(4);
      result.forEach((week) => {
        expect(Number(week.deployment_count)).toBe(5);
      });
    });
  });
});
