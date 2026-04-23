import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceCycleTimeBreakdownChartData,
  getWorkspacePullRequestSizeDistributionChartData,
  getWorkspaceSizeCycleTimeCorrelation,
  getWorkspaceTeamOverview,
  getWorkspaceThroughputChartData,
} from "../../services/pr-flow.service";
import { buildCommonChartFilters } from "./utils";

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

      const filters = buildCommonChartFilters(input, context.workspaceId);

      return getWorkspaceThroughputChartData(filters);
    },
    cycleTimeBreakdown: async (_, { input }, context) => {
      logger.info("query.metrics.prFlow.cycleTimeBreakdown", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildCommonChartFilters(input, context.workspaceId);
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

      const filters = buildCommonChartFilters(input, context.workspaceId);
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

      const filters = buildCommonChartFilters(input, context.workspaceId);

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

      const filters = buildCommonChartFilters(input, context.workspaceId);

      return getWorkspaceTeamOverview(filters);
    },
  }
);
