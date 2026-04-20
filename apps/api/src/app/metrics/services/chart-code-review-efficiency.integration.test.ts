import {
  CodeReviewState,
  PullRequestSize,
  PullRequestState,
} from "@prisma/client";
import { describe, expect, it } from "vitest";
import { createTestContextWithGitProfile } from "../../../../test/integration-setup/context";
import {
  seedCodeReview,
  seedGitProfile,
  seedPullRequest,
  seedRepository,
  seedTeam,
  seedTeamMember,
} from "../../../../test/seed";
import { Period } from "../../../graphql-types";
import { getPrisma } from "../../../prisma";
import {
  getCodeReviewTeamOverview,
  getKpiAvgCommentsPerPr,
  getKpiPrsWithoutApproval,
  getKpiTimeToApproval,
  getKpiTimeToFirstReview,
  getWorkspaceCodeReviewDistributionChartData,
  getWorkspacePrsWithoutApproval,
  getWorkspaceReviewTurnaroundTime,
  getWorkspaceSizeCommentCorrelation,
  getWorkspaceTimeToApprovalChart,
} from "./chart-code-review-efficiency.service";

/**
 * Code Review Efficiency Metrics Integration Tests
 *
 * Validates correctness of the service by calling real methods against the
 * test database. Mirrors conventions in `dora-metrics.integration.test.ts`:
 * - One workspace per test (multi-tenant isolation)
 * - Explicit UTC timestamps
 * - Asserts on returned values, not raw SQL
 */

const HOUR_MS = 60 * 60 * 1000;

const dateRange = {
  startDate: "2024-01-15T00:00:00Z",
  endDate: "2024-01-16T00:00:00Z",
};

const multiDayRange = {
  startDate: "2024-01-15T00:00:00Z",
  endDate: "2024-01-18T00:00:00Z",
};

const weekRange = {
  startDate: "2024-01-15T00:00:00Z",
  endDate: "2024-01-22T00:00:00Z",
};

interface PrTrackingOverrides {
  firstCommitAt?: Date | null;
  firstReadyAt?: Date | null;
  firstReviewAt?: Date | null;
  firstApprovalAt?: Date | null;
  timeToFirstReview?: bigint | null;
  size?: PullRequestSize;
  linesAddedCount?: number;
  linesDeletedCount?: number;
}

interface SeedPrInput {
  createdAt?: Date;
  mergedAt?: Date | null;
  state?: PullRequestState;
  title?: string;
  number?: string;
  commentCount?: number;
  tracking?: PrTrackingOverrides | null;
}

async function seedPrWithTracking(
  workspaceId: number,
  repositoryId: number,
  authorId: number,
  input: SeedPrInput = {}
): Promise<{ pullRequestId: number }> {
  const pr = await seedPullRequest(
    { workspaceId },
    repositoryId,
    authorId,
    {
      title: input.title,
      number: input.number,
      state: input.state ?? PullRequestState.MERGED,
      createdAt: input.createdAt,
      mergedAt: input.mergedAt === undefined ? undefined : input.mergedAt,
    }
  );

  if (input.commentCount !== undefined) {
    await getPrisma(workspaceId).pullRequest.update({
      where: { id: pr.pullRequestId },
      data: { commentCount: input.commentCount },
    });
  }

  if (input.tracking !== null) {
    const tracking = input.tracking ?? {};
    await getPrisma(workspaceId).pullRequestTracking.create({
      data: {
        pullRequestId: pr.pullRequestId,
        workspaceId,
        size: tracking.size ?? PullRequestSize.MEDIUM,
        changedFilesCount: 0,
        linesAddedCount: tracking.linesAddedCount ?? 0,
        linesDeletedCount: tracking.linesDeletedCount ?? 0,
        firstCommitAt: tracking.firstCommitAt ?? undefined,
        firstReadyAt: tracking.firstReadyAt ?? undefined,
        firstReviewAt: tracking.firstReviewAt ?? undefined,
        firstApprovalAt: tracking.firstApprovalAt ?? undefined,
        timeToFirstReview: tracking.timeToFirstReview ?? undefined,
      },
    });
  }

  return pr;
}

