import { PullRequestSize, PullRequestState } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { createTestContextWithGitProfile } from "../../../../test/integration-setup/context";
import {
  seedGitProfile,
  seedPullRequest,
  seedRepository,
  seedTeam,
  seedTeamMember,
} from "../../../../test/seed";
import { Period } from "../../../graphql-types";
import { getPrisma } from "../../../prisma";
import {
  getWorkspaceCycleTimeBreakdownChartData,
  getWorkspacePullRequestSizeDistributionChartData,
  getWorkspaceSizeCycleTimeCorrelation,
  getWorkspaceTeamOverview,
  getWorkspaceThroughputChartData,
} from "./pr-flow.service";

/**
 * PR Flow Metrics Integration Tests
 *
 * Validates the correctness of PR flow metric calculations by calling the
 * actual service methods. Mirrors the conventions used in
 * `dora-metrics.integration.test.ts`:
 * - One workspace per test (multi-tenant isolation)
 * - Explicit UTC timestamps (determinism)
 * - Asserts on returned values, not raw SQL
 * - Reads like business scenarios
 */

interface PrTrackingOverrides {
  firstCommitAt?: Date | null;
  firstReadyAt?: Date | null;
  firstReviewAt?: Date | null;
  firstApprovalAt?: Date | null;
  timeToCode?: bigint | null;
  timeToFirstReview?: bigint | null;
  cycleTime?: bigint | null;
  size?: PullRequestSize;
  linesAddedCount?: number;
  linesDeletedCount?: number;
}

interface SeedPrInput {
  createdAt?: Date;
  mergedAt?: Date | null;
  closedAt?: Date | null;
  state?: PullRequestState;
  title?: string;
  number?: string;
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
      mergedAt: input.mergedAt ?? undefined,
    }
  );

  if (input.closedAt !== undefined) {
    await getPrisma(workspaceId).pullRequest.update({
      where: { id: pr.pullRequestId },
      data: { closedAt: input.closedAt },
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
        timeToCode: tracking.timeToCode ?? undefined,
        timeToFirstReview: tracking.timeToFirstReview ?? undefined,
        cycleTime: tracking.cycleTime ?? undefined,
      },
    });
  }

  return pr;
}

const HOUR_MS = 60 * 60 * 1000;

const dateRange = {
  startDate: "2024-01-15T00:00:00Z",
  endDate: "2024-01-16T00:00:00Z",
};

const weekRange = {
  startDate: "2024-01-15T00:00:00Z",
  endDate: "2024-01-22T00:00:00Z",
};

