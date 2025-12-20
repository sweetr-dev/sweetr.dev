import { thirtyDaysAgo } from "../../../../lib/date";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getCodeReviewDistributionChartData } from "../../services/chart-code-review.service";
import {
  getCycleTimeChartData,
  getPullRequestSizeDistributionChartData,
  getTimeForApprovalChartData,
  getTimeForFirstReviewChartData,
  getTimeToMergeChartData,
} from "../../services/chart-pull-request.service";

export const pullRequestMetricsQuery = createFieldResolver("Metrics", {
  codeReviewDistribution: async (_, { input }, context) => {
    logger.info("query.metrics.codeReviewDistribution", {
      input,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getCodeReviewDistributionChartData({
      workspaceId: context.workspaceId,
      startDate: input.dateRange.from || thirtyDaysAgo().toISOString(),
      endDate: input.dateRange.to || new Date().toISOString(),
      teamId: input.teamId,
      period: input.period,
    });

    return result;
  },
  timeToMerge: async (_, { input }, context) => {
    logger.info("query.metrics.timeToMerge", {
      input,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getTimeToMergeChartData({
      workspaceId: context.workspaceId,
      startDate: input.dateRange.from || thirtyDaysAgo().toISOString(),
      endDate: input.dateRange.to || new Date().toISOString(),
      teamId: input.teamId,
      period: input.period,
    });

    return {
      columns: result.map((chartData) => chartData.period),
      data: result.map((chartData) => chartData.value),
    };
  },
  timeForFirstReview: async (_, { input }, context) => {
    logger.info("query.metrics.timeForFirstReview", {
      input,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getTimeForFirstReviewChartData({
      workspaceId: context.workspaceId,
      startDate: input.dateRange.from || thirtyDaysAgo().toISOString(),
      endDate: input.dateRange.to || new Date().toISOString(),
      teamId: input.teamId,
      period: input.period,
    });

    return {
      columns: result.map((chartData) => chartData.period),
      data: result.map((chartData) => chartData.value),
    };
  },
  timeForApproval: async (_, { input }, context) => {
    logger.info("query.metrics.timeForApproval", {
      input,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getTimeForApprovalChartData({
      workspaceId: context.workspaceId,
      startDate: input.dateRange.from || thirtyDaysAgo().toISOString(),
      endDate: input.dateRange.to || new Date().toISOString(),
      teamId: input.teamId,
      period: input.period,
    });

    return {
      columns: result.map((chartData) => chartData.period),
      data: result.map((chartData) => chartData.value),
    };
  },
  cycleTime: async (_, { input }, context) => {
    logger.info("query.metrics.cycleTime", {
      input,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getCycleTimeChartData({
      workspaceId: context.workspaceId,
      startDate: input.dateRange.from || thirtyDaysAgo().toISOString(),
      endDate: input.dateRange.to || new Date().toISOString(),
      teamId: input.teamId,
      period: input.period,
    });

    return {
      columns: result.map((chartData) => chartData.period),
      data: result.map((chartData) => chartData.value),
    };
  },
  pullRequestSizeDistribution: async (_, { input }, context) => {
    logger.info("query.metrics.pullRequestSizeDistribution", {
      input,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return getPullRequestSizeDistributionChartData({
      workspaceId: context.workspaceId,
      startDate: input.dateRange.from || thirtyDaysAgo().toISOString(),
      endDate: input.dateRange.to || new Date().toISOString(),
      teamId: input.teamId,
      period: input.period,
    });
  },
});
