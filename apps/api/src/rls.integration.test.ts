import {
  GitProvider,
  Prisma,
  PrismaClient,
  PullRequestState,
  PullRequestSize,
  CodeReviewState,
  TeamMemberRole,
  IntegrationApp,
  AutomationType,
  DigestType,
  AlertType,
  DayOfTheWeek,
  Frequency,
  ActivityEventType,
} from "@prisma/client";
import { randomUUID } from "crypto";
import { describe, expect, it, beforeEach } from "vitest";
import { getSudoPrismaClient } from "../test/integration-setup/prisma-client";
import { getBypassRlsPrisma, getPrisma } from "./prisma";

/**
 * Tables explicitly excluded from RLS.
 * When adding a new table, you must add it here or to the `entities` array
 * in the "tenant isolation" tests — otherwise the guard test will fail.
 */
const NON_RLS_TABLES = [
  "GitProfile",
  "User",
  "Organization",
  "_prisma_migrations",
];

type RlsSettings = {
  workspace_id: string | null;
  bypass_rls: string | null;
};

const selectRlsSql = Prisma.sql`
  SELECT
    current_setting('app.current_workspace_id', true) AS workspace_id,
    current_setting('app.bypass_rls', true) AS bypass_rls
`;

describe("Row Level Security", () => {
  describe("set_config visibility in raw queries", () => {
    it("getBypassRlsPrisma sets bypass_rls for standalone $queryRaw", async () => {
      const prisma = getBypassRlsPrisma();
      const result = await prisma.$queryRaw<RlsSettings[]>(selectRlsSql);

      expect(result[0].bypass_rls).toBe("on");
      expect(result[0].workspace_id).toBe("0");
    });

    it("getBypassRlsPrisma sets bypass_rls within interactive transactions", async () => {
      const prisma = getBypassRlsPrisma();
      const result = await prisma.$transaction(async (tx) => {
        return tx.$queryRaw<RlsSettings[]>(selectRlsSql);
      });

      expect(result[0].bypass_rls).toBe("on");
      expect(result[0].workspace_id).toBe("0");
    });

    it("getBypassRlsPrisma sets bypass_rls within batch transactions", async () => {
      const prisma = getBypassRlsPrisma();
      const [result] = await prisma.$transaction([
        prisma.$queryRaw<RlsSettings[]>(selectRlsSql),
      ]);

      expect(result[0].bypass_rls).toBe("on");
      expect(result[0].workspace_id).toBe("0");
    });

    it("getPrisma sets workspace_id for standalone $queryRaw", async () => {
      const prisma = getPrisma(42);
      const result = await prisma.$queryRaw<RlsSettings[]>(selectRlsSql);

      expect(result[0].workspace_id).toBe("42");
      expect(result[0].bypass_rls).toBeFalsy();
    });

    it("getPrisma returns base prisma without RLS session variables", async () => {
      const prisma = getPrisma();
      const result = await prisma.$queryRaw<RlsSettings[]>(selectRlsSql);

      expect(result[0].workspace_id).toBeFalsy();
      expect(result[0].bypass_rls).toBeFalsy();
    });
  });

  describe("tenant isolation", () => {
    let workspaceA: number;
    let workspaceB: number;
    const ids: Record<string, number> = {};

    beforeEach(async () => {
      const uid = () => randomUUID();

      // Workspaces need bypass (policy checks id = current_workspace_id)
      const bypass = getBypassRlsPrisma();
      const [wsA, wsB] = await Promise.all([
        bypass.workspace.create({
          data: { gitProvider: GitProvider.GITHUB, settings: {} },
        }),
        bypass.workspace.create({
          data: { gitProvider: GitProvider.GITHUB, settings: {} },
        }),
      ]);
      workspaceA = wsA.id;
      workspaceB = wsB.id;

      const prisma = getPrisma(workspaceA);

      // GitProfile (no RLS)
      const gitProfile = await prisma.gitProfile.create({
        data: {
          gitProvider: GitProvider.GITHUB,
          gitUserId: `user-${uid()}`,
          handle: "test-user",
          name: "Test User",
        },
      });

      const reviewer = await prisma.gitProfile.create({
        data: {
          gitProvider: GitProvider.GITHUB,
          gitUserId: `reviewer-${uid()}`,
          handle: "reviewer",
          name: "Reviewer",
        },
      });

      // Level 1: direct workspace children
      const [
        installation,
        repository,
        team,
        environment,
        syncBatch,
        automation,
        integration,
        subscription,
      ] = await Promise.all([
        prisma.installation.create({
          data: {
            gitInstallationId: `inst-${uid()}`,
            gitProvider: GitProvider.GITHUB,
            targetId: "target-1",
            targetType: "ORGANIZATION",
            repositorySelection: "all",
            permissions: {},
            events: {},
            workspaceId: workspaceA,
          },
        }),
        prisma.repository.create({
          data: {
            gitProvider: GitProvider.GITHUB,
            gitRepositoryId: `repo-${uid()}`,
            name: "test-repo",
            fullName: "org/test-repo",
            isPrivate: false,
            isFork: false,
            isMirror: false,
            starCount: 0,
            createdAt: new Date(),
            workspaceId: workspaceA,
          },
        }),
        prisma.team.create({
          data: {
            name: `team-${uid()}`,
            icon: "T",
            startColor: "#000",
            endColor: "#fff",
            workspaceId: workspaceA,
          },
        }),
        prisma.environment.create({
          data: {
            name: `env-${uid()}`,
            isProduction: true,
            workspaceId: workspaceA,
          },
        }),
        prisma.syncBatch.create({
          data: {
            sinceDaysAgo: 30,
            scheduledAt: new Date(),
            metadata: {},
            workspaceId: workspaceA,
          },
        }),
        prisma.automation.create({
          data: {
            type: AutomationType.PR_TITLE_CHECK,
            enabled: true,
            settings: {},
            workspaceId: workspaceA,
          },
        }),
        prisma.integration.create({
          data: {
            app: IntegrationApp.SLACK,
            data: {},
            workspaceId: workspaceA,
          },
        }),
        prisma.subscription.create({
          data: {
            customerId: `cus-${uid()}`,
            subscriptionId: `sub-${uid()}`,
            priceId: "price_1",
            status: "active",
            interval: "monthly",
            quantity: 1,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(),
            startedAt: new Date(),
            object: {},
            workspaceId: workspaceA,
          },
        }),
      ]);

      // Level 2
      const [
        application,
        pullRequest,
        teamMember,
        membership,
        activityEvent,
        alert,
        apiKey,
        digest,
      ] = await Promise.all([
        prisma.application.create({
          data: {
            name: `app-${uid()}`,
            repositoryId: repository.id,
            deploymentSettings: {},
            workspaceId: workspaceA,
          },
        }),
        prisma.pullRequest.create({
          data: {
            gitProvider: GitProvider.GITHUB,
            gitPullRequestId: `pr-${uid()}`,
            gitUrl: "https://github.com/org/repo/pull/1",
            title: "Test PR",
            number: "1",
            files: [],
            commentCount: 0,
            changedFilesCount: 1,
            linesAddedCount: 10,
            linesDeletedCount: 5,
            state: PullRequestState.MERGED,
            createdAt: new Date(),
            updatedAt: new Date(),
            repositoryId: repository.id,
            authorId: gitProfile.id,
            workspaceId: workspaceA,
          },
        }),
        prisma.teamMember.create({
          data: {
            role: TeamMemberRole.ENGINEER,
            teamId: team.id,
            gitProfileId: gitProfile.id,
            workspaceId: workspaceA,
          },
        }),
        prisma.workspaceMembership.create({
          data: {
            gitProfileId: gitProfile.id,
            workspaceId: workspaceA,
          },
        }),
        prisma.activityEvent.create({
          data: {
            type: ActivityEventType.PULL_REQUEST_CREATED,
            metadata: {},
            gitProfileId: gitProfile.id,
            workspaceId: workspaceA,
          },
        }),
        prisma.alert.create({
          data: {
            type: AlertType.SLOW_REVIEW,
            enabled: true,
            channel: "#test",
            settings: {},
            teamId: team.id,
            workspaceId: workspaceA,
          },
        }),
        prisma.apiKey.create({
          data: {
            key: `key-${uid()}`,
            name: "Test Key",
            creatorId: gitProfile.id,
            workspaceId: workspaceA,
          },
        }),
        prisma.digest.create({
          data: {
            type: DigestType.TEAM_METRICS,
            enabled: true,
            channel: "#test",
            frequency: Frequency.WEEKLY,
            dayOfTheWeek: [DayOfTheWeek.MONDAY],
            timeOfDay: "09:00",
            timezone: "UTC",
            settings: {},
            teamId: team.id,
            workspaceId: workspaceA,
          },
        }),
      ]);

      // Level 3
      const [tracking, codeReview, codeReviewRequest, deployment, alertEvent] =
        await Promise.all([
          prisma.pullRequestTracking.create({
            data: {
              changedFilesCount: 1,
              linesAddedCount: 10,
              linesDeletedCount: 5,
              size: PullRequestSize.SMALL,
              pullRequestId: pullRequest.id,
              workspaceId: workspaceA,
            },
          }),
          prisma.codeReview.create({
            data: {
              commentCount: 1,
              state: CodeReviewState.APPROVED,
              createdAt: new Date(),
              pullRequestId: pullRequest.id,
              authorId: gitProfile.id,
              workspaceId: workspaceA,
            },
          }),
          prisma.codeReviewRequest.create({
            data: {
              createdAt: new Date(),
              pullRequestId: pullRequest.id,
              reviewerId: reviewer.id,
              workspaceId: workspaceA,
            },
          }),
          prisma.deployment.create({
            data: {
              applicationId: application.id,
              version: "1.0.0",
              commitHash: `commit-${uid()}`,
              environmentId: environment.id,
              deployedAt: new Date(),
              workspaceId: workspaceA,
            },
          }),
          prisma.alertEvent.create({
            data: {
              alertId: alert.id,
              pullRequestId: pullRequest.id,
              workspaceId: workspaceA,
            },
          }),
        ]);

      // Level 4
      const [incident, deploymentPullRequest] = await Promise.all([
        prisma.incident.create({
          data: {
            causeDeploymentId: deployment.id,
            detectedAt: new Date(),
            workspaceId: workspaceA,
          },
        }),
        prisma.deploymentPullRequest.create({
          data: {
            deploymentId: deployment.id,
            pullRequestId: pullRequest.id,
            workspaceId: workspaceA,
          },
        }),
      ]);

      Object.assign(ids, {
        installation: installation.id,
        repository: repository.id,
        team: team.id,
        environment: environment.id,
        syncBatch: syncBatch.id,
        automation: automation.id,
        integration: integration.id,
        subscription: subscription.id,
        application: application.id,
        pullRequest: pullRequest.id,
        teamMember: teamMember.id,
        membership: membership.id,
        activityEvent: activityEvent.id,
        alert: alert.id,
        apiKey: apiKey.id,
        digest: digest.id,
        tracking: tracking.id,
        codeReview: codeReview.id,
        codeReviewRequest: codeReviewRequest.id,
        deployment: deployment.id,
        alertEvent: alertEvent.id,
        incident: incident.id,
        deploymentPullRequest: deploymentPullRequest.id,
      });
    });

    type EntityCase = {
      name: string;
      find: (p: PrismaClient) => Promise<unknown>;
    };

    const entities: EntityCase[] = [
      {
        name: "Workspace",
        find: (p) => p.workspace.findFirst({ where: { id: workspaceA } }),
      },
      {
        name: "Installation",
        find: (p) =>
          p.installation.findFirst({ where: { id: ids.installation } }),
      },
      {
        name: "WorkspaceMembership",
        find: (p) =>
          p.workspaceMembership.findFirst({ where: { id: ids.membership } }),
      },
      {
        name: "Repository",
        find: (p) => p.repository.findFirst({ where: { id: ids.repository } }),
      },
      {
        name: "PullRequest",
        find: (p) =>
          p.pullRequest.findFirst({ where: { id: ids.pullRequest } }),
      },
      {
        name: "PullRequestTracking",
        find: (p) =>
          p.pullRequestTracking.findFirst({ where: { id: ids.tracking } }),
      },
      {
        name: "CodeReview",
        find: (p) => p.codeReview.findFirst({ where: { id: ids.codeReview } }),
      },
      {
        name: "CodeReviewRequest",
        find: (p) =>
          p.codeReviewRequest.findFirst({
            where: { id: ids.codeReviewRequest },
          }),
      },
      {
        name: "Team",
        find: (p) => p.team.findFirst({ where: { id: ids.team } }),
      },
      {
        name: "TeamMember",
        find: (p) => p.teamMember.findFirst({ where: { id: ids.teamMember } }),
      },
      {
        name: "Integration",
        find: (p) =>
          p.integration.findFirst({ where: { id: ids.integration } }),
      },
      {
        name: "Subscription",
        find: (p) =>
          p.subscription.findFirst({ where: { id: ids.subscription } }),
      },
      {
        name: "Digest",
        find: (p) => p.digest.findFirst({ where: { id: ids.digest } }),
      },
      {
        name: "Automation",
        find: (p) => p.automation.findFirst({ where: { id: ids.automation } }),
      },
      {
        name: "Alert",
        find: (p) => p.alert.findFirst({ where: { id: ids.alert } }),
      },
      {
        name: "AlertEvent",
        find: (p) => p.alertEvent.findFirst({ where: { id: ids.alertEvent } }),
      },
      {
        name: "ActivityEvent",
        find: (p) =>
          p.activityEvent.findFirst({ where: { id: ids.activityEvent } }),
      },
      {
        name: "ApiKey",
        find: (p) => p.apiKey.findFirst({ where: { id: ids.apiKey } }),
      },
      {
        name: "SyncBatch",
        find: (p) => p.syncBatch.findFirst({ where: { id: ids.syncBatch } }),
      },
      {
        name: "Environment",
        find: (p) =>
          p.environment.findFirst({ where: { id: ids.environment } }),
      },
      {
        name: "Application",
        find: (p) =>
          p.application.findFirst({ where: { id: ids.application } }),
      },
      {
        name: "Deployment",
        find: (p) => p.deployment.findFirst({ where: { id: ids.deployment } }),
      },
      {
        name: "Incident",
        find: (p) => p.incident.findFirst({ where: { id: ids.incident } }),
      },
      {
        name: "DeploymentPullRequest",
        find: (p) =>
          p.deploymentPullRequest.findFirst({
            where: { id: ids.deploymentPullRequest },
          }),
      },
    ];

    for (const { name, find } of entities) {
      it(`${name}: tenant A reads own, tenant B cannot`, async () => {
        const findByA = find(getPrisma(workspaceA));
        const findByB = find(getPrisma(workspaceB));

        expect(await findByA).not.toBeNull();
        expect(await findByB).toBeNull();
      });
    }

    it("bypass can read across tenants", async () => {
      const prisma = getBypassRlsPrisma();
      const workspaces = await prisma.workspace.findMany({
        where: { id: { in: [workspaceA, workspaceB] } },
      });
      expect(workspaces).toHaveLength(2);
    });

    it("no RLS context errors on workspace query", async () => {
      await expect(
        getPrisma().workspace.findFirst({ where: { id: workspaceA } })
      ).rejects.toThrow();
    });

    it("every table is either tested for RLS or explicitly excluded", async () => {
      const sudoPrisma = getSudoPrismaClient();
      const tables = await sudoPrisma.$queryRaw<{ tablename: string }[]>`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
      `;

      const allTableNames = tables.map((t) => t.tablename);
      const testedEntities = entities.map((e) => e.name);
      const accounted = new Set([...testedEntities, ...NON_RLS_TABLES]);

      const missing = allTableNames.filter((t) => !accounted.has(t));

      expect(
        missing,
        `These tables are not covered by RLS tests or NON_RLS_TABLES: ${missing.join(", ")}. ` +
          `Add them to the entities array (with RLS) or NON_RLS_TABLES (without RLS).`
      ).toEqual([]);
    });
  });
});
