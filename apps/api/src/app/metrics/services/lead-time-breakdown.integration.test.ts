import { PullRequestState } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { createTestContextWithGitProfile } from "../../../../test/integration-setup/context";
import {
  seedApplication,
  seedDeployment,
  seedDeploymentPullRequest,
  seedEnvironment,
  seedGitProfile,
  seedPullRequest,
  seedRepository,
  seedTeam,
} from "../../../../test/seed";
import { Period } from "../../../graphql-types";
import { getLeadTimeBreakdown } from "./lead-time-breakdown.service";

describe("Lead Time Breakdown", () => {
  it("calculates breakdown metrics for a single PR", async () => {
    const ctx = await createTestContextWithGitProfile();
    const gitProfile = await seedGitProfile(ctx);
    const repository = await seedRepository(ctx);
    const application = await seedApplication(ctx, repository.repositoryId);
    const environment = await seedEnvironment(ctx, { isProduction: true });

    const pr = await seedPullRequest(
      ctx,
      repository.repositoryId,
      gitProfile.gitProfileId,
      {
        title: "Feature PR",
        state: PullRequestState.MERGED,
      }
    );

    // Seed tracking data with cumulative times (from PR creation)
    // Durations: coding: 1h, review lag: 1h, approval: 1h, merge: 4h, deploy: 5h
    // Note: timeToFirstReview and timeToFirstApproval are cumulative, so actual durations
    // are calculated as deltas (e.g., review lag = 2h - 1h = 1h)
    // All in milliseconds
    const trackingData = {
      timeToCode: BigInt(3600000), // 1h (coding duration)
      timeToFirstReview: BigInt(7200000), // 2h cumulative (review lag = 2h - 1h = 1h)
      timeToFirstApproval: BigInt(10800000), // 3h cumulative (approval = 3h - 2h = 1h)
      timeToMerge: BigInt(14400000), // 4h (merge duration)
      timeToDeploy: BigInt(18000000), // 5h (deploy duration)
    };

    await ctx.prisma.pullRequestTracking.create({
      data: {
        pullRequestId: pr.pullRequestId,
        workspaceId: ctx.workspaceId,
        size: "MEDIUM",
        ...trackingData,
      },
    });

    const deployment = await seedDeployment(
      ctx,
      application.applicationId,
      environment.environmentId,
      {
        deployedAt: new Date(),
        authorId: gitProfile.gitProfileId,
      }
    );

    await seedDeploymentPullRequest(
      ctx,
      deployment.deploymentId,
      pr.pullRequestId
    );

    const result = await getLeadTimeBreakdown({
      workspaceId: ctx.workspaceId,
      dateRange: {
        from: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        to: new Date(Date.now() + 86400000).toISOString(), // 1 day future
      },
      period: Period.DAILY,
    });

    expect(result.codingTime.currentAmount).toBe(trackingData.timeToCode);
    expect(result.timeToFirstReview.currentAmount).toBe(
      trackingData.timeToFirstReview - trackingData.timeToCode
    );
    expect(result.timeToApprove.currentAmount).toBe(
      trackingData.timeToFirstApproval - trackingData.timeToFirstReview
    );
    expect(result.timeToMerge.currentAmount).toBe(trackingData.timeToMerge);
    expect(result.timeToDeploy.currentAmount).toBe(trackingData.timeToDeploy);
  });

  it("calculates comparisons with previous period", async () => {
    const ctx = await createTestContextWithGitProfile();
    const gitProfile = await seedGitProfile(ctx);
    const repository = await seedRepository(ctx);
    const application = await seedApplication(ctx, repository.repositoryId);
    const environment = await seedEnvironment(ctx, { isProduction: true });

    // Previous period deployment (2 days ago)
    const prevPr = await seedPullRequest(
      ctx,
      repository.repositoryId,
      gitProfile.gitProfileId
    );
    await ctx.prisma.pullRequestTracking.create({
      data: {
        pullRequestId: prevPr.pullRequestId,
        workspaceId: ctx.workspaceId,
        size: "MEDIUM",
        timeToCode: BigInt(3600000), // 1h
        timeToFirstReview: BigInt(7200000), // 2h (1h code + 1h review)
        timeToFirstApproval: BigInt(10800000), // 3h (2h + 1h approval)
        timeToMerge: BigInt(3600000), // 1h
        timeToDeploy: BigInt(3600000), // 1h
      },
    });
    const prevDeployment = await seedDeployment(
      ctx,
      application.applicationId,
      environment.environmentId,
      {
        deployedAt: new Date(Date.now() - 172800000), // 2 days ago
        authorId: gitProfile.gitProfileId,
      }
    );
    await seedDeploymentPullRequest(
      ctx,
      prevDeployment.deploymentId,
      prevPr.pullRequestId
    );

    // Current period deployment (today)
    const currPr = await seedPullRequest(
      ctx,
      repository.repositoryId,
      gitProfile.gitProfileId
    );
    await ctx.prisma.pullRequestTracking.create({
      data: {
        pullRequestId: currPr.pullRequestId,
        workspaceId: ctx.workspaceId,
        size: "MEDIUM",
        timeToCode: BigInt(7200000), // 2h (+100%)
        timeToFirstReview: BigInt(9000000), // 2.5h (2h code + 0.5h review) -> 0.5h duration (-50%)
        timeToFirstApproval: BigInt(12600000), // 3.5h (2.5h + 1h approval) -> 1h duration (0%)
        timeToMerge: BigInt(7200000), // 2h (+100%)
        timeToDeploy: BigInt(1800000), // 0.5h (-50%)
      },
    });
    const currDeployment = await seedDeployment(
      ctx,
      application.applicationId,
      environment.environmentId,
      {
        deployedAt: new Date(),
        authorId: gitProfile.gitProfileId,
      }
    );
    await seedDeploymentPullRequest(
      ctx,
      currDeployment.deploymentId,
      currPr.pullRequestId
    );

    const result = await getLeadTimeBreakdown({
      workspaceId: ctx.workspaceId,
      dateRange: {
        from: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        to: new Date(Date.now() + 86400000).toISOString(), // 1 day future
      },
      period: Period.DAILY,
    });

    expect(result.codingTime.change).toBeCloseTo(100, 1);
    expect(result.timeToFirstReview.change).toBeCloseTo(-50, 1);
    expect(result.timeToApprove.change).toBe(0);
    expect(result.timeToMerge.change).toBeCloseTo(100, 1);
    expect(result.timeToDeploy.change).toBeCloseTo(-50, 1);
  });

  it("respects filters (teamIds)", async () => {
    const ctx = await createTestContextWithGitProfile();
    const gitProfile = await seedGitProfile(ctx);
    const repository = await seedRepository(ctx);
    const team1 = await seedTeam(ctx);
    const team2 = await seedTeam(ctx);
    const app1 = await seedApplication(ctx, repository.repositoryId, {
      teamId: team1.teamId,
      name: "app-1",
    });
    const app2 = await seedApplication(ctx, repository.repositoryId, {
      teamId: team2.teamId,
      name: "app-2",
    });
    const environment = await seedEnvironment(ctx, { isProduction: true });

    // Team 1 PR: 1h coding time
    const pr1 = await seedPullRequest(
      ctx,
      repository.repositoryId,
      gitProfile.gitProfileId
    );
    await ctx.prisma.pullRequestTracking.create({
      data: {
        pullRequestId: pr1.pullRequestId,
        workspaceId: ctx.workspaceId,
        size: "MEDIUM",
        timeToCode: BigInt(3600000),
      },
    });
    const dep1 = await seedDeployment(
      ctx,
      app1.applicationId,
      environment.environmentId,
      { deployedAt: new Date(), authorId: gitProfile.gitProfileId }
    );
    await seedDeploymentPullRequest(ctx, dep1.deploymentId, pr1.pullRequestId);

    // Team 2 PR: 5h coding time
    const pr2 = await seedPullRequest(
      ctx,
      repository.repositoryId,
      gitProfile.gitProfileId
    );
    await ctx.prisma.pullRequestTracking.create({
      data: {
        pullRequestId: pr2.pullRequestId,
        workspaceId: ctx.workspaceId,
        size: "MEDIUM",
        timeToCode: BigInt(18000000),
      },
    });
    const dep2 = await seedDeployment(
      ctx,
      app2.applicationId,
      environment.environmentId,
      { deployedAt: new Date(), authorId: gitProfile.gitProfileId }
    );
    await seedDeploymentPullRequest(ctx, dep2.deploymentId, pr2.pullRequestId);

    const result = await getLeadTimeBreakdown({
      workspaceId: ctx.workspaceId,
      dateRange: {
        from: new Date(Date.now() - 86400000).toISOString(),
        to: new Date(Date.now() + 86400000).toISOString(),
      },
      period: Period.DAILY,
      teamIds: [team1.teamId],
    });

    // Should only average Team 1's PRs (1h)
    expect(result.codingTime.currentAmount).toBe(BigInt(3600000));
  });

  it("handles mixed scenarios (some PRs with review, some without)", async () => {
    const ctx = await createTestContextWithGitProfile();
    const gitProfile = await seedGitProfile(ctx);
    const repository = await seedRepository(ctx);
    const application = await seedApplication(ctx, repository.repositoryId);
    const environment = await seedEnvironment(ctx, { isProduction: true });

    // PR 1: Standard PR with review
    // Coding: 1h, Review Duration: 2h
    const pr1 = await seedPullRequest(
      ctx,
      repository.repositoryId,
      gitProfile.gitProfileId
    );
    await ctx.prisma.pullRequestTracking.create({
      data: {
        pullRequestId: pr1.pullRequestId,
        workspaceId: ctx.workspaceId,
        size: "MEDIUM",
        timeToCode: BigInt(3600000), // 1h
        timeToFirstReview: BigInt(10800000), // 3h (1h code + 2h review)
      },
    });
    const dep1 = await seedDeployment(
      ctx,
      application.applicationId,
      environment.environmentId,
      { deployedAt: new Date(), authorId: gitProfile.gitProfileId }
    );
    await seedDeploymentPullRequest(ctx, dep1.deploymentId, pr1.pullRequestId);

    // PR 2: Hotfix without review
    // Coding: 100h, Review: NULL
    const pr2 = await seedPullRequest(
      ctx,
      repository.repositoryId,
      gitProfile.gitProfileId
    );
    await ctx.prisma.pullRequestTracking.create({
      data: {
        pullRequestId: pr2.pullRequestId,
        workspaceId: ctx.workspaceId,
        size: "SMALL",
        timeToCode: BigInt(360000000), // 100h
        timeToFirstReview: null,
      },
    });
    const dep2 = await seedDeployment(
      ctx,
      application.applicationId,
      environment.environmentId,
      { deployedAt: new Date(), authorId: gitProfile.gitProfileId }
    );
    await seedDeploymentPullRequest(ctx, dep2.deploymentId, pr2.pullRequestId);

    const result = await getLeadTimeBreakdown({
      workspaceId: ctx.workspaceId,
      dateRange: {
        from: new Date(Date.now() - 86400000).toISOString(),
        to: new Date(Date.now() + 86400000).toISOString(),
      },
      period: Period.DAILY,
    });

    // Coding time should be average of both: (1h + 100h) / 2 = 50.5h = 181800000ms
    expect(result.codingTime.currentAmount).toBe(BigInt(181800000));

    // Review time should ignore PR 2 (NULL) and only count PR 1's duration
    // PR 1 Duration: 3h (cumulative) - 1h (code) = 2h = 7200000ms
    // If we had the bug, it might be: (3h - 50.5h) = -47.5h (Impossible/Negative)
    expect(result.timeToFirstReview.currentAmount).toBe(BigInt(7200000));
  });
});
