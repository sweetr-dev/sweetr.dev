import { thirtyDaysAgo } from "../../../../lib/date";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceCycleTimeBreakdownChartData,
  getWorkspaceCycleTimeChartData,
  getWorkspacePullRequestSizeDistributionChartData,
  getWorkspaceSizeCycleTimeCorrelation,
  getWorkspaceTeamOverview,
  getWorkspaceThroughputChartData,
  getWorkspaceTimeForApprovalChartData,
  getWorkspaceTimeForFirstReviewChartData,
  getWorkspaceTimeToCodeChartData,
  getWorkspaceTimeToMergeChartData,
} from "../../services/chart-pull-request.service";
import { PullRequestFlowChartFilters } from "../../services/chart-pull-request.types";

const buildFilters = (
  input: Record<string, any>,
  workspaceId: number
): PullRequestFlowChartFilters => ({
  workspaceId,
  startDate: input.dateRange.from ?? thirtyDaysAgo().toISOString(),
  endDate: input.dateRange.to ?? new Date().toISOString(),
  period: input.period,
  teamIds: input.teamIds ?? undefined,
  repositoryIds: input.repositoryIds ?? undefined,
});

export const prFlowMetricsQuery = createFieldResolver(
  "PullRequestFlowMetrics",
  {
    throughput: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.throughput", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      return getWorkspaceThroughputChartData(filters);
    },
    timeToCode: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.timeToCode", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      const result = await getWorkspaceTimeToCodeChartData(filters);

      return {
        columns: result.map((r) => r.period),
        data: result.map((r) => r.value),
      };
    },
    cycleTime: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.cycleTime", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      const result = await getWorkspaceCycleTimeChartData(filters);

      return {
        columns: result.map((r) => r.period),
        data: result.map((r) => r.value),
      };
    },
    timeToMerge: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.timeToMerge", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      const result = await getWorkspaceTimeToMergeChartData(filters);

      return {
        columns: result.map((r) => r.period),
        data: result.map((r) => r.value),
      };
    },
    timeToFirstReview: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.timeToFirstReview", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      const result = await getWorkspaceTimeForFirstReviewChartData(filters);

      return {
        columns: result.map((r) => r.period),
        data: result.map((r) => r.value),
      };
    },
    timeToApproval: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.timeToApproval", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      const result = await getWorkspaceTimeForApprovalChartData(filters);

      return {
        columns: result.map((r) => r.period),
        data: result.map((r) => r.value),
      };
    },
    cycleTimeBreakdown: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.cycleTimeBreakdown", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      const result = await getWorkspaceCycleTimeBreakdownChartData(filters);

      return {
        columns: result.map((r) => r.period),
        cycleTime: result.map((r) => r.cycleTime),
        timeToCode: result.map((r) => r.timeToCode),
        timeToFirstReview: result.map((r) => r.timeToFirstReview),
        timeToApproval: result.map((r) => r.timeToApproval),
        timeToMerge: result.map((r) => r.timeToMerge),
      };
    },
    pullRequestSizeDistribution: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.pullRequestSizeDistribution", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      return getWorkspacePullRequestSizeDistributionChartData(filters);
    },
    sizeCycleTimeCorrelation: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.sizeCycleTimeCorrelation", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      return getWorkspaceSizeCycleTimeCorrelation(filters);
    },
    teamOverview: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.teamOverview", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildFilters(input, context.workspaceId);
      return getWorkspaceTeamOverview(filters);
    },
  }
);