describe("Code Review Efficiency Metrics", () => {
  describe("getWorkspaceReviewTurnaroundTime", () => {
    it("returns avg timeToFirstReview per bucket for a single PR", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T14:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T12:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(result.data[idx]).toBe(BigInt(2 * HOUR_MS));
    });

    it("averages multiple PRs in the same bucket", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          tracking: {
            firstReviewAt: new Date("2024-01-15T12:00:00Z"),
            timeToFirstReview: BigInt(4 * HOUR_MS),
          },
        }
      );

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(result.data[idx]).toBe(BigInt(3 * HOUR_MS));
    });

    it("excludes PRs with firstReviewAt outside the range", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-10T12:00:00Z"),
            timeToFirstReview: BigInt(5 * HOUR_MS),
          },
        }
      );

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.data.every((v) => v === BigInt(0))).toBe(true);
    });

    it("excludes PRs where firstReviewAt IS NULL", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: null,
            timeToFirstReview: BigInt(5 * HOUR_MS),
          },
        }
      );

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.data.every((v) => v === BigInt(0))).toBe(true);
    });

    it("zero-fills empty daily buckets across a multi-day range", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctx.workspaceId,
        ...multiDayRange,
        period: Period.DAILY,
      });

      // 4 days inclusive: 15, 16, 17, 18
      expect(result.columns).toHaveLength(4);
      const firstIdx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(result.data[firstIdx]).toBe(BigInt(2 * HOUR_MS));
      const otherIdxs = result.columns
        .map((_, i) => i)
        .filter((i) => i !== firstIdx);
      for (const i of otherIdxs) {
        expect(result.data[i]).toBe(BigInt(0));
      }
    });

    it("respects WEEKLY period by rolling up into a single bucket", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      for (const day of [15, 16, 17]) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${day}`,
            tracking: {
              firstReviewAt: new Date(`2024-01-${day}T10:00:00Z`),
              timeToFirstReview: BigInt(day * HOUR_MS),
            },
          }
        );
      }

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctx.workspaceId,
        ...weekRange,
        period: Period.WEEKLY,
      });

      const nonZero = result.data.filter((v) => v > BigInt(0));
      expect(nonZero).toHaveLength(1);
      // Average of 15h, 16h, 17h = 16h
      expect(nonZero[0]).toBe(BigInt(16 * HOUR_MS));
    });

    it("applies teamIds based on PR author membership", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpInTeam = await seedGitProfile(ctx, { handle: "in" });
      const gpOutside = await seedGitProfile(ctx, { handle: "out" });
      const repo = await seedRepository(ctx);
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gpInTeam.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gpInTeam.gitProfileId,
        {
          number: "1",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(1 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gpOutside.gitProfileId,
        {
          number: "2",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(9 * HOUR_MS),
          },
        }
      );

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
        teamIds: [team.teamId],
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(result.data[idx]).toBe(BigInt(1 * HOUR_MS));
    });

    it("applies repositoryIds filter", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });

      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(1 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(5 * HOUR_MS),
          },
        }
      );

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
        repositoryIds: [repo2.repositoryId],
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(result.data[idx]).toBe(BigInt(5 * HOUR_MS));
    });

    it("isolates data across workspaces", async () => {
      const ctxA = await createTestContextWithGitProfile("a");
      const ctxB = await createTestContextWithGitProfile("b");
      const gpA = await seedGitProfile(ctxA);
      const gpB = await seedGitProfile(ctxB);
      const repoA = await seedRepository(ctxA);
      const repoB = await seedRepository(ctxB);

      await seedPrWithTracking(
        ctxA.workspaceId,
        repoA.repositoryId,
        gpA.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(1 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctxB.workspaceId,
        repoB.repositoryId,
        gpB.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(99 * HOUR_MS),
          },
        }
      );

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctxA.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(result.data[idx]).toBe(BigInt(1 * HOUR_MS));
    });

    it("orders buckets ascending by period", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      for (const day of [17, 15, 16]) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${day}`,
            tracking: {
              firstReviewAt: new Date(`2024-01-${day}T10:00:00Z`),
              timeToFirstReview: BigInt(1 * HOUR_MS),
            },
          }
        );
      }

      const result = await getWorkspaceReviewTurnaroundTime({
        workspaceId: ctx.workspaceId,
        ...multiDayRange,
        period: Period.DAILY,
      });

      const sorted = [...result.columns].sort();
      expect(result.columns).toEqual(sorted);
    });
  });

  describe("getWorkspaceTimeToApprovalChart", () => {
    it("averages firstApprovalAt - firstReviewAt per bucket in ms", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T13:00:00Z"),
          },
        }
      );

      const result = await getWorkspaceTimeToApprovalChart({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(result.data[idx]).toBe(BigInt(3 * HOUR_MS));
    });

    it("excludes PRs where firstReviewAt IS NULL even if approval is set", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: null,
            firstApprovalAt: new Date("2024-01-15T13:00:00Z"),
          },
        }
      );

      const result = await getWorkspaceTimeToApprovalChart({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.data.every((v) => v === BigInt(0))).toBe(true);
    });

    it("buckets on firstApprovalAt (not firstReviewAt)", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      // Reviewed on Jan 15, approved on Jan 17
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-17T10:00:00Z"),
          },
        }
      );

      const result = await getWorkspaceTimeToApprovalChart({
        workspaceId: ctx.workspaceId,
        ...multiDayRange,
        period: Period.DAILY,
      });

      const jan15 = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      const jan17 = result.columns.indexOf("2024-01-17T00:00:00.000Z");
      expect(result.data[jan15]).toBe(BigInt(0));
      expect(result.data[jan17]).toBe(BigInt(48 * HOUR_MS));
    });

    it("zero-fills empty buckets", async () => {
      const ctx = await createTestContextWithGitProfile();

      const result = await getWorkspaceTimeToApprovalChart({
        workspaceId: ctx.workspaceId,
        ...multiDayRange,
        period: Period.DAILY,
      });

      expect(result.columns).toHaveLength(4);
      expect(result.data.every((v) => v === BigInt(0))).toBe(true);
    });

    it("applies teamIds and repositoryIds filters", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpIn = await seedGitProfile(ctx, { handle: "in" });
      const gpOut = await seedGitProfile(ctx, { handle: "out" });
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gpIn.gitProfileId);

      // Only this PR should count: team member + repo1 + approved Jan 15
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpIn.gitProfileId,
        {
          number: "1",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T12:00:00Z"),
          },
        }
      );
      // Wrong team
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpOut.gitProfileId,
        {
          number: "2",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T20:00:00Z"),
          },
        }
      );
      // Wrong repo
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gpIn.gitProfileId,
        {
          number: "3",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T22:00:00Z"),
          },
        }
      );

      const result = await getWorkspaceTimeToApprovalChart({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
        teamIds: [team.teamId],
        repositoryIds: [repo1.repositoryId],
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(result.data[idx]).toBe(BigInt(2 * HOUR_MS));
    });

    it("isolates data across workspaces", async () => {
      const ctxA = await createTestContextWithGitProfile("a");
      const ctxB = await createTestContextWithGitProfile("b");
      const gpA = await seedGitProfile(ctxA);
      const gpB = await seedGitProfile(ctxB);
      const repoA = await seedRepository(ctxA);
      const repoB = await seedRepository(ctxB);

      await seedPrWithTracking(
        ctxB.workspaceId,
        repoB.repositoryId,
        gpB.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T22:00:00Z"),
          },
        }
      );
      await seedPrWithTracking(
        ctxA.workspaceId,
        repoA.repositoryId,
        gpA.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T12:00:00Z"),
          },
        }
      );

      const result = await getWorkspaceTimeToApprovalChart({
        workspaceId: ctxA.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(result.data[idx]).toBe(BigInt(2 * HOUR_MS));
    });
  });

  describe("getWorkspacePrsWithoutApproval", () => {
    it("counts merged PRs with no APPROVED CodeReview", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      const count = await getWorkspacePrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(count).toBe(1);
    });

    it("counts PRs with only COMMENTED / CHANGES_REQUESTED reviews", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev = await seedGitProfile(ctx, { handle: "rev" });
      const repo = await seedRepository(ctx);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr.pullRequestId, rev.gitProfileId, {
        state: CodeReviewState.CHANGES_REQUESTED,
      });

      const count = await getWorkspacePrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(count).toBe(1);
    });

    it("excludes PRs with at least one APPROVED review", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev1 = await seedGitProfile(ctx, { handle: "rev1" });
      const rev2 = await seedGitProfile(ctx, { handle: "rev2" });
      const repo = await seedRepository(ctx);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr.pullRequestId, rev1.gitProfileId, {
        state: CodeReviewState.CHANGES_REQUESTED,
      });
      await seedCodeReview(ctx, pr.pullRequestId, rev2.gitProfileId, {
        state: CodeReviewState.APPROVED,
      });

      const count = await getWorkspacePrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(count).toBe(0);
    });

    it("excludes PRs merged outside the range", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-10T10:00:00Z") }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-20T10:00:00Z") }
      );

      const count = await getWorkspacePrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(count).toBe(0);
    });

    it("excludes non-merged PRs", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        { state: PullRequestState.OPEN, mergedAt: null }
      );

      const count = await getWorkspacePrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(count).toBe(0);
    });

    it("counts a PR with multiple non-approved reviews only once", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev1 = await seedGitProfile(ctx, { handle: "rev1" });
      const rev2 = await seedGitProfile(ctx, { handle: "rev2" });
      const repo = await seedRepository(ctx);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr.pullRequestId, rev1.gitProfileId, {
        state: CodeReviewState.COMMENTED,
      });
      await seedCodeReview(ctx, pr.pullRequestId, rev2.gitProfileId, {
        state: CodeReviewState.CHANGES_REQUESTED,
      });

      const count = await getWorkspacePrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(count).toBe(1);
    });

    it("respects teamIds and repositoryIds filters", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpIn = await seedGitProfile(ctx, { handle: "in" });
      const gpOut = await seedGitProfile(ctx, { handle: "out" });
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gpIn.gitProfileId);

      // Correct: team + repo1
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpIn.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      // Wrong team
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpOut.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      // Wrong repo
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gpIn.gitProfileId,
        { number: "3", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      const count = await getWorkspacePrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        teamIds: [team.teamId],
        repositoryIds: [repo1.repositoryId],
      });

      expect(count).toBe(1);
    });

    it("isolates data across workspaces", async () => {
      const ctxA = await createTestContextWithGitProfile("a");
      const ctxB = await createTestContextWithGitProfile("b");
      const gpA = await seedGitProfile(ctxA);
      const gpB = await seedGitProfile(ctxB);
      const repoA = await seedRepository(ctxA);
      const repoB = await seedRepository(ctxB);

      await seedPrWithTracking(
        ctxB.workspaceId,
        repoB.repositoryId,
        gpB.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedPrWithTracking(
        ctxA.workspaceId,
        repoA.repositoryId,
        gpA.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      const count = await getWorkspacePrsWithoutApproval({
        workspaceId: ctxA.workspaceId,
        ...dateRange,
      });

      expect(count).toBe(1);
    });
  });

  describe("getKpiTimeToFirstReview", () => {
    it("returns floored avg ms for current and previous periods", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      // Current: 2h avg
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );
      // Previous: 1h avg (prev window is 2024-01-14T00..2024-01-14T23:59:59.999)
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          tracking: {
            firstReviewAt: new Date("2024-01-14T10:00:00Z"),
            timeToFirstReview: BigInt(1 * HOUR_MS),
          },
        }
      );

      const kpi = await getKpiTimeToFirstReview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(BigInt(2 * HOUR_MS));
      expect(kpi.previousAmount).toBe(BigInt(1 * HOUR_MS));
      expect(kpi.change).toBe(100);
      expect(kpi.currentPeriod).toEqual({
        from: dateRange.startDate,
        to: dateRange.endDate,
      });
    });

    it("returns 0/0/0 when both periods are empty", async () => {
      const ctx = await createTestContextWithGitProfile();

      const kpi = await getKpiTimeToFirstReview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(BigInt(0));
      expect(kpi.previousAmount).toBe(BigInt(0));
      expect(kpi.change).toBe(0);
    });

    it("returns change = 0 when previous period is empty (no divide-by-zero)", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(3 * HOUR_MS),
          },
        }
      );

      const kpi = await getKpiTimeToFirstReview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(BigInt(3 * HOUR_MS));
      expect(kpi.previousAmount).toBe(BigInt(0));
      expect(kpi.change).toBe(0);
    });

    it("computes integer percent change across periods", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      // Prev: 4h, Curr: 1h → -75%
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          tracking: {
            firstReviewAt: new Date("2024-01-14T10:00:00Z"),
            timeToFirstReview: BigInt(4 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(1 * HOUR_MS),
          },
        }
      );

      const kpi = await getKpiTimeToFirstReview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.change).toBe(-75);
    });

    it("excludes PRs outside both current and previous ranges", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      // Far in the past (neither current nor previous)
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2023-01-01T10:00:00Z"),
            timeToFirstReview: BigInt(99 * HOUR_MS),
          },
        }
      );

      const kpi = await getKpiTimeToFirstReview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(BigInt(0));
      expect(kpi.previousAmount).toBe(BigInt(0));
    });

    it("respects teamIds and repositoryIds filters", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpIn = await seedGitProfile(ctx, { handle: "in" });
      const gpOut = await seedGitProfile(ctx, { handle: "out" });
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gpIn.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpIn.gitProfileId,
        {
          number: "1",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpOut.gitProfileId,
        {
          number: "2",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(10 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gpIn.gitProfileId,
        {
          number: "3",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(20 * HOUR_MS),
          },
        }
      );

      const kpi = await getKpiTimeToFirstReview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        teamIds: [team.teamId],
        repositoryIds: [repo1.repositoryId],
      });

      expect(kpi.currentAmount).toBe(BigInt(2 * HOUR_MS));
    });
  });

  describe("getKpiTimeToApproval", () => {
    it("returns floored avg (approvalAt - reviewAt) in ms for both periods", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T12:00:00Z"), // 2h
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          tracking: {
            firstReviewAt: new Date("2024-01-14T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-14T14:00:00Z"), // 4h
          },
        }
      );

      const kpi = await getKpiTimeToApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(BigInt(2 * HOUR_MS));
      expect(kpi.previousAmount).toBe(BigInt(4 * HOUR_MS));
      expect(kpi.change).toBe(-50);
    });

    it("excludes PRs with approval but no recorded firstReviewAt", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: null,
            firstApprovalAt: new Date("2024-01-15T12:00:00Z"),
          },
        }
      );

      const kpi = await getKpiTimeToApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(BigInt(0));
    });

    it("returns 0/0/0 when both periods are empty", async () => {
      const ctx = await createTestContextWithGitProfile();

      const kpi = await getKpiTimeToApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(BigInt(0));
      expect(kpi.previousAmount).toBe(BigInt(0));
      expect(kpi.change).toBe(0);
    });

    it("returns change = 0 when previous period is empty", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T13:00:00Z"),
          },
        }
      );

      const kpi = await getKpiTimeToApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(BigInt(3 * HOUR_MS));
      expect(kpi.previousAmount).toBe(BigInt(0));
      expect(kpi.change).toBe(0);
    });

    it("respects teamIds and repositoryIds filters", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpIn = await seedGitProfile(ctx, { handle: "in" });
      const gpOut = await seedGitProfile(ctx, { handle: "out" });
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gpIn.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpIn.gitProfileId,
        {
          number: "1",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T11:00:00Z"),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpOut.gitProfileId,
        {
          number: "2",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T20:00:00Z"),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gpIn.gitProfileId,
        {
          number: "3",
          tracking: {
            firstReviewAt: new Date("2024-01-15T10:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T22:00:00Z"),
          },
        }
      );

      const kpi = await getKpiTimeToApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        teamIds: [team.teamId],
        repositoryIds: [repo1.repositoryId],
      });

      expect(kpi.currentAmount).toBe(BigInt(1 * HOUR_MS));
    });
  });

  describe("getKpiAvgCommentsPerPr", () => {
    it("averages PullRequest.commentCount across merged PRs and rounds to 1 decimal", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      for (const [i, cc] of [1, 2, 4].entries()) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${i + 1}`,
            mergedAt: new Date("2024-01-15T10:00:00Z"),
            commentCount: cc,
          }
        );
      }

      const kpi = await getKpiAvgCommentsPerPr({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(2.3);
    });

    it("computes previous-period average separately", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-14T10:00:00Z"),
          commentCount: 6,
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 3,
        }
      );

      const kpi = await getKpiAvgCommentsPerPr({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(3);
      expect(kpi.previousAmount).toBe(6);
      expect(kpi.change).toBe(-50);
    });

    it("returns change = 0 when previous period has no merged PRs", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 5,
        }
      );

      const kpi = await getKpiAvgCommentsPerPr({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(5);
      expect(kpi.previousAmount).toBe(0);
      expect(kpi.change).toBe(0);
    });

    it("excludes non-merged PRs", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          state: PullRequestState.OPEN,
          mergedAt: null,
          commentCount: 50,
        }
      );

      const kpi = await getKpiAvgCommentsPerPr({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(0);
    });

    it("excludes PRs merged outside the range", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          mergedAt: new Date("2024-01-20T10:00:00Z"),
          commentCount: 50,
        }
      );

      const kpi = await getKpiAvgCommentsPerPr({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(0);
    });

    it("respects teamIds and repositoryIds filters", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpIn = await seedGitProfile(ctx, { handle: "in" });
      const gpOut = await seedGitProfile(ctx, { handle: "out" });
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gpIn.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpIn.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 2,
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpOut.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 20,
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gpIn.gitProfileId,
        {
          number: "3",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 30,
        }
      );

      const kpi = await getKpiAvgCommentsPerPr({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        teamIds: [team.teamId],
        repositoryIds: [repo1.repositoryId],
      });

      expect(kpi.currentAmount).toBe(2);
    });
  });

  describe("getKpiPrsWithoutApproval", () => {
    it("returns current and previous counts as plain numbers", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-14T10:00:00Z") }
      );

      const kpi = await getKpiPrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(typeof kpi.currentAmount).toBe("number");
      expect(typeof kpi.previousAmount).toBe("number");
      expect(kpi.currentAmount).toBe(1);
      expect(kpi.previousAmount).toBe(1);
    });

    it("does not double-count a PR with multiple non-approved reviews", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev1 = await seedGitProfile(ctx, { handle: "rev1" });
      const rev2 = await seedGitProfile(ctx, { handle: "rev2" });
      const repo = await seedRepository(ctx);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr.pullRequestId, rev1.gitProfileId, {
        state: CodeReviewState.COMMENTED,
      });
      await seedCodeReview(ctx, pr.pullRequestId, rev2.gitProfileId, {
        state: CodeReviewState.CHANGES_REQUESTED,
      });

      const kpi = await getKpiPrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(1);
    });

    it("counts PRs with no reviews at all", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      const kpi = await getKpiPrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(1);
    });

    it("excludes PRs with at least one approval", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev = await seedGitProfile(ctx, { handle: "rev" });
      const repo = await seedRepository(ctx);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr.pullRequestId, rev.gitProfileId, {
        state: CodeReviewState.APPROVED,
      });

      const kpi = await getKpiPrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(0);
    });

    it("returns change = 0 when previous period is 0", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      const kpi = await getKpiPrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(kpi.currentAmount).toBe(1);
      expect(kpi.previousAmount).toBe(0);
      expect(kpi.change).toBe(0);
    });

    it("respects teamIds and repositoryIds filters", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpIn = await seedGitProfile(ctx, { handle: "in" });
      const gpOut = await seedGitProfile(ctx, { handle: "out" });
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gpIn.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpIn.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpOut.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gpIn.gitProfileId,
        { number: "3", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      const kpi = await getKpiPrsWithoutApproval({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        teamIds: [team.teamId],
        repositoryIds: [repo1.repositoryId],
      });

      expect(kpi.currentAmount).toBe(1);
    });
  });

  describe("getWorkspaceSizeCommentCorrelation", () => {
    it("groups merged PRs by size into series ordered TINY -> HUGE", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      const order: PullRequestSize[] = [
        PullRequestSize.HUGE,
        PullRequestSize.TINY,
        PullRequestSize.SMALL,
        PullRequestSize.MEDIUM,
        PullRequestSize.LARGE,
      ];
      for (const [i, size] of order.entries()) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${i + 1}`,
            mergedAt: new Date("2024-01-15T10:00:00Z"),
            commentCount: i + 1,
            tracking: { size, linesAddedCount: 1, linesDeletedCount: 0 },
          }
        );
      }

      const result = await getWorkspaceSizeCommentCorrelation({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(result.series.map((s) => s.name)).toEqual([
        "Tiny",
        "Small",
        "Medium",
        "Large",
        "Huge",
      ]);
    });

    it("omits sizes with no PRs from series", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 1,
          tracking: { size: PullRequestSize.SMALL },
        }
      );

      const result = await getWorkspaceSizeCommentCorrelation({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(result.series.map((s) => s.name)).toEqual(["Small"]);
    });

    it("exposes { x: linesAdded+linesDeleted, y: commentCount, title, url }", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          title: "Example PR",
          number: "42",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 9,
          tracking: {
            size: PullRequestSize.MEDIUM,
            linesAddedCount: 30,
            linesDeletedCount: 10,
          },
        }
      );

      const result = await getWorkspaceSizeCommentCorrelation({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const medium = result.series.find((s) => s.name === "Medium")!;
      expect(medium.data).toHaveLength(1);
      expect(medium.data[0].x).toBe(40);
      expect(medium.data[0].y).toBe(9);
      expect(medium.data[0].title).toBe("Example PR");
      expect(medium.data[0].url).toContain("/pull/42");
    });

    it("orders a series' data points by commentCount descending", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      for (const [i, cc] of [1, 5, 3].entries()) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${i + 1}`,
            mergedAt: new Date("2024-01-15T10:00:00Z"),
            commentCount: cc,
            tracking: { size: PullRequestSize.MEDIUM },
          }
        );
      }

      const result = await getWorkspaceSizeCommentCorrelation({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const medium = result.series.find((s) => s.name === "Medium")!;
      expect(medium.data.map((d) => d.y)).toEqual([5, 3, 1]);
    });

    it("excludes non-merged PRs and PRs outside the range", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          state: PullRequestState.OPEN,
          mergedAt: null,
          commentCount: 10,
          tracking: { size: PullRequestSize.MEDIUM },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-10T10:00:00Z"),
          commentCount: 10,
          tracking: { size: PullRequestSize.MEDIUM },
        }
      );

      const result = await getWorkspaceSizeCommentCorrelation({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(result.series).toHaveLength(0);
    });

    it("respects teamIds and repositoryIds filters", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpIn = await seedGitProfile(ctx, { handle: "in" });
      const gpOut = await seedGitProfile(ctx, { handle: "out" });
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gpIn.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpIn.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 1,
          tracking: { size: PullRequestSize.SMALL },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gpOut.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 1,
          tracking: { size: PullRequestSize.LARGE },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gpIn.gitProfileId,
        {
          number: "3",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 1,
          tracking: { size: PullRequestSize.HUGE },
        }
      );

      const result = await getWorkspaceSizeCommentCorrelation({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        teamIds: [team.teamId],
        repositoryIds: [repo1.repositoryId],
      });

      expect(result.series.map((s) => s.name)).toEqual(["Small"]);
    });

    it("isolates data across workspaces", async () => {
      const ctxA = await createTestContextWithGitProfile("a");
      const ctxB = await createTestContextWithGitProfile("b");
      const gpA = await seedGitProfile(ctxA);
      const gpB = await seedGitProfile(ctxB);
      const repoA = await seedRepository(ctxA);
      const repoB = await seedRepository(ctxB);

      await seedPrWithTracking(
        ctxB.workspaceId,
        repoB.repositoryId,
        gpB.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 10,
          tracking: { size: PullRequestSize.HUGE },
        }
      );
      await seedPrWithTracking(
        ctxA.workspaceId,
        repoA.repositoryId,
        gpA.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          commentCount: 1,
          tracking: { size: PullRequestSize.SMALL },
        }
      );

      const result = await getWorkspaceSizeCommentCorrelation({
        workspaceId: ctxA.workspaceId,
        ...dateRange,
      });

      expect(result.series.map((s) => s.name)).toEqual(["Small"]);
    });
  });

  describe("getWorkspaceCodeReviewDistributionChartData", () => {
    it("returns one source, one target, and one link for a single review", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, {
        handle: "author",
        name: "author",
      });
      const rev = await seedGitProfile(ctx, { handle: "rev", name: "rev" });
      const repo = await seedRepository(ctx);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr.pullRequestId, rev.gitProfileId, {
        state: CodeReviewState.APPROVED,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.links).toHaveLength(1);
      expect(result.links[0].value).toBe(1);
      expect(result.totalReviews).toBe(1);
      expect(result.entities.map((e) => e.id).sort()).toEqual(
        ["author:rev", "cr-author:rev"].sort()
      );
    });

    it("sums multiple reviews from the same reviewer across PRs of the same author into one link", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev = await seedGitProfile(ctx, { handle: "rev" });
      const repo = await seedRepository(ctx);

      for (const i of [1, 2, 3]) {
        const pr = await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          author.gitProfileId,
          {
            number: `${i}`,
            mergedAt: new Date("2024-01-15T10:00:00Z"),
          }
        );
        await seedCodeReview(ctx, pr.pullRequestId, rev.gitProfileId, {
          state: CodeReviewState.APPROVED,
          createdAt: new Date("2024-01-15T11:00:00Z"),
        });
      }

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.links).toHaveLength(1);
      expect(result.links[0].value).toBe(3);
    });

    it("reviewer reviewCount equals total reviews across all targets", async () => {
      const ctx = await createTestContextWithGitProfile();
      const authorA = await seedGitProfile(ctx, { handle: "a" });
      const authorB = await seedGitProfile(ctx, { handle: "b" });
      const rev = await seedGitProfile(ctx, { handle: "rev" });
      const repo = await seedRepository(ctx);

      const prA = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        authorA.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      const prB = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        authorB.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      await seedCodeReview(ctx, prA.pullRequestId, rev.gitProfileId, {
        state: CodeReviewState.APPROVED,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });
      await seedCodeReview(ctx, prB.pullRequestId, rev.gitProfileId, {
        state: CodeReviewState.COMMENTED,
        createdAt: new Date("2024-01-15T12:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const reviewer = result.entities.find((e) => e.id === "cr-author:rev")!;
      expect(reviewer.reviewCount).toBe(2);
    });

    it("reviewSharePercentage is reviewCount/totalReviews; PR-only authors have undefined", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev1 = await seedGitProfile(ctx, { handle: "rev1" });
      const rev2 = await seedGitProfile(ctx, { handle: "rev2" });
      const repo = await seedRepository(ctx);

      const pr1 = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      const pr2 = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      const pr3 = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { number: "3", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      // rev1 does 3 reviews, rev2 does 1 review → total 4
      await seedCodeReview(ctx, pr1.pullRequestId, rev1.gitProfileId, {
        state: CodeReviewState.APPROVED,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });
      await seedCodeReview(ctx, pr2.pullRequestId, rev1.gitProfileId, {
        state: CodeReviewState.APPROVED,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });
      await seedCodeReview(ctx, pr3.pullRequestId, rev1.gitProfileId, {
        state: CodeReviewState.APPROVED,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });
      await seedCodeReview(ctx, pr1.pullRequestId, rev2.gitProfileId, {
        state: CodeReviewState.APPROVED,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const r1 = result.entities.find((e) => e.id === "cr-author:rev1")!;
      const r2 = result.entities.find((e) => e.id === "cr-author:rev2")!;
      const prOnly = result.entities.find((e) => e.id.startsWith("author:"))!;

      expect(result.totalReviews).toBe(4);
      expect(r1.reviewSharePercentage).toBe(75);
      expect(r2.reviewSharePercentage).toBe(25);
      expect(prOnly.reviewSharePercentage).toBeUndefined();
    });

    it("totalReviews equals the total distinct CodeReview rows in range", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev1 = await seedGitProfile(ctx, { handle: "rev1" });
      const rev2 = await seedGitProfile(ctx, { handle: "rev2" });
      const repo = await seedRepository(ctx);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr.pullRequestId, rev1.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });
      await seedCodeReview(ctx, pr.pullRequestId, rev2.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.totalReviews).toBe(2);
    });

    it("filters by CodeReview.createdAt, not by PR timestamps", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev = await seedGitProfile(ctx, { handle: "rev" });
      const repo = await seedRepository(ctx);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        {
          createdAt: new Date("2024-01-15T09:00:00Z"),
          mergedAt: new Date("2024-01-15T10:00:00Z"),
        }
      );
      // review outside the range
      await seedCodeReview(ctx, pr.pullRequestId, rev.gitProfileId, {
        createdAt: new Date("2024-01-20T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.totalReviews).toBe(0);
      expect(result.links).toHaveLength(0);
    });

    it("applies teamIds by reviewer (CR author), not PR author", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const revIn = await seedGitProfile(ctx, { handle: "rev-in" });
      const revOut = await seedGitProfile(ctx, { handle: "rev-out" });
      const repo = await seedRepository(ctx);
      const team = await seedTeam(ctx);
      // Author is NOT in the team; reviewer IS in the team
      await seedTeamMember(ctx, team.teamId, revIn.gitProfileId);

      const pr1 = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      const pr2 = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      await seedCodeReview(ctx, pr1.pullRequestId, revIn.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });
      await seedCodeReview(ctx, pr2.pullRequestId, revOut.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
        teamIds: [team.teamId],
      });

      expect(result.totalReviews).toBe(1);
      expect(result.links).toHaveLength(1);
      expect(result.links[0].source).toBe("cr-author:rev-in");
    });

    it("applies repositoryIds filter to PR", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev = await seedGitProfile(ctx, { handle: "rev" });
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });

      const pr1 = await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        author.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      const pr2 = await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        author.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      await seedCodeReview(ctx, pr1.pullRequestId, rev.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });
      await seedCodeReview(ctx, pr2.pullRequestId, rev.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
        repositoryIds: [repo1.repositoryId],
      });

      expect(result.totalReviews).toBe(1);
    });

    it("sorts entities with reviewers first (reviewCount DESC), PR-only authors after", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, {
        handle: "author",
        name: "author",
      });
      const revMany = await seedGitProfile(ctx, {
        handle: "many",
        name: "many",
      });
      const revFew = await seedGitProfile(ctx, {
        handle: "few",
        name: "few",
      });
      const repo = await seedRepository(ctx);

      const pr1 = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      const pr2 = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      await seedCodeReview(ctx, pr1.pullRequestId, revMany.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });
      await seedCodeReview(ctx, pr2.pullRequestId, revMany.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });
      await seedCodeReview(ctx, pr1.pullRequestId, revFew.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      // revMany (2 reviews) first, then revFew (1), then PR-only author entities
      // (reviewCount undefined). The target entity id is
      // CONCAT(PR_Author.handle, ':', CR_Author.name), so there is one PR-only
      // entity per reviewer (`author:many`, `author:few`). Order among tied
      // PR-only entities is not guaranteed.
      expect(result.entities[0].id).toBe("cr-author:many");
      expect(result.entities[1].id).toBe("cr-author:few");

      const trailingIds = result.entities
        .slice(2)
        .map((e) => e.id)
        .sort();
      expect(trailingIds).toEqual(["author:few", "author:many"]);

      for (const entity of result.entities.slice(2)) {
        expect(entity.reviewCount).toBeUndefined();
      }
    });

    it("isolates data across workspaces", async () => {
      const ctxA = await createTestContextWithGitProfile("a");
      const ctxB = await createTestContextWithGitProfile("b");
      const authorA = await seedGitProfile(ctxA, { handle: "aa" });
      const revA = await seedGitProfile(ctxA, { handle: "ra" });
      const authorB = await seedGitProfile(ctxB, { handle: "ab" });
      const revB = await seedGitProfile(ctxB, { handle: "rb" });
      const repoA = await seedRepository(ctxA);
      const repoB = await seedRepository(ctxB);

      const prA = await seedPrWithTracking(
        ctxA.workspaceId,
        repoA.repositoryId,
        authorA.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctxA, prA.pullRequestId, revA.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const prB = await seedPrWithTracking(
        ctxB.workspaceId,
        repoB.repositoryId,
        authorB.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctxB, prB.pullRequestId, revB.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctxA.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.totalReviews).toBe(1);
      expect(result.links[0].source).toBe("cr-author:ra");
    });

    it("marks links as isFromTeam when reviewer and PR author share a team", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev = await seedGitProfile(ctx, { handle: "rev" });
      const repo = await seedRepository(ctx);
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, author.gitProfileId);
      await seedTeamMember(ctx, team.teamId, rev.gitProfileId);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr.pullRequestId, rev.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.links).toHaveLength(1);
      expect(result.links[0].isFromTeam).toBe(true);
    });

    it("marks links as not isFromTeam when reviewer and PR author share no team", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev = await seedGitProfile(ctx, { handle: "rev" });
      const repo = await seedRepository(ctx);
      const authorTeam = await seedTeam(ctx, { name: "authors" });
      const revTeam = await seedTeam(ctx, { name: "reviewers" });
      await seedTeamMember(ctx, authorTeam.teamId, author.gitProfileId);
      await seedTeamMember(ctx, revTeam.teamId, rev.gitProfileId);

      const pr = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr.pullRequestId, rev.gitProfileId, {
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.links).toHaveLength(1);
      expect(result.links[0].isFromTeam).toBe(false);
    });

    it("keeps reviewer and PR-author entities separate when the same person plays both roles", async () => {
      const ctx = await createTestContextWithGitProfile();
      const alice = await seedGitProfile(ctx, {
        handle: "alice",
        name: "Alice",
      });
      const bob = await seedGitProfile(ctx, { handle: "bob", name: "Bob" });
      const repo = await seedRepository(ctx);

      const prByAlice = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        alice.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, prByAlice.pullRequestId, bob.gitProfileId, {
        state: CodeReviewState.APPROVED,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      });

      const prByBob = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        bob.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-15T12:00:00Z") }
      );
      await seedCodeReview(ctx, prByBob.pullRequestId, alice.gitProfileId, {
        state: CodeReviewState.APPROVED,
        createdAt: new Date("2024-01-15T13:00:00Z"),
      });

      const result = await getWorkspaceCodeReviewDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const reviewerEntities = result.entities.filter((e) =>
        e.id.startsWith("cr-author:")
      );
      const authorEntities = result.entities.filter(
        (e) => !e.id.startsWith("cr-author:")
      );

      expect(reviewerEntities).toHaveLength(2);
      expect(authorEntities).toHaveLength(2);

      const bobReviewer = reviewerEntities.find((e) => e.id === "cr-author:bob");
      const aliceReviewer = reviewerEntities.find(
        (e) => e.id === "cr-author:alice"
      );
      expect(bobReviewer?.reviewCount).toBe(1);
      expect(aliceReviewer?.reviewCount).toBe(1);
      expect(result.totalReviews).toBe(2);
    });
  });

  describe("getCodeReviewTeamOverview", () => {
    it("returns the All teams row first with teamId null", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);
      const team = await seedTeam(ctx, { name: "eng" });
      await seedTeamMember(ctx, team.teamId, gp.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T09:00:00Z"),
            timeToFirstReview: BigInt(1 * HOUR_MS),
          },
        }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(result).toHaveLength(2);
      expect(result[0].teamId).toBeNull();
      expect(result[0].teamName).toBe("All teams");
      expect(result[1].teamId).toBe(team.teamId);
    });

    it("All teams row aggregates across all matching PRs", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T10:00:00Z"),
            timeToFirstReview: BigInt(1 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T14:00:00Z"),
            timeToFirstReview: BigInt(3 * HOUR_MS),
          },
        }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      expect(org.avgTimeToFirstReview).toBe(BigInt(2 * HOUR_MS));
      expect(org.avgTimeToApproval).toBe(BigInt(4 * HOUR_MS));
      expect(org.prsWithoutApproval).toBe(2);
    });

    it("returns team rows for non-archived teams with no PRs", async () => {
      const ctx = await createTestContextWithGitProfile();
      const team = await seedTeam(ctx, { name: "empty" });

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const teamRow = result.find((r) => r.teamId === team.teamId);
      expect(teamRow).toBeDefined();
      expect(teamRow!.avgTimeToFirstReview).toBe(BigInt(0));
      expect(teamRow!.avgTimeToApproval).toBe(BigInt(0));
    });

    it("excludes archived teams", async () => {
      const ctx = await createTestContextWithGitProfile();
      const team = await seedTeam(ctx, { name: "archived" });
      await getPrisma(ctx.workspaceId).team.update({
        where: { id: team.teamId },
        data: { archivedAt: new Date("2024-01-01T00:00:00Z") },
      });

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(result.find((r) => r.teamId === team.teamId)).toBeUndefined();
    });

    it("avgTimeToFirstReview only averages PRs with firstReviewAt set", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: { firstReviewAt: null, timeToFirstReview: null },
        }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      expect(org.avgTimeToFirstReview).toBe(BigInt(2 * HOUR_MS));
    });

    it("avgTimeToApproval only counts PRs with both approval and review", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      // Has both
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T12:00:00Z"), // 4h
          },
        }
      );
      // Missing firstApprovalAt
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            firstApprovalAt: null,
          },
        }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      expect(org.avgTimeToApproval).toBe(BigInt(4 * HOUR_MS));
    });

    it("prsWithoutApproval counts merged PRs without an APPROVED review", async () => {
      const ctx = await createTestContextWithGitProfile();
      const author = await seedGitProfile(ctx, { handle: "author" });
      const rev = await seedGitProfile(ctx, { handle: "rev" });
      const repo = await seedRepository(ctx);

      const pr1 = await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { number: "1", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );
      await seedCodeReview(ctx, pr1.pullRequestId, rev.gitProfileId, {
        state: CodeReviewState.APPROVED,
      });

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        author.gitProfileId,
        { number: "2", mergedAt: new Date("2024-01-15T10:00:00Z") }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      expect(org.prsWithoutApproval).toBe(1);
    });

    it("attributes a PR to each team when the author belongs to multiple teams; org counts once", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);
      const teamA = await seedTeam(ctx, { name: "a" });
      const teamB = await seedTeam(ctx, { name: "b" });
      await seedTeamMember(ctx, teamA.teamId, gp.gitProfileId);
      await seedTeamMember(ctx, teamB.teamId, gp.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      const rowA = result.find((r) => r.teamId === teamA.teamId)!;
      const rowB = result.find((r) => r.teamId === teamB.teamId)!;

      expect(org.prsWithoutApproval).toBe(1);
      expect(rowA.avgTimeToFirstReview).toBe(BigInt(2 * HOUR_MS));
      expect(rowB.avgTimeToFirstReview).toBe(BigInt(2 * HOUR_MS));
      expect(rowA.prsWithoutApproval).toBe(1);
      expect(rowB.prsWithoutApproval).toBe(1);
    });

    it("restricts both team rows and org-row aggregation when teamIds is passed", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpA = await seedGitProfile(ctx, { handle: "a" });
      const gpB = await seedGitProfile(ctx, { handle: "b" });
      const repo = await seedRepository(ctx);
      const teamA = await seedTeam(ctx, { name: "a" });
      const teamB = await seedTeam(ctx, { name: "b" });
      await seedTeamMember(ctx, teamA.teamId, gpA.gitProfileId);
      await seedTeamMember(ctx, teamB.teamId, gpB.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gpA.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gpB.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            timeToFirstReview: BigInt(10 * HOUR_MS),
          },
        }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        teamIds: [teamA.teamId],
      });

      const teamIds = result.map((r) => r.teamId).sort((a, b) => {
        if (a === null) return -1;
        if (b === null) return 1;
        return a - b;
      });
      expect(teamIds).toEqual([null, teamA.teamId]);

      const org = result.find((r) => r.teamId === null)!;
      expect(org.avgTimeToFirstReview).toBe(BigInt(2 * HOUR_MS));
    });

    it("applies repositoryIds filter to all aggregations", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo1 = await seedRepository(ctx, { name: "r1" });
      const repo2 = await seedRepository(ctx, { name: "r2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gp.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            timeToFirstReview: BigInt(10 * HOUR_MS),
          },
        }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        repositoryIds: [repo1.repositoryId],
      });

      const org = result.find((r) => r.teamId === null)!;
      const teamRow = result.find((r) => r.teamId === team.teamId)!;
      expect(org.avgTimeToFirstReview).toBe(BigInt(2 * HOUR_MS));
      expect(teamRow.avgTimeToFirstReview).toBe(BigInt(2 * HOUR_MS));
      expect(org.prsWithoutApproval).toBe(1);
      expect(teamRow.prsWithoutApproval).toBe(1);
    });

    it("orders rows by teamId NULLS FIRST, then by teamId ASC (name is a tiebreaker)", async () => {
      const ctx = await createTestContextWithGitProfile();
      const teamB = await seedTeam(ctx, { name: "bravo" });
      const teamA = await seedTeam(ctx, { name: "alpha" });

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      // "All teams" (teamId = null) comes first
      expect(result[0].teamId).toBeNull();
      expect(result[0].teamName).toBe("All teams");

      // Remaining rows are ordered by team_id ASC (team_name is only a tiebreaker
      // and never applies since team ids are unique). teamB was seeded first so
      // it has a smaller id than teamA, and therefore appears before it.
      const teamRows = result.filter((r) => r.teamId !== null);
      const teamIds = teamRows.map((r) => r.teamId as number);
      expect(teamIds).toEqual([...teamIds].sort((a, b) => a - b));
      expect(teamRows.map((r) => r.teamId)).toEqual([
        teamB.teamId,
        teamA.teamId,
      ]);
    });

    it("isolates data across workspaces", async () => {
      const ctxA = await createTestContextWithGitProfile("a");
      const ctxB = await createTestContextWithGitProfile("b");
      const gpA = await seedGitProfile(ctxA);
      const gpB = await seedGitProfile(ctxB);
      const repoA = await seedRepository(ctxA);
      const repoB = await seedRepository(ctxB);

      await seedPrWithTracking(
        ctxB.workspaceId,
        repoB.repositoryId,
        gpB.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            timeToFirstReview: BigInt(99 * HOUR_MS),
          },
        }
      );
      await seedPrWithTracking(
        ctxA.workspaceId,
        repoA.repositoryId,
        gpA.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            timeToFirstReview: BigInt(2 * HOUR_MS),
          },
        }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctxA.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      expect(org.avgTimeToFirstReview).toBe(BigInt(2 * HOUR_MS));
    });

    it("returns the documented numeric types", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            firstReviewAt: new Date("2024-01-15T08:00:00Z"),
            firstApprovalAt: new Date("2024-01-15T09:00:00Z"),
            timeToFirstReview: BigInt(1 * HOUR_MS),
          },
        }
      );

      const result = await getCodeReviewTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      expect(org.teamId).toBeNull();
      expect(typeof org.avgTimeToFirstReview).toBe("bigint");
      expect(typeof org.avgTimeToApproval).toBe("bigint");
      expect(typeof org.prsWithoutApproval).toBe("number");
    });
  });
});
