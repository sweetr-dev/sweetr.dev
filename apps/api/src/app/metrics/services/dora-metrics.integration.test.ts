import { PullRequestState } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { createTestContextWithGitProfile } from "../../../../test/integration-setup/context";
import {
  generateDeploymentTimeline,
  generateIncidentResolutionTimeline,
} from "../../../../test/scenarios/timeline";
import {
  seedApplication,
  seedDeployment,
  seedDeploymentPullRequest,
  seedEnvironment,
  seedGitProfile,
  seedIncident,
  seedPullRequest,
  seedRepository,
  seedTeam,
} from "../../../../test/seed";
import { Period } from "../../../graphql-types";
import {
  getChangeFailureRateMetric,
  getDeploymentFrequencyMetric,
  getLeadTimeMetric,
  getMeanTimeToRecoverMetric,
} from "./dora-metrics.service";

/**
 * DORA Metrics Integration Tests
 *
 * These tests validate the correctness of DORA metric calculations
 * by calling the actual service methods. All tests:
 * - Create their own workspace (multi-tenant isolation)
 * - Use explicit UTC timestamps (determinism)
 * - Assert on metric values, changes, and chart data (not fragile internals)
 * - Read like business scenarios
 * - Test the service layer, not raw SQL queries
 */

describe("DORA Metrics", () => {
  describe("Lead Time", () => {
    it("calculates lead time for a single PR to deployment using PR createdAt", async () => {
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
        { deployedAt, authorId: gitProfile.gitProfileId }
      );

      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      // Calculate lead time using service method
      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Lead time = 4 hours (10:00 to 14:00) = 4 * 60 * 60 * 1000 = 14,400,000 ms
      expect(result.currentAmount).toBe(14400000);
      expect(result.columns.length).toBeGreaterThan(0);
      expect(result.data.length).toBe(result.columns.length); // Data aligns with columns
      // Chart data should include the deployment
      const hasData = result.data.some((d) => Number(d) > 0);
      expect(hasData).toBe(true);
      // Verify columns are valid dates
      result.columns.forEach((col) => {
        expect(new Date(col).getTime()).not.toBeNaN();
      });
      // Verify data values are valid numbers
      result.data.forEach((d) => {
        expect(Number.isFinite(Number(d))).toBe(true);
        expect(Number(d)).toBeGreaterThanOrEqual(0);
      });
    });

    it("calculates lead time using PullRequestTracking firstCommitAt when available", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // PR created at 10:00, but first commit was at 09:00
      const prCreatedAt = new Date("2024-01-15T10:00:00Z");
      const firstCommitAt = new Date("2024-01-15T09:00:00Z");
      const deployedAt = new Date("2024-01-15T14:00:00Z");

      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Feature PR",
          state: PullRequestState.MERGED,
          createdAt: prCreatedAt,
        }
      );

      // Create PullRequestTracking with firstCommitAt
      await ctx.prisma.pullRequestTracking.create({
        data: {
          pullRequestId: pr.pullRequestId,
          workspaceId: ctx.workspaceId,
          firstCommitAt,
          size: "MEDIUM",
          changedFilesCount: 5,
          linesAddedCount: 100,
          linesDeletedCount: 50,
        },
      });

      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt, authorId: gitProfile.gitProfileId }
      );

      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Lead time should use firstCommitAt (09:00) not createdAt (10:00)
      // 09:00 to 14:00 = 5 hours = 18,000,000 ms
      expect(result.currentAmount).toBe(18000000);
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
        { deployedAt, authorId: gitProfile.gitProfileId }
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

      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Lead time should use earliest PR creation time (08:00)
      // 08:00 to 14:00 = 6 hours = 21,600,000 ms
      expect(result.currentAmount).toBe(21600000);
    });

    it("calculates previous period comparison correctly", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Previous period: deployment on Jan 14 (1 day before current period)
      // Current period is Jan 15-16, so previous is Jan 14-15
      const prevPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-14T10:00:00Z") }
      );
      const prevDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-14T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        prevDeployment.deploymentId,
        prevPr.pullRequestId
      );

      // Current period: deployment on Jan 15
      const currPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const currDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T16:00:00Z"), // 6 hours lead time
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        currDeployment.deploymentId,
        currPr.pullRequestId
      );

      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Current: 6 hours = 21,600,000 ms
      expect(result.currentAmount).toBe(21600000);
      // Previous: 4 hours = 14,400,000 ms
      expect(result.previousAmount).toBe(14400000);
      // Change: (21,600,000 - 14,400,000) / 14,400,000 * 100 = 50%
      expect(result.change).toBeCloseTo(50, 1);
    });

    it("filters by environmentIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const prodEnv = await seedEnvironment(ctx, { isProduction: true });
      const stagingEnv = await seedEnvironment(ctx, { isProduction: false });

      // Create deployments in both environments
      const prodPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const prodDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        prodEnv.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        prodDeployment.deploymentId,
        prodPr.pullRequestId
      );

      const stagingPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const stagingDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        stagingEnv.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        stagingDeployment.deploymentId,
        stagingPr.pullRequestId
      );

      // Filter by staging environment only
      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        environmentIds: [stagingEnv.environmentId],
      });

      expect(result.currentAmount).toBe(14400000); // 4 hours
    });

    it("filters by applicationIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments for both apps
      const pr1 = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deployment1 = await seedDeployment(
        ctx,
        app1.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment1.deploymentId,
        pr1.pullRequestId
      );

      const pr2 = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deployment2 = await seedDeployment(
        ctx,
        app2.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment2.deploymentId,
        pr2.pullRequestId
      );

      // Filter by app1 only
      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        applicationIds: [app1.applicationId],
      });

      expect(result.currentAmount).toBe(14400000); // 4 hours
    });

    it("filters by teamIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const team1 = await seedTeam(ctx, { name: "team1" });
      const team2 = await seedTeam(ctx, { name: "team2" });
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
        teamId: team1.teamId,
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
        teamId: team2.teamId,
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments for both teams
      const pr1 = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deployment1 = await seedDeployment(
        ctx,
        app1.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment1.deploymentId,
        pr1.pullRequestId
      );

      const pr2 = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deployment2 = await seedDeployment(
        ctx,
        app2.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment2.deploymentId,
        pr2.pullRequestId
      );

      // Filter by team1 only
      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        teamIds: [team1.teamId],
      });

      expect(result.currentAmount).toBe(14400000); // 4 hours
    });

    it("filters by repositoryIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repo1 = await seedRepository(ctx, { name: "repo1" });
      const repo2 = await seedRepository(ctx, { name: "repo2" });
      const app1 = await seedApplication(ctx, repo1.repositoryId, {
        name: "app-repo1",
      });
      const app2 = await seedApplication(ctx, repo2.repositoryId, {
        name: "app-repo2",
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments for both repos
      const pr1 = await seedPullRequest(
        ctx,
        repo1.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deployment1 = await seedDeployment(
        ctx,
        app1.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment1.deploymentId,
        pr1.pullRequestId
      );

      const pr2 = await seedPullRequest(
        ctx,
        repo2.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deployment2 = await seedDeployment(
        ctx,
        app2.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment2.deploymentId,
        pr2.pullRequestId
      );

      // Filter by repo1 only
      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        repositoryIds: [repo1.repositoryId],
      });

      expect(result.currentAmount).toBe(14400000); // 4 hours
    });

    it("filters by combined teamIds and environmentIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const team1 = await seedTeam(ctx, { name: "team1" });
      const team2 = await seedTeam(ctx, { name: "team2" });
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
        teamId: team1.teamId,
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
        teamId: team2.teamId,
      });
      const prodEnv = await seedEnvironment(ctx, { isProduction: true });
      const stagingEnv = await seedEnvironment(ctx, { isProduction: false });

      // Create deployments: team1+prod, team1+staging, team2+prod, team2+staging
      const deployments = [
        { app: app1, env: prodEnv },
        { app: app1, env: stagingEnv },
        { app: app2, env: prodEnv },
        { app: app2, env: stagingEnv },
      ];

      for (const { app, env } of deployments) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T14:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      // Filter by team1 AND staging environment
      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        teamIds: [team1.teamId],
        environmentIds: [stagingEnv.environmentId],
      });

      // Should only match team1 + staging = 1 deployment, 4 hours lead time
      expect(result.currentAmount).toBe(14400000);
    });

    it("excludes archived deployments from lead time", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create two deployments
      const pr1 = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deployment1 = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          version: "1.0.1",
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment1.deploymentId,
        pr1.pullRequestId
      );

      const pr2 = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deployment2 = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          version: "1.0.2",
          deployedAt: new Date("2024-01-15T15:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment2.deploymentId,
        pr2.pullRequestId
      );

      // Archive deployment2
      await ctx.prisma.deployment.update({
        where: { id: deployment2.deploymentId },
        data: { archivedAt: new Date() },
      });

      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only count deployment1
      expect(result.currentAmount).toBe(14400000); // 4 hours
    });

    it("excludes deployments without PRs from lead time calculation", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployment with PR
      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deploymentWithPr = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deploymentWithPr.deploymentId,
        pr.pullRequestId
      );

      // Create deployment without PR
      await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          version: "1.0.1",
          deployedAt: new Date("2024-01-15T15:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );

      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only count deployment with PR: 4 hours = 14,400,000 ms
      expect(result.currentAmount).toBe(14400000);
    });

    it("isolates data by workspace for lead time", async () => {
      const ctx1 = await createTestContextWithGitProfile();
      const ctx2 = await createTestContextWithGitProfile();
      const gitProfile1 = await seedGitProfile(ctx1);
      const gitProfile2 = await seedGitProfile(ctx2);
      const repo1 = await seedRepository(ctx1);
      const repo2 = await seedRepository(ctx2);
      const app1 = await seedApplication(ctx1, repo1.repositoryId);
      const app2 = await seedApplication(ctx2, repo2.repositoryId);
      const env1 = await seedEnvironment(ctx1, { isProduction: true });
      const env2 = await seedEnvironment(ctx2, { isProduction: true });

      // Create identical deployments in both workspaces
      for (const { ctx, gitProfile, app, env } of [
        { ctx: ctx1, gitProfile: gitProfile1, app: app1, env: env1 },
        { ctx: ctx2, gitProfile: gitProfile2, app: app2, env: env2 },
      ]) {
        const pr = await seedPullRequest(
          ctx,
          app.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T14:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      // Query workspace 1
      const result = await getLeadTimeMetric({
        workspaceId: ctx1.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only see workspace 1's data
      expect(result.currentAmount).toBe(14400000); // 4 hours
    });

    it("handles division by zero when previousAmount is 0", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Only create data in current period
      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Previous period has no data, so previousAmount = 0
      expect(result.previousAmount).toBe(0);
      // Change should be 0 when previousAmount is 0
      expect(result.change).toBe(0);
    });

    it("calculates negative changes correctly (improvements)", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Previous period: 6 hours lead time
      const prevPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-14T08:00:00Z") }
      );
      const prevDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-14T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        prevDeployment.deploymentId,
        prevPr.pullRequestId
      );

      // Current period: 2 hours lead time (improvement)
      const currPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T12:00:00Z") }
      );
      const currDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T14:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        currDeployment.deploymentId,
        currPr.pullRequestId
      );

      const result = await getLeadTimeMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Current: 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
      // Previous: 6 hours = 21,600,000 ms
      expect(result.previousAmount).toBe(21600000);
      // Change: (7,200,000 - 21,600,000) / 21,600,000 * 100 = -66.67%
      expect(result.change).toBeCloseTo(-66.67, 1);
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
          everyNthIncident: 5,
        }
      );

      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-01T00:00:00Z", to: "2024-02-01T00:00:00Z" },
        period: Period.WEEKLY,
      });

      // 4 weeks * 5 deployments/week = 20 deployments
      // Every 5th deployment causes an incident = 4 incidents
      // Failure rate = 4/20 = 20%
      expect(result.currentAmount).toBeCloseTo(20, 1);
      expect(result.columns.length).toBeGreaterThan(0);
      expect(result.data.length).toBe(result.columns.length); // Data aligns with columns
      // Verify columns are valid dates
      result.columns.forEach((col) => {
        expect(new Date(col).getTime()).not.toBeNaN();
      });
      // Verify data values are valid numbers
      result.data.forEach((d) => {
        expect(Number(d)).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(Number(d))).toBe(true);
      });
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

      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-01T00:00:00Z", to: "2024-01-15T00:00:00Z" },
        period: Period.WEEKLY,
      });

      // 2 weeks * 3 deployments/week = 6 deployments, 0 incidents
      expect(result.currentAmount).toBe(0);
      expect(result.previousAmount).toBe(0);
      expect(result.change).toBe(0);
    });

    it("calculates previous period comparison correctly", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Previous period: 10 deployments, 2 incidents (20% failure rate)
      await generateDeploymentTimeline(
        ctx,
        gitProfile,
        application,
        environment,
        repository.repositoryId,
        {
          startDate: new Date("2024-01-01T00:00:00Z"),
          weeks: 2,
          deploymentsPerWeek: 5,
          everyNthIncident: 5, // Every 5th = 2 incidents
        }
      );

      // Current period: 10 deployments, 1 incident (10% failure rate)
      await generateDeploymentTimeline(
        ctx,
        gitProfile,
        application,
        environment,
        repository.repositoryId,
        {
          startDate: new Date("2024-01-15T00:00:00Z"),
          weeks: 2,
          deploymentsPerWeek: 5,
          everyNthIncident: 10, // Every 10th = 1 incident
        }
      );

      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-29T00:00:00Z" },
        period: Period.WEEKLY,
      });

      // Current: 10% (1/10)
      expect(result.currentAmount).toBeCloseTo(10, 1);
      // Previous: 20% (2/10)
      expect(result.previousAmount).toBeCloseTo(20, 1);
      // Change: (10 - 20) / 20 * 100 = -50% (improvement)
      expect(result.change).toBeCloseTo(-50, 1);
    });

    it("handles 100% failure rate correctly", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create 3 deployments, all cause incidents
      for (let i = 0; i < 3; i++) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date(`2024-01-15T${10 + i}:00:00Z`) }
        );
        const deployment = await seedDeployment(
          ctx,
          application.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date(`2024-01-15T${12 + i}:00:00Z`),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date(`2024-01-15T${12 + i}:30:00Z`),
          resolvedAt: new Date(`2024-01-15T${13 + i}:00:00Z`),
        });
      }

      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // 3 deployments, 3 incidents = 100% failure rate
      expect(result.currentAmount).toBeCloseTo(100, 1);
    });

    it("filters by environmentIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const prodEnv = await seedEnvironment(ctx, { isProduction: true });
      const stagingEnv = await seedEnvironment(ctx, { isProduction: false });

      // Create deployments with incidents in both environments
      const prodPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const prodDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        prodEnv.environmentId,
        {
          deployedAt: new Date("2024-01-15T12:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        prodDeployment.deploymentId,
        prodPr.pullRequestId
      );
      await seedIncident(ctx, prodDeployment.deploymentId, {
        detectedAt: new Date("2024-01-15T12:30:00Z"),
        resolvedAt: new Date("2024-01-15T13:00:00Z"),
      });

      const stagingPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const stagingDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        stagingEnv.environmentId,
        {
          deployedAt: new Date("2024-01-15T12:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        stagingDeployment.deploymentId,
        stagingPr.pullRequestId
      );
      // No incident for staging

      // Filter by staging environment only
      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        environmentIds: [stagingEnv.environmentId],
      });

      // 1 deployment, 0 incidents = 0%
      expect(result.currentAmount).toBe(0);
    });

    it("filters by applicationIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
      });
      const app3 = await seedApplication(ctx, repository.repositoryId, {
        name: "app3",
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments with incidents for all apps
      for (const app of [app1, app2, app3]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T12:30:00Z"),
          resolvedAt: new Date("2024-01-15T13:00:00Z"),
        });
      }

      // Filter by app1 and app2 only
      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        applicationIds: [app1.applicationId, app2.applicationId],
      });

      // 2 deployments, 2 incidents = 100%
      expect(result.currentAmount).toBeCloseTo(100, 1);
    });

    it("filters by teamIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const team1 = await seedTeam(ctx, { name: "team1" });
      const team2 = await seedTeam(ctx, { name: "team2" });
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
        teamId: team1.teamId,
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
        teamId: team2.teamId,
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments with incidents for both teams
      for (const app of [app1, app2]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T12:30:00Z"),
          resolvedAt: new Date("2024-01-15T13:00:00Z"),
        });
      }

      // Filter by team1 only
      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        teamIds: [team1.teamId],
      });

      // 1 deployment, 1 incident = 100%
      expect(result.currentAmount).toBeCloseTo(100, 1);
    });

    it("filters by repositoryIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repo1 = await seedRepository(ctx, { name: "repo1" });
      const repo2 = await seedRepository(ctx, { name: "repo2" });
      const app1 = await seedApplication(ctx, repo1.repositoryId, {
        name: "app-repo1",
      });
      const app2 = await seedApplication(ctx, repo2.repositoryId, {
        name: "app-repo2",
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments with incidents for both repos
      for (const app of [app1, app2]) {
        const pr = await seedPullRequest(
          ctx,
          app.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T12:30:00Z"),
          resolvedAt: new Date("2024-01-15T13:00:00Z"),
        });
      }

      // Filter by repo1 only
      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        repositoryIds: [repo1.repositoryId],
      });

      // 1 deployment, 1 incident = 100%
      expect(result.currentAmount).toBeCloseTo(100, 1);
    });

    it("filters by combined teamIds and environmentIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const team1 = await seedTeam(ctx, { name: "team1" });
      const team2 = await seedTeam(ctx, { name: "team2" });
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
        teamId: team1.teamId,
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
        teamId: team2.teamId,
      });
      const prodEnv = await seedEnvironment(ctx, { isProduction: true });
      const stagingEnv = await seedEnvironment(ctx, { isProduction: false });

      // Create deployments with incidents: team1+prod, team1+staging, team2+prod, team2+staging
      const deployments = [
        { app: app1, env: prodEnv },
        { app: app1, env: stagingEnv },
        { app: app2, env: prodEnv },
        { app: app2, env: stagingEnv },
      ];

      for (const { app, env } of deployments) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T12:30:00Z"),
          resolvedAt: new Date("2024-01-15T13:00:00Z"),
        });
      }

      // Filter by team1 AND staging environment
      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        teamIds: [team1.teamId],
        environmentIds: [stagingEnv.environmentId],
      });

      // Should only match team1 + staging = 1 deployment, 1 incident = 100%
      expect(result.currentAmount).toBeCloseTo(100, 1);
    });

    it("excludes archived applications from change failure rate", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments with incidents for both apps
      for (const app of [app1, app2]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T12:30:00Z"),
          resolvedAt: new Date("2024-01-15T13:00:00Z"),
        });
      }

      // Archive app2
      await ctx.prisma.application.update({
        where: { id: app2.applicationId },
        data: { archivedAt: new Date() },
      });

      const result = await getChangeFailureRateMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only count app1: 1 deployment, 1 incident = 100%
      expect(result.currentAmount).toBeCloseTo(100, 1);
    });

    it("isolates data by workspace for change failure rate", async () => {
      const ctx1 = await createTestContextWithGitProfile();
      const ctx2 = await createTestContextWithGitProfile();
      const gitProfile1 = await seedGitProfile(ctx1);
      const gitProfile2 = await seedGitProfile(ctx2);
      const repo1 = await seedRepository(ctx1);
      const repo2 = await seedRepository(ctx2);
      const app1 = await seedApplication(ctx1, repo1.repositoryId);
      const app2 = await seedApplication(ctx2, repo2.repositoryId);
      const env1 = await seedEnvironment(ctx1, { isProduction: true });
      const env2 = await seedEnvironment(ctx2, { isProduction: true });

      // Create deployments with incidents in both workspaces
      for (const { ctx, gitProfile, app, env } of [
        { ctx: ctx1, gitProfile: gitProfile1, app: app1, env: env1 },
        { ctx: ctx2, gitProfile: gitProfile2, app: app2, env: env2 },
      ]) {
        const pr = await seedPullRequest(
          ctx,
          app.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T12:30:00Z"),
          resolvedAt: new Date("2024-01-15T13:00:00Z"),
        });
      }

      // Query workspace 1
      const result = await getChangeFailureRateMetric({
        workspaceId: ctx1.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only see workspace 1's data: 1 deployment, 1 incident = 100%
      expect(result.currentAmount).toBeCloseTo(100, 1);
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
      await generateIncidentResolutionTimeline(
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

      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-01T00:00:00Z", to: "2024-01-15T00:00:00Z" },
        period: Period.WEEKLY,
      });

      expect(result.currentAmount).toBeGreaterThan(0);
      expect(result.columns.length).toBeGreaterThan(0);
      expect(result.data.length).toBe(result.columns.length); // Data aligns with columns
      // Verify columns are valid dates
      result.columns.forEach((col) => {
        expect(new Date(col).getTime()).not.toBeNaN();
      });
      // Verify data values are valid numbers
      result.data.forEach((d) => {
        expect(Number.isFinite(Number(d))).toBe(true);
        expect(Number(d)).toBeGreaterThanOrEqual(0);
      });

      // MTTR is the time from incident detection to resolution in milliseconds.
      // With 5 deployments/week (roughly daily), the next deployment after an incident
      // will typically be the next day (~24 hours later), not the target 4 hours.
      // This is realistic behavior - MTTR depends on deployment frequency.
      const mttrHours = result.currentAmount / BigInt(1000 * 60 * 60);
      // With daily deployments, MTTR will be approximately 24 hours
      // (incident detected ~30 min after deploy, resolved at next day's deployment)
      expect(mttrHours).toBeGreaterThan(20); // At least 20 hours (next day deployment)
      expect(mttrHours).toBeLessThan(30); // Less than 30 hours (reasonable upper bound)
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
        { deployedAt, authorId: gitProfile.gitProfileId }
      );

      // Create resolved incident (2 hours recovery time)
      await seedIncident(ctx, deployment.deploymentId, {
        detectedAt: new Date("2024-01-15T10:30:00Z"),
        resolvedAt: new Date("2024-01-15T12:30:00Z"),
      });

      // Create unresolved incident (should be excluded)
      await seedIncident(ctx, deployment.deploymentId, {
        detectedAt: new Date("2024-01-15T11:00:00Z"),
        // resolvedAt is undefined
      });

      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // MTTR should only include the resolved incident
      // 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
      // Unresolved incident should not affect the calculation
      expect(result.previousAmount).toBe(0);
    });

    it("calculates MTTR for multiple incidents correctly", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create 3 incidents with different recovery times
      const incidents = [
        { detectedHour: 10, resolvedHour: 11, duration: 1 }, // 1 hour
        { detectedHour: 12, resolvedHour: 14, duration: 2 }, // 2 hours
        { detectedHour: 15, resolvedHour: 18, duration: 3 }, // 3 hours
      ];

      for (const incident of incidents) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          {
            createdAt: new Date(
              `2024-01-15T${incident.detectedHour.toString().padStart(2, "0")}:00:00Z`
            ),
          }
        );
        const deployment = await seedDeployment(
          ctx,
          application.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date(
              `2024-01-15T${incident.detectedHour.toString().padStart(2, "0")}:00:00Z`
            ),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date(
            `2024-01-15T${incident.detectedHour.toString().padStart(2, "0")}:00:00Z`
          ),
          resolvedAt: new Date(
            `2024-01-15T${incident.resolvedHour.toString().padStart(2, "0")}:00:00Z`
          ),
        });
      }

      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Average MTTR = (1 + 2 + 3) / 3 = 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
    });

    it("calculates previous period comparison correctly", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Previous period: 1 incident, 4 hours recovery
      // Current period is Jan 15-16, so previous is Jan 14-15
      const prevPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-14T10:00:00Z") }
      );
      const prevDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-14T10:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        prevDeployment.deploymentId,
        prevPr.pullRequestId
      );
      await seedIncident(ctx, prevDeployment.deploymentId, {
        detectedAt: new Date("2024-01-14T10:00:00Z"),
        resolvedAt: new Date("2024-01-14T14:00:00Z"), // 4 hours
      });

      // Current period: 1 incident, 2 hours recovery
      const currPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const currDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-15T10:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        currDeployment.deploymentId,
        currPr.pullRequestId
      );
      await seedIncident(ctx, currDeployment.deploymentId, {
        detectedAt: new Date("2024-01-15T10:00:00Z"),
        resolvedAt: new Date("2024-01-15T12:00:00Z"), // 2 hours
      });

      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Current: 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
      // Previous: 4 hours = 14,400,000 ms
      expect(result.previousAmount).toBe(14400000);
      // Change: (7,200,000 - 14,400,000) / 14,400,000 * 100 = -50% (improvement)
      expect(result.change).toBeCloseTo(-50, 1);
    });

    it("filters by environmentIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const prodEnv = await seedEnvironment(ctx, { isProduction: true });
      const stagingEnv = await seedEnvironment(ctx, { isProduction: false });

      // Create incidents in both environments
      const prodPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const prodDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        prodEnv.environmentId,
        {
          deployedAt: new Date("2024-01-15T10:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        prodDeployment.deploymentId,
        prodPr.pullRequestId
      );
      await seedIncident(ctx, prodDeployment.deploymentId, {
        detectedAt: new Date("2024-01-15T10:00:00Z"),
        resolvedAt: new Date("2024-01-15T12:00:00Z"), // 2 hours
      });

      const stagingPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const stagingDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        stagingEnv.environmentId,
        {
          deployedAt: new Date("2024-01-15T10:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        stagingDeployment.deploymentId,
        stagingPr.pullRequestId
      );
      await seedIncident(ctx, stagingDeployment.deploymentId, {
        detectedAt: new Date("2024-01-15T10:00:00Z"),
        resolvedAt: new Date("2024-01-15T14:00:00Z"), // 4 hours
      });

      // Filter by staging environment only
      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        environmentIds: [stagingEnv.environmentId],
      });

      // Should only count staging: 4 hours = 14,400,000 ms
      expect(result.currentAmount).toBe(14400000);
    });

    it("filters by applicationIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create incidents for both apps
      for (const app of [app1, app2]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T10:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T10:00:00Z"),
          resolvedAt: new Date("2024-01-15T12:00:00Z"), // 2 hours
        });
      }

      // Filter by app1 only
      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        applicationIds: [app1.applicationId],
      });

      // Should only count app1: 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
    });

    it("filters by teamIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const team1 = await seedTeam(ctx, { name: "team1" });
      const team2 = await seedTeam(ctx, { name: "team2" });
      const team3 = await seedTeam(ctx, { name: "team3" });
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
        teamId: team1.teamId,
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
        teamId: team2.teamId,
      });
      const app3 = await seedApplication(ctx, repository.repositoryId, {
        name: "app3",
        teamId: team3.teamId,
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create incidents for all teams
      for (const app of [app1, app2, app3]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T10:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T10:00:00Z"),
          resolvedAt: new Date("2024-01-15T12:00:00Z"), // 2 hours
        });
      }

      // Filter by team1 and team2 only
      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        teamIds: [team1.teamId, team2.teamId],
      });

      // Average of 2 incidents, both 2 hours = 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
    });

    it("filters by repositoryIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repo1 = await seedRepository(ctx, { name: "repo1" });
      const repo2 = await seedRepository(ctx, { name: "repo2" });
      const app1 = await seedApplication(ctx, repo1.repositoryId, {
        name: "app-repo1",
      });
      const app2 = await seedApplication(ctx, repo2.repositoryId, {
        name: "app-repo2",
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create incidents for both repos
      for (const app of [app1, app2]) {
        const pr = await seedPullRequest(
          ctx,
          app.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T10:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T10:00:00Z"),
          resolvedAt: new Date("2024-01-15T12:00:00Z"), // 2 hours
        });
      }

      // Filter by repo1 only
      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        repositoryIds: [repo1.repositoryId],
      });

      // Should only count repo1: 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
    });

    it("filters by combined teamIds and environmentIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const team1 = await seedTeam(ctx, { name: "team1" });
      const team2 = await seedTeam(ctx, { name: "team2" });
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
        teamId: team1.teamId,
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
        teamId: team2.teamId,
      });
      const prodEnv = await seedEnvironment(ctx, { isProduction: true });
      const stagingEnv = await seedEnvironment(ctx, { isProduction: false });

      // Create incidents: team1+prod, team1+staging, team2+prod, team2+staging
      const deployments = [
        { app: app1, env: prodEnv },
        { app: app1, env: stagingEnv },
        { app: app2, env: prodEnv },
        { app: app2, env: stagingEnv },
      ];

      for (const { app, env } of deployments) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T10:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T10:00:00Z"),
          resolvedAt: new Date("2024-01-15T12:00:00Z"), // 2 hours
        });
      }

      // Filter by team1 AND staging environment
      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        teamIds: [team1.teamId],
        environmentIds: [stagingEnv.environmentId],
      });

      // Should only match team1 + staging = 1 incident, 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
    });

    it("excludes archived environments from MTTR", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const env1 = await seedEnvironment(ctx, { isProduction: true });
      const env2 = await seedEnvironment(ctx, { isProduction: true });

      // Create incidents in both environments
      for (const env of [env1, env2]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          application.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T10:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T10:00:00Z"),
          resolvedAt: new Date("2024-01-15T12:00:00Z"), // 2 hours
        });
      }

      // Archive env2
      await ctx.prisma.environment.update({
        where: { id: env2.environmentId },
        data: { archivedAt: new Date() },
      });

      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only count env1: 1 incident, 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
    });

    it("isolates data by workspace for MTTR", async () => {
      const ctx1 = await createTestContextWithGitProfile();
      const ctx2 = await createTestContextWithGitProfile();
      const gitProfile1 = await seedGitProfile(ctx1);
      const gitProfile2 = await seedGitProfile(ctx2);
      const repo1 = await seedRepository(ctx1);
      const repo2 = await seedRepository(ctx2);
      const app1 = await seedApplication(ctx1, repo1.repositoryId);
      const app2 = await seedApplication(ctx2, repo2.repositoryId);
      const env1 = await seedEnvironment(ctx1, { isProduction: true });
      const env2 = await seedEnvironment(ctx2, { isProduction: true });

      // Create incidents in both workspaces
      for (const { ctx, gitProfile, app, env } of [
        { ctx: ctx1, gitProfile: gitProfile1, app: app1, env: env1 },
        { ctx: ctx2, gitProfile: gitProfile2, app: app2, env: env2 },
      ]) {
        const pr = await seedPullRequest(
          ctx,
          app.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T10:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
        await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date("2024-01-15T10:00:00Z"),
          resolvedAt: new Date("2024-01-15T12:00:00Z"), // 2 hours
        });
      }

      // Query workspace 1
      const result = await getMeanTimeToRecoverMetric({
        workspaceId: ctx1.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only see workspace 1's data: 2 hours = 7,200,000 ms
      expect(result.currentAmount).toBe(7200000);
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

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-01T00:00:00Z", to: "2024-02-01T00:00:00Z" },
        period: Period.WEEKLY,
      });

      // 4 weeks * 5 deployments/week = 20 deployments
      expect(result.currentAmount).toBe(20);
      expect(result.columns.length).toBeGreaterThan(0);
      expect(result.data.length).toBe(result.columns.length); // Data aligns with columns
      // Chart data should show 5 deployments per week
      const weeklyData = result.data.filter((d) => Number(d) > 0);
      expect(weeklyData.length).toBe(4); // Exactly 4 weeks with data
      // Verify each week has 5 deployments
      weeklyData.forEach((count) => {
        expect(Number(count)).toBe(5);
      });
      // Verify columns are valid dates
      result.columns.forEach((col) => {
        expect(new Date(col).getTime()).not.toBeNaN();
      });
    });

    it("calculates average deployments per day correctly", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Generate 7 days of deployments (1 per day)
      for (let i = 0; i < 7; i++) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date(`2024-01-${15 + i}T10:00:00Z`) }
        );
        const deployment = await seedDeployment(
          ctx,
          application.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date(`2024-01-${15 + i}T12:00:00Z`),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-22T00:00:00Z" },
        period: Period.DAILY,
      });

      // 7 deployments over 7 days = 1 deployment per day
      expect(result.currentAmount).toBe(7);
      expect(result.avg).toBeCloseTo(1, 2);
      // Verify chart data structure
      expect(result.columns.length).toBeGreaterThan(0);
      expect(result.data.length).toBe(result.columns.length); // Data aligns with columns
      // Verify each day has 1 deployment in chart data
      const dailyData = result.data.filter((d) => Number(d) > 0);
      expect(dailyData.length).toBeGreaterThanOrEqual(7);
      // Verify columns are valid dates
      result.columns.forEach((col) => {
        expect(new Date(col).getTime()).not.toBeNaN();
      });
    });

    it("calculates previous period comparison correctly", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Previous period: 5 deployments
      // Current period is Jan 15-22 (7 days), so previous is Jan 8-15
      await generateDeploymentTimeline(
        ctx,
        gitProfile,
        application,
        environment,
        repository.repositoryId,
        {
          startDate: new Date("2024-01-08T00:00:00Z"),
          weeks: 1,
          deploymentsPerWeek: 5,
        }
      );

      // Current period: 10 deployments
      await generateDeploymentTimeline(
        ctx,
        gitProfile,
        application,
        environment,
        repository.repositoryId,
        {
          startDate: new Date("2024-01-15T00:00:00Z"),
          weeks: 1,
          deploymentsPerWeek: 10,
        }
      );

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-22T00:00:00Z" },
        period: Period.WEEKLY,
      });

      // Current: 10 deployments
      expect(result.currentAmount).toBe(10);
      // Previous: 5 deployments
      expect(result.previousAmount).toBe(5);
      // Change: (10 - 5) / 5 * 100 = 100% increase
      expect(result.change).toBeCloseTo(100, 1);
    });

    it("handles zero deployments correctly", async () => {
      const ctx = await createTestContextWithGitProfile();

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-22T00:00:00Z" },
        period: Period.WEEKLY,
      });

      expect(result.currentAmount).toBe(0);
      expect(result.previousAmount).toBe(0);
      expect(result.change).toBe(0);
      expect(result.avg).toBe(0);
    });

    it("filters by production environment only by default", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const productionEnv = await seedEnvironment(ctx, { isProduction: true });
      const stagingEnv = await seedEnvironment(ctx, { isProduction: false });

      // Create deployments in both environments
      for (const env of [productionEnv, stagingEnv]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          application.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only count production deployment
      expect(result.currentAmount).toBe(1);
    });

    it("filters by environmentIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const prodEnv = await seedEnvironment(ctx, { isProduction: true });
      const stagingEnv = await seedEnvironment(ctx, { isProduction: false });

      // Create deployments in both environments
      const prodPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const prodDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        prodEnv.environmentId,
        {
          deployedAt: new Date("2024-01-15T12:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        prodDeployment.deploymentId,
        prodPr.pullRequestId
      );

      const stagingPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-15T10:00:00Z") }
      );
      const stagingDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        stagingEnv.environmentId,
        {
          deployedAt: new Date("2024-01-15T12:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        stagingDeployment.deploymentId,
        stagingPr.pullRequestId
      );

      // Filter by staging environment only
      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        environmentIds: [stagingEnv.environmentId],
      });

      expect(result.currentAmount).toBe(1);
    });

    it("filters by multiple environmentIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const env1 = await seedEnvironment(ctx, { isProduction: true });
      const env2 = await seedEnvironment(ctx, { isProduction: false });
      const env3 = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments in all environments
      for (const env of [env1, env2, env3]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          application.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      // Filter by env1 and env2 only
      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        environmentIds: [env1.environmentId, env2.environmentId],
      });

      expect(result.currentAmount).toBe(2);
    });

    it("filters by applicationIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments for both apps
      for (const app of [app1, app2]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      // Filter by app1 only
      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        applicationIds: [app1.applicationId],
      });

      expect(result.currentAmount).toBe(1);
    });

    it("filters by teamIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const team1 = await seedTeam(ctx, { name: "team1" });
      const team2 = await seedTeam(ctx, { name: "team2" });
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
        teamId: team1.teamId,
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
        teamId: team2.teamId,
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments for both teams
      for (const app of [app1, app2]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      // Filter by team1 only
      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        teamIds: [team1.teamId],
      });

      expect(result.currentAmount).toBe(1);
    });

    it("filters by repositoryIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repo1 = await seedRepository(ctx, { name: "repo1" });
      const repo2 = await seedRepository(ctx, { name: "repo2" });
      const repo3 = await seedRepository(ctx, { name: "repo3" });
      const app1 = await seedApplication(ctx, repo1.repositoryId, {
        name: "app-repo1",
      });
      const app2 = await seedApplication(ctx, repo2.repositoryId, {
        name: "app-repo2",
      });
      const app3 = await seedApplication(ctx, repo3.repositoryId, {
        name: "app-repo3",
      });
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments for all repos
      for (const app of [app1, app2, app3]) {
        const pr = await seedPullRequest(
          ctx,
          app.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      // Filter by repo1 and repo2 only
      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        repositoryIds: [repo1.repositoryId, repo2.repositoryId],
      });

      expect(result.currentAmount).toBe(2);
    });

    it("filters by combined teamIds and environmentIds", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const team1 = await seedTeam(ctx, { name: "team1" });
      const team2 = await seedTeam(ctx, { name: "team2" });
      const app1 = await seedApplication(ctx, repository.repositoryId, {
        name: "app1",
        teamId: team1.teamId,
      });
      const app2 = await seedApplication(ctx, repository.repositoryId, {
        name: "app2",
        teamId: team2.teamId,
      });
      const prodEnv = await seedEnvironment(ctx, { isProduction: true });
      const stagingEnv = await seedEnvironment(ctx, { isProduction: false });

      // Create deployments: team1+prod, team1+staging, team2+prod, team2+staging
      const deployments = [
        { app: app1, env: prodEnv },
        { app: app1, env: stagingEnv },
        { app: app2, env: prodEnv },
        { app: app2, env: stagingEnv },
      ];

      for (const { app, env } of deployments) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      // Filter by team1 AND staging environment
      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
        teamIds: [team1.teamId],
        environmentIds: [stagingEnv.environmentId],
      });

      // Should only match team1 + staging = 1 deployment
      expect(result.currentAmount).toBe(1);
    });

    it("excludes archived environments from deployment frequency", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const env1 = await seedEnvironment(ctx, { isProduction: true });
      const env2 = await seedEnvironment(ctx, { isProduction: true });

      // Create deployments in both environments
      for (const env of [env1, env2]) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          application.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      // Archive env2
      await ctx.prisma.environment.update({
        where: { id: env2.environmentId },
        data: { archivedAt: new Date() },
      });

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only count env1
      expect(result.currentAmount).toBe(1);
    });

    it("calculates metrics with MONTHLY period", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Generate deployments across 3 months
      const months = [
        { month: 1, day: 15, count: 5 },
        { month: 2, day: 15, count: 5 },
        { month: 3, day: 15, count: 5 },
      ];

      for (const { month, day, count } of months) {
        for (let i = 0; i < count; i++) {
          const pr = await seedPullRequest(
            ctx,
            repository.repositoryId,
            gitProfile.gitProfileId,
            {
              createdAt: new Date(
                `2024-${month.toString().padStart(2, "0")}-${day}T${10 + i}:00:00Z`
              ),
            }
          );
          const deployment = await seedDeployment(
            ctx,
            application.applicationId,
            environment.environmentId,
            {
              version: `1.0.${month}-${i}`,
              deployedAt: new Date(
                `2024-${month.toString().padStart(2, "0")}-${day}T${12 + i}:00:00Z`
              ),
              authorId: gitProfile.gitProfileId,
            }
          );
          await seedDeploymentPullRequest(
            ctx,
            deployment.deploymentId,
            pr.pullRequestId
          );
        }
      }

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-01T00:00:00Z", to: "2024-04-01T00:00:00Z" },
        period: Period.MONTHLY,
      });

      expect(result.currentAmount).toBe(15);
      expect(result.columns.length).toBeGreaterThanOrEqual(3);
      expect(result.data.length).toBe(result.columns.length);
    });

    it("calculates metrics with QUARTERLY period", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Generate deployments across 2 quarters
      const quarters = [
        { quarter: 1, month: 2, day: 15, count: 10 },
        { quarter: 2, month: 5, day: 15, count: 10 },
      ];

      for (const { month, day, count } of quarters) {
        for (let i = 0; i < count; i++) {
          const pr = await seedPullRequest(
            ctx,
            repository.repositoryId,
            gitProfile.gitProfileId,
            {
              createdAt: new Date(
                `2024-${month.toString().padStart(2, "0")}-${day}T${10 + i}:00:00Z`
              ),
            }
          );
          const deployment = await seedDeployment(
            ctx,
            application.applicationId,
            environment.environmentId,
            {
              version: `1.0.${month}-${i}`,
              deployedAt: new Date(
                `2024-${month.toString().padStart(2, "0")}-${day}T${12 + i}:00:00Z`
              ),
              authorId: gitProfile.gitProfileId,
            }
          );
          await seedDeploymentPullRequest(
            ctx,
            deployment.deploymentId,
            pr.pullRequestId
          );
        }
      }

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-01T00:00:00Z", to: "2024-07-01T00:00:00Z" },
        period: Period.QUARTERLY,
      });

      expect(result.currentAmount).toBe(20);
      expect(result.columns.length).toBeGreaterThanOrEqual(2);
      expect(result.data.length).toBe(result.columns.length);
    });

    it("calculates metrics with YEARLY period", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Generate deployments across 2 years
      for (const year of [2023, 2024]) {
        for (let i = 0; i < 5; i++) {
          const pr = await seedPullRequest(
            ctx,
            repository.repositoryId,
            gitProfile.gitProfileId,
            { createdAt: new Date(`${year}-06-15T${10 + i}:00:00Z`) }
          );
          const deployment = await seedDeployment(
            ctx,
            application.applicationId,
            environment.environmentId,
            {
              version: `1.0.${year}-${i}`,
              deployedAt: new Date(`${year}-06-15T${12 + i}:00:00Z`),
              authorId: gitProfile.gitProfileId,
            }
          );
          await seedDeploymentPullRequest(
            ctx,
            deployment.deploymentId,
            pr.pullRequestId
          );
        }
      }

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2023-01-01T00:00:00Z", to: "2025-01-01T00:00:00Z" },
        period: Period.YEARLY,
      });

      expect(result.currentAmount).toBe(10);
      expect(result.columns.length).toBeGreaterThanOrEqual(2);
      expect(result.data.length).toBe(result.columns.length);
    });

    it("isolates data by workspace for deployment frequency", async () => {
      const ctx1 = await createTestContextWithGitProfile();
      const ctx2 = await createTestContextWithGitProfile();
      const gitProfile1 = await seedGitProfile(ctx1);
      const gitProfile2 = await seedGitProfile(ctx2);
      const repo1 = await seedRepository(ctx1);
      const repo2 = await seedRepository(ctx2);
      const app1 = await seedApplication(ctx1, repo1.repositoryId);
      const app2 = await seedApplication(ctx2, repo2.repositoryId);
      const env1 = await seedEnvironment(ctx1, { isProduction: true });
      const env2 = await seedEnvironment(ctx2, { isProduction: true });

      // Create deployments in both workspaces
      for (const { ctx, gitProfile, app, env } of [
        { ctx: ctx1, gitProfile: gitProfile1, app: app1, env: env1 },
        { ctx: ctx2, gitProfile: gitProfile2, app: app2, env: env2 },
      ]) {
        const pr = await seedPullRequest(
          ctx,
          app.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date("2024-01-15T10:00:00Z") }
        );
        const deployment = await seedDeployment(
          ctx,
          app.applicationId,
          env.environmentId,
          {
            deployedAt: new Date("2024-01-15T12:00:00Z"),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      // Query workspace 1
      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx1.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Should only see workspace 1's data
      expect(result.currentAmount).toBe(1);
    });

    it("handles large percentage changes", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);
      const application = await seedApplication(ctx, repository.repositoryId);
      const environment = await seedEnvironment(ctx, { isProduction: true });

      // Previous period: 1 deployment
      const prevPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        { createdAt: new Date("2024-01-14T10:00:00Z") }
      );
      const prevDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          deployedAt: new Date("2024-01-14T12:00:00Z"),
          authorId: gitProfile.gitProfileId,
        }
      );
      await seedDeploymentPullRequest(
        ctx,
        prevDeployment.deploymentId,
        prevPr.pullRequestId
      );

      // Current period: 10 deployments (1000% increase)
      for (let i = 0; i < 10; i++) {
        const pr = await seedPullRequest(
          ctx,
          repository.repositoryId,
          gitProfile.gitProfileId,
          { createdAt: new Date(`2024-01-15T${10 + i}:00:00Z`) }
        );
        const deployment = await seedDeployment(
          ctx,
          application.applicationId,
          environment.environmentId,
          {
            deployedAt: new Date(`2024-01-15T${12 + i}:00:00Z`),
            authorId: gitProfile.gitProfileId,
          }
        );
        await seedDeploymentPullRequest(
          ctx,
          deployment.deploymentId,
          pr.pullRequestId
        );
      }

      const result = await getDeploymentFrequencyMetric({
        workspaceId: ctx.workspaceId,
        dateRange: { from: "2024-01-15T00:00:00Z", to: "2024-01-16T00:00:00Z" },
        period: Period.DAILY,
      });

      // Current: 10 deployments
      expect(result.currentAmount).toBe(10);
      // Previous: 1 deployment
      expect(result.previousAmount).toBe(1);
      // Change: (10 - 1) / 1 * 100 = 900%
      expect(result.change).toBeCloseTo(900, 1);
      // Should not be NaN or Infinity
      expect(Number.isFinite(result.change)).toBe(true);
    });
  });
});
