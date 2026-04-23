import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceReviewTurnaroundTime,
  getWorkspaceTimeToApprovalChart,
  getWorkspaceSizeCommentCorrelation,
  getWorkspaceCodeReviewDistributionChartData,
  getCodeReviewTeamOverview,
  getKpiTimeToFirstReview,
  getKpiTimeToApproval,
  getKpiAvgCommentsPerPr,
  getKpiPrsWithoutApproval,
} from "../../services/chart-code-review-efficiency.service";
import { buildCommonChartFilters } from "./utils";

export const codeReviewEfficiencyMetricsQuery = createFieldResolver(
  "CodeReviewEfficiencyMetrics",
  {
    reviewTurnaroundTime: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.reviewTurnaroundTime", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildCommonChartFilters(input, context.workspaceId);
      return getWorkspaceReviewTurnaroundTime(filters);
    },
    timeToApproval: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.timeToApproval", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildCommonChartFilters(input, context.workspaceId);
      return getWorkspaceTimeToApprovalChart(filters);
    },
    sizeCommentCorrelation: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.sizeCommentCorrelation", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildCommonChartFilters(input, context.workspaceId);
      return getWorkspaceSizeCommentCorrelation(filters);
    },
    codeReviewDistribution: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.codeReviewDistribution", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildCommonChartFilters(input, context.workspaceId);
      return getWorkspaceCodeReviewDistributionChartData(filters);
    },
    teamOverview: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.teamOverview", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildCommonChartFilters(input, context.workspaceId);
      return getCodeReviewTeamOverview(filters);
    },
    kpi: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.kpi", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildCommonChartFilters(input, context.workspaceId);

      const [
        timeToFirstReview,
        timeToApproval,
        avgCommentsPerPr,
        prsWithoutApproval,
      ] = await Promise.all([
        getKpiTimeToFirstReview(filters),
        getKpiTimeToApproval(filters),
        getKpiAvgCommentsPerPr(filters),
        getKpiPrsWithoutApproval(filters),
      ]);

      return {
        timeToFirstReview,
        timeToApproval,
        avgCommentsPerPr,
        prsWithoutApproval,
      };
    },
  }
);