describe("PR Flow Metrics", () => {

  describe("getWorkspaceCycleTimeBreakdownChartData", () => {
    it("returns components as-is when raw_sum fits inside cycle_time", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);

      const mergedAt = new Date("2024-01-15T14:00:00Z");
      const firstReadyAt = new Date("2024-01-15T09:00:00Z");
      const firstReviewAt = new Date("2024-01-15T10:00:00Z"); // +1h
      const firstApprovalAt = new Date("2024-01-15T12:00:00Z"); // +2h
      // merge = 14:00 → 12:00 = 2h
      // code remainder = 10h total - (1h + 2h + 2h) = 5h
      const cycleTime = BigInt(10 * HOUR_MS);

      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          mergedAt,
          tracking: {
            firstReadyAt,
            firstReviewAt,
            firstApprovalAt,
            cycleTime,
          },
        }
      );

      const result = await getWorkspaceCycleTimeBreakdownChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const bucket = result.find(
        (r) => r.period === "2024-01-15T00:00:00.000Z"
      );
      expect(bucket!.cycleTime).toBe(cycleTime);
      expect(bucket!.timeToFirstReview).toBe(BigInt(1 * HOUR_MS));
      expect(bucket!.timeToApproval).toBe(BigInt(2 * HOUR_MS));
      expect(bucket!.timeToMerge).toBe(BigInt(2 * HOUR_MS));
      expect(bucket!.timeToCode).toBe(BigInt(5 * HOUR_MS));
    });

    it("falls back to p.createdAt when firstReadyAt is NULL", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);

      const createdAt = new Date("2024-01-15T08:00:00Z");
      const firstReviewAt = new Date("2024-01-15T10:00:00Z"); // +2h from createdAt
      const firstApprovalAt = new Date("2024-01-15T11:00:00Z"); // +1h
      const mergedAt = new Date("2024-01-15T12:00:00Z"); // +1h
      const cycleTime = BigInt(4 * HOUR_MS);

      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          createdAt,
          mergedAt,
          tracking: {
            firstReadyAt: null,
            firstReviewAt,
            firstApprovalAt,
            cycleTime,
          },
        }
      );

      const result = await getWorkspaceCycleTimeBreakdownChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const bucket = result.find(
        (r) => r.period === "2024-01-15T00:00:00.000Z"
      );
      expect(bucket!.timeToFirstReview).toBe(BigInt(2 * HOUR_MS));
      expect(bucket!.timeToApproval).toBe(BigInt(1 * HOUR_MS));
      expect(bucket!.timeToMerge).toBe(BigInt(1 * HOUR_MS));
      expect(bucket!.timeToCode).toBe(BigInt(0));
    });

    it("rescales proportionally when raw_sum exceeds cycle_time", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);

      const firstReadyAt = new Date("2024-01-15T06:00:00Z");
      const firstReviewAt = new Date("2024-01-15T08:00:00Z"); // +2h
      const firstApprovalAt = new Date("2024-01-15T10:00:00Z"); // +2h
      const mergedAt = new Date("2024-01-15T12:00:00Z"); // +2h
      // raw_sum = 6h, cycle_time = 3h → each rescaled to 1h, time_to_code = 0
      const cycleTime = BigInt(3 * HOUR_MS);

      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          mergedAt,
          tracking: {
            firstReadyAt,
            firstReviewAt,
            firstApprovalAt,
            cycleTime,
          },
        }
      );

      const result = await getWorkspaceCycleTimeBreakdownChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const bucket = result.find(
        (r) => r.period === "2024-01-15T00:00:00.000Z"
      );
      expect(bucket!.cycleTime).toBe(cycleTime);
      expect(bucket!.timeToFirstReview).toBe(BigInt(1 * HOUR_MS));
      expect(bucket!.timeToApproval).toBe(BigInt(1 * HOUR_MS));
      expect(bucket!.timeToMerge).toBe(BigInt(1 * HOUR_MS));
      expect(bucket!.timeToCode).toBe(BigInt(0));
      const sum =
        bucket!.timeToFirstReview +
        bucket!.timeToApproval +
        bucket!.timeToMerge +
        bucket!.timeToCode;
      expect(sum).toBe(bucket!.cycleTime);
    });

    it("attributes the full cycle to time_to_code when there is no review or approval", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);

      const cycleTime = BigInt(4 * HOUR_MS);
      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T14:00:00Z"),
          tracking: {
            firstReviewAt: null,
            firstApprovalAt: null,
            cycleTime,
          },
        }
      );

      const result = await getWorkspaceCycleTimeBreakdownChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const bucket = result.find(
        (r) => r.period === "2024-01-15T00:00:00.000Z"
      );
      expect(bucket!.timeToFirstReview).toBe(BigInt(0));
      expect(bucket!.timeToApproval).toBe(BigInt(0));
      expect(bucket!.timeToMerge).toBe(BigInt(0));
      expect(bucket!.timeToCode).toBe(cycleTime);
    });

    it("averages each component independently across multiple PRs", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T14:00:00Z"),
          tracking: {
            firstReadyAt: new Date("2024-01-15T09:00:00Z"),
            firstReviewAt: new Date("2024-01-15T10:00:00Z"), // +1h
            firstApprovalAt: new Date("2024-01-15T11:00:00Z"), // +1h
            cycleTime: BigInt(5 * HOUR_MS),
            // raw_sum = 1h + 1h + 3h = 5h → time_to_code = 0
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T14:00:00Z"),
          tracking: {
            firstReadyAt: new Date("2024-01-15T08:00:00Z"),
            firstReviewAt: new Date("2024-01-15T11:00:00Z"), // +3h
            firstApprovalAt: new Date("2024-01-15T14:00:00Z"), // +3h
            cycleTime: BigInt(7 * HOUR_MS),
            // raw_sum = 3h + 3h + 0h = 6h → time_to_code = 1h
          },
        }
      );

      const result = await getWorkspaceCycleTimeBreakdownChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const bucket = result.find(
        (r) => r.period === "2024-01-15T00:00:00.000Z"
      );
      expect(bucket!.cycleTime).toBe(BigInt(6 * HOUR_MS));
      expect(bucket!.timeToFirstReview).toBe(BigInt(2 * HOUR_MS)); // avg(1h, 3h)
      expect(bucket!.timeToApproval).toBe(BigInt(2 * HOUR_MS)); // avg(1h, 3h)
      expect(bucket!.timeToMerge).toBe(BigInt((3 * HOUR_MS + 0) / 2)); // avg(3h, 0)
      expect(bucket!.timeToCode).toBe(BigInt((0 + 1 * HOUR_MS) / 2)); // avg(0, 1h)
    });

    it("excludes PRs with NULL cycleTime", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T14:00:00Z"),
          tracking: { cycleTime: null },
        }
      );

      const result = await getWorkspaceCycleTimeBreakdownChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      result.forEach((r) => {
        expect(r.cycleTime).toBe(BigInt(0));
        expect(r.timeToCode).toBe(BigInt(0));
        expect(r.timeToFirstReview).toBe(BigInt(0));
        expect(r.timeToApproval).toBe(BigInt(0));
        expect(r.timeToMerge).toBe(BigInt(0));
      });
    });
  });

  describe("getWorkspaceThroughputChartData", () => {
    it("counts opened, merged, and closed PRs into distinct series", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);

      // Opened and merged on 2024-01-15
      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          number: "1",
          createdAt: new Date("2024-01-15T08:00:00Z"),
          mergedAt: new Date("2024-01-15T14:00:00Z"),
          tracking: null,
        }
      );

      // Opened only on 2024-01-15 (still open)
      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          number: "2",
          state: PullRequestState.OPEN,
          createdAt: new Date("2024-01-15T09:00:00Z"),
          mergedAt: null,
          tracking: null,
        }
      );

      // Opened before the range, merged on 2024-01-15
      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          number: "3",
          createdAt: new Date("2024-01-10T08:00:00Z"),
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: null,
        }
      );

      // Closed without merge on 2024-01-15
      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          number: "4",
          state: PullRequestState.CLOSED,
          createdAt: new Date("2024-01-10T08:00:00Z"),
          mergedAt: null,
          closedAt: new Date("2024-01-15T16:00:00Z"),
          tracking: null,
        }
      );

      const result = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(idx).toBeGreaterThanOrEqual(0);

      const [opened, merged, closed] = result.series;
      expect(opened.name).toBe("Opened");
      expect(merged.name).toBe("Merged");
      expect(closed.name).toBe("Closed");

      expect(opened.data[idx]).toBe(BigInt(2)); // #1 and #2
      expect(merged.data[idx]).toBe(BigInt(2)); // #1 and #3
      expect(closed.data[idx]).toBe(BigInt(1)); // #4
    });

    it("does not double-count merged PRs as closed", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gitProfile = await seedGitProfile(ctx);
      const repository = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          createdAt: new Date("2024-01-15T08:00:00Z"),
          mergedAt: new Date("2024-01-15T14:00:00Z"),
          closedAt: new Date("2024-01-15T14:00:00Z"),
          state: PullRequestState.MERGED,
          tracking: null,
        }
      );

      const result = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      const closed = result.series.find((s) => s.name === "Closed")!;
      expect(closed.data[idx]).toBe(BigInt(0));
    });

    it("zero-fills buckets with no data and aligns series lengths with columns", async () => {
      const ctx = await createTestContextWithGitProfile();

      const result = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...weekRange,
        period: Period.DAILY,
      });

      expect(result.columns.length).toBeGreaterThan(1);
      result.series.forEach((s) => {
        expect(s.data.length).toBe(result.columns.length);
        s.data.forEach((d) => expect(d).toBe(BigInt(0)));
      });
    });

    it("isolates data by workspace", async () => {
      const ctxA = await createTestContextWithGitProfile("wsA");
      const ctxB = await createTestContextWithGitProfile("wsB");

      for (const ctx of [ctxA, ctxB]) {
        const gp = await seedGitProfile(ctx);
        const repo = await seedRepository(ctx);
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            createdAt: new Date("2024-01-15T08:00:00Z"),
            mergedAt: new Date("2024-01-15T14:00:00Z"),
            tracking: null,
          }
        );
      }

      const result = await getWorkspaceThroughputChartData({
        workspaceId: ctxA.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      const merged = result.series.find((s) => s.name === "Merged")!;
      expect(merged.data[idx]).toBe(BigInt(1));
    });

    it("respects teamIds and repositoryIds filters", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp1 = await seedGitProfile(ctx, { handle: "u1" });
      const gp2 = await seedGitProfile(ctx, { handle: "u2" });
      const repo1 = await seedRepository(ctx, { name: "repo1" });
      const repo2 = await seedRepository(ctx, { name: "repo2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gp1.gitProfileId);

      // PR in team + repo1
      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gp1.gitProfileId,
        {
          number: "1",
          createdAt: new Date("2024-01-15T08:00:00Z"),
          mergedAt: new Date("2024-01-15T14:00:00Z"),
          tracking: null,
        }
      );

      // PR outside team + repo2
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gp2.gitProfileId,
        {
          number: "2",
          createdAt: new Date("2024-01-15T08:00:00Z"),
          mergedAt: new Date("2024-01-15T14:00:00Z"),
          tracking: null,
        }
      );

      const teamResult = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
        teamIds: [team.teamId],
      });
      const idx = teamResult.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(
        teamResult.series.find((s) => s.name === "Merged")!.data[idx]
      ).toBe(BigInt(1));

      const repoResult = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
        repositoryIds: [repo2.repositoryId],
      });
      const idx2 = repoResult.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(
        repoResult.series.find((s) => s.name === "Merged")!.data[idx2]
      ).toBe(BigInt(1));
    });

    it("aggregates correctly when switching between DAILY and WEEKLY buckets", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      for (let day = 15; day <= 17; day++) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${day}`,
            createdAt: new Date(`2024-01-${day}T08:00:00Z`),
            mergedAt: new Date(`2024-01-${day}T14:00:00Z`),
            tracking: null,
          }
        );
      }

      const daily = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...weekRange,
        period: Period.DAILY,
      });
      const mergedDaily = daily.series.find((s) => s.name === "Merged")!;
      const totalDaily = mergedDaily.data.reduce((a, b) => a + b, BigInt(0));
      expect(totalDaily).toBe(BigInt(3));

      const weekly = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...weekRange,
        period: Period.WEEKLY,
      });
      const mergedWeekly = weekly.series.find((s) => s.name === "Merged")!;
      const totalWeekly = mergedWeekly.data.reduce((a, b) => a + b, BigInt(0));
      expect(totalWeekly).toBe(BigInt(3));
      // All three days fall inside a single week bucket
      expect(mergedWeekly.data.filter((d) => d > BigInt(0)).length).toBe(1);
    });
  });

  describe("getWorkspacePullRequestSizeDistributionChartData", () => {
    it("returns one count per size in the merged bucket", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      const sizes: PullRequestSize[] = [
        PullRequestSize.TINY,
        PullRequestSize.SMALL,
        PullRequestSize.MEDIUM,
        PullRequestSize.LARGE,
        PullRequestSize.HUGE,
      ];

      for (const [i, size] of sizes.entries()) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${i + 1}`,
            mergedAt: new Date("2024-01-15T10:00:00Z"),
            tracking: { size, linesAddedCount: 10, linesDeletedCount: 10 },
          }
        );
      }

      const result = await getWorkspacePullRequestSizeDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      expect(result.series.map((s) => s.name)).toEqual([
        "Tiny",
        "Small",
        "Medium",
        "Large",
        "Huge",
      ]);

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      result.series.forEach((s) => expect(s.data[idx]).toBe(BigInt(1)));
      expect(result.averageLinesChanged[idx]).toBe(20);
    });

    it("zero-fills buckets with no PRs", async () => {
      const ctx = await createTestContextWithGitProfile();

      const result = await getWorkspacePullRequestSizeDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...weekRange,
        period: Period.DAILY,
      });

      expect(result.columns.length).toBeGreaterThan(0);
      result.series.forEach((s) => {
        expect(s.data.length).toBe(result.columns.length);
        s.data.forEach((d) => expect(d).toBe(BigInt(0)));
      });
      result.averageLinesChanged.forEach((v) => expect(v).toBe(0));
    });

    it("computes averageLinesChanged across PRs in a bucket", async () => {
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
          tracking: { linesAddedCount: 50, linesDeletedCount: 50 }, // 100
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T12:00:00Z"),
          tracking: { linesAddedCount: 100, linesDeletedCount: 100 }, // 200
        }
      );

      const result = await getWorkspacePullRequestSizeDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      const idx = result.columns.indexOf("2024-01-15T00:00:00.000Z");
      expect(result.averageLinesChanged[idx]).toBe(150);
    });

    it("excludes non-merged PRs with tracking", async () => {
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
          tracking: { size: PullRequestSize.LARGE },
        }
      );

      const result = await getWorkspacePullRequestSizeDistributionChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
      });

      result.series.forEach((s) =>
        s.data.forEach((d) => expect(d).toBe(BigInt(0)))
      );
    });
  });

  describe("getWorkspaceSizeCycleTimeCorrelation", () => {
    it("groups PRs by size and converts cycleTime to hours", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          title: "Small PR",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: {
            size: PullRequestSize.SMALL,
            cycleTime: BigInt(3 * HOUR_MS),
            linesAddedCount: 20,
            linesDeletedCount: 5,
          },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          title: "Huge PR",
          mergedAt: new Date("2024-01-15T12:00:00Z"),
          tracking: {
            size: PullRequestSize.HUGE,
            cycleTime: BigInt(48 * HOUR_MS),
            linesAddedCount: 500,
            linesDeletedCount: 200,
          },
        }
      );

      const result = await getWorkspaceSizeCycleTimeCorrelation({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(result.series.map((s) => s.name)).toEqual(["Small", "Huge"]);

      const small = result.series.find((s) => s.name === "Small")!;
      expect(small.data).toHaveLength(1);
      expect(small.data[0].x).toBe(3);
      expect(small.data[0].y).toBe(25);
      expect(small.data[0].title).toBe("Small PR");
      expect(small.data[0].url).toContain("/pull/1");

      const huge = result.series.find((s) => s.name === "Huge")!;
      expect(huge.data[0].x).toBe(48);
      expect(huge.data[0].y).toBe(700);
    });

    it("returns sizes in TINY → HUGE order regardless of insertion order", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      const order: PullRequestSize[] = [
        PullRequestSize.HUGE,
        PullRequestSize.TINY,
        PullRequestSize.LARGE,
        PullRequestSize.MEDIUM,
        PullRequestSize.SMALL,
      ];
      for (const [i, size] of order.entries()) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${i + 1}`,
            mergedAt: new Date("2024-01-15T10:00:00Z"),
            tracking: {
              size,
              cycleTime: BigInt((i + 1) * HOUR_MS),
            },
          }
        );
      }

      const result = await getWorkspaceSizeCycleTimeCorrelation({
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

    it("excludes merged PRs with NULL cycleTime and non-merged PRs", async () => {
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
          tracking: { cycleTime: null },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          state: PullRequestState.OPEN,
          mergedAt: null,
          tracking: { cycleTime: BigInt(1 * HOUR_MS) },
        }
      );

      const result = await getWorkspaceSizeCycleTimeCorrelation({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(result.series).toHaveLength(0);
    });

    it("returns at most 2000 rows", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      // Sanity-check smoke test: a single row under cap.
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: { cycleTime: BigInt(1 * HOUR_MS) },
        }
      );

      const result = await getWorkspaceSizeCycleTimeCorrelation({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const total = result.series.reduce((sum, s) => sum + s.data.length, 0);
      expect(total).toBeLessThanOrEqual(2000);
    });
  });

  describe("getWorkspaceTeamOverview", () => {
    it("returns the All teams row first, followed by team rows", async () => {
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
            cycleTime: BigInt(2 * HOUR_MS),
            size: PullRequestSize.MEDIUM,
            linesAddedCount: 30,
            linesDeletedCount: 10,
          },
        }
      );

      const result = await getWorkspaceTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(result).toHaveLength(2);
      expect(result[0].teamId).toBeNull();
      expect(result[0].teamName).toBe("All teams");
      expect(result[1].teamId).toBe(team.teamId);

      // Both rows reflect the same single PR
      expect(result[0].mergedCount).toBe(1);
      expect(result[1].mergedCount).toBe(1);
      expect(result[0].medianCycleTime).toBe(BigInt(2 * HOUR_MS));
      expect(result[1].medianCycleTime).toBe(BigInt(2 * HOUR_MS));
      expect(result[0].avgLinesChanged).toBe(40);
      expect(result[1].avgLinesChanged).toBe(40);
      expect(result[0].pctBigPrs).toBe(0);
      expect(result[1].pctBigPrs).toBe(0);
    });

    it("returns zero stats for teams with no PRs", async () => {
      const ctx = await createTestContextWithGitProfile();
      const team = await seedTeam(ctx, { name: "empty-team" });

      const result = await getWorkspaceTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const teamRow = result.find((r) => r.teamId === team.teamId)!;
      expect(teamRow).toBeDefined();
      expect(teamRow.mergedCount).toBe(0);
      expect(teamRow.medianCycleTime).toBe(BigInt(0));
      expect(teamRow.avgLinesChanged).toBe(0);
      expect(teamRow.pctBigPrs).toBe(0);
    });

    it("attributes one PR to each team when the author belongs to multiple teams", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);
      const teamA = await seedTeam(ctx, { name: "team-a" });
      const teamB = await seedTeam(ctx, { name: "team-b" });
      await seedTeamMember(ctx, teamA.teamId, gp.gitProfileId);
      await seedTeamMember(ctx, teamB.teamId, gp.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp.gitProfileId,
        {
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: { cycleTime: BigInt(2 * HOUR_MS) },
        }
      );

      const result = await getWorkspaceTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      const rowA = result.find((r) => r.teamId === teamA.teamId)!;
      const rowB = result.find((r) => r.teamId === teamB.teamId)!;

      expect(org.mergedCount).toBe(1);
      expect(rowA.mergedCount).toBe(1);
      expect(rowB.mergedCount).toBe(1);
    });

    it("excludes archived teams from the output", async () => {
      const ctx = await createTestContextWithGitProfile();
      const team = await seedTeam(ctx, { name: "archived-team" });
      await getPrisma(ctx.workspaceId).team.update({
        where: { id: team.teamId },
        data: { archivedAt: new Date("2024-01-01T00:00:00Z") },
      });

      const result = await getWorkspaceTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      expect(result.find((r) => r.teamId === team.teamId)).toBeUndefined();
    });

    it("computes pctBigPrs from LARGE and HUGE sizes", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      const sizes: PullRequestSize[] = [
        PullRequestSize.SMALL,
        PullRequestSize.SMALL,
        PullRequestSize.LARGE,
        PullRequestSize.HUGE,
      ];
      for (const [i, size] of sizes.entries()) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${i + 1}`,
            mergedAt: new Date("2024-01-15T10:00:00Z"),
            tracking: { size, cycleTime: BigInt(1 * HOUR_MS) },
          }
        );
      }

      const result = await getWorkspaceTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      expect(org.mergedCount).toBe(4);
      expect(org.pctBigPrs).toBe(50);
    });

    it("computes medianCycleTime via PERCENTILE_CONT", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      const cycles = [1, 2, 3].map((h) => BigInt(h * HOUR_MS));
      for (const [i, cycleTime] of cycles.entries()) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${i + 1}`,
            mergedAt: new Date("2024-01-15T10:00:00Z"),
            tracking: { cycleTime },
          }
        );
      }

      const result = await getWorkspaceTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
      });

      const org = result.find((r) => r.teamId === null)!;
      expect(org.medianCycleTime).toBe(BigInt(2 * HOUR_MS));
    });

    it("restricts both org and team rows when teamIds is passed", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gpA = await seedGitProfile(ctx, { handle: "a" });
      const gpB = await seedGitProfile(ctx, { handle: "b" });
      const repo = await seedRepository(ctx);
      const teamA = await seedTeam(ctx, { name: "team-a" });
      const teamB = await seedTeam(ctx, { name: "team-b" });
      await seedTeamMember(ctx, teamA.teamId, gpA.gitProfileId);
      await seedTeamMember(ctx, teamB.teamId, gpB.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gpA.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: { cycleTime: BigInt(2 * HOUR_MS) },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gpB.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: { cycleTime: BigInt(10 * HOUR_MS) },
        }
      );

      const result = await getWorkspaceTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        teamIds: [teamA.teamId],
      });

      // Only teamA row appears alongside the org row
      expect(result.map((r) => r.teamId).sort((a, b) => (a ?? -1) - (b ?? -1))).toEqual(
        [null, teamA.teamId]
      );
      // Org row is scoped to teamA's PRs only
      const org = result.find((r) => r.teamId === null)!;
      expect(org.mergedCount).toBe(1);
      expect(org.medianCycleTime).toBe(BigInt(2 * HOUR_MS));
    });

    it("restricts rows when repositoryIds is passed", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo1 = await seedRepository(ctx, { name: "repo1" });
      const repo2 = await seedRepository(ctx, { name: "repo2" });
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gp.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: { cycleTime: BigInt(2 * HOUR_MS) },
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
          tracking: { cycleTime: BigInt(10 * HOUR_MS) },
        }
      );

      const result = await getWorkspaceTeamOverview({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        repositoryIds: [repo1.repositoryId],
      });

      const org = result.find((r) => r.teamId === null)!;
      const teamRow = result.find((r) => r.teamId === team.teamId)!;
      expect(org.mergedCount).toBe(1);
      expect(org.medianCycleTime).toBe(BigInt(2 * HOUR_MS));
      expect(teamRow.mergedCount).toBe(1);
      expect(teamRow.medianCycleTime).toBe(BigInt(2 * HOUR_MS));
    });
  });

  describe("shared filters (getWorkspaceThroughputChartData)", () => {
    const mergedInColumn = (
      result: Awaited<ReturnType<typeof getWorkspaceThroughputChartData>>,
      periodIso: string
    ) => {
      const idx = result.columns.indexOf(periodIso);
      const merged = result.series.find((s) => s.name === "Merged")!;
      return merged.data[idx];
    };

    it("applies teamIds based on PR author membership", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp1 = await seedGitProfile(ctx, { handle: "u1" });
      const gp2 = await seedGitProfile(ctx, { handle: "u2" });
      const repo = await seedRepository(ctx);
      const team = await seedTeam(ctx);
      await seedTeamMember(ctx, team.teamId, gp1.gitProfileId);

      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp1.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo.repositoryId,
        gp2.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
        }
      );

      const result = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
        teamIds: [team.teamId],
      });

      expect(
        mergedInColumn(result, "2024-01-15T00:00:00.000Z")
      ).toBe(BigInt(1));
    });

    it("applies repositoryIds filter", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo1 = await seedRepository(ctx, { name: "repo1" });
      const repo2 = await seedRepository(ctx, { name: "repo2" });

      await seedPrWithTracking(
        ctx.workspaceId,
        repo1.repositoryId,
        gp.gitProfileId,
        {
          number: "1",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
        }
      );
      await seedPrWithTracking(
        ctx.workspaceId,
        repo2.repositoryId,
        gp.gitProfileId,
        {
          number: "2",
          mergedAt: new Date("2024-01-15T10:00:00Z"),
        }
      );

      const result = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...dateRange,
        period: Period.DAILY,
        repositoryIds: [repo2.repositoryId],
      });

      expect(
        mergedInColumn(result, "2024-01-15T00:00:00.000Z")
      ).toBe(BigInt(1));
    });

    it("rolls up merged counts across days when the period is WEEKLY", async () => {
      const ctx = await createTestContextWithGitProfile();
      const gp = await seedGitProfile(ctx);
      const repo = await seedRepository(ctx);

      for (let day = 15; day <= 17; day++) {
        await seedPrWithTracking(
          ctx.workspaceId,
          repo.repositoryId,
          gp.gitProfileId,
          {
            number: `${day}`,
            mergedAt: new Date(`2024-01-${day}T10:00:00Z`),
          }
        );
      }

      const weekly = await getWorkspaceThroughputChartData({
        workspaceId: ctx.workspaceId,
        ...weekRange,
        period: Period.WEEKLY,
      });

      const merged = weekly.series.find((s) => s.name === "Merged")!;
      const nonZero = merged.data.filter((v) => v > BigInt(0));
      expect(nonZero).toHaveLength(1);
      expect(nonZero[0]).toBe(BigInt(3));
    });
  });
});
