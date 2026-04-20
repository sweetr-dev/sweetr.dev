import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceReviewTurnaroundTime,
  getWorkspaceTimeToApprovalChart,
  getWorkspacePrsWithoutApproval,
  getWorkspaceSizeCommentCorrelation,
  getWorkspaceCodeReviewDistributionChartData,
  getCodeReviewTeamOverview,
  getKpiTimeToFirstReview,
  getKpiTimeToApproval,
  getKpiAvgCommentsPerPr,
  getKpiPrsWithoutApproval,
} from "../../services/chart-code-review-efficiency.service";
import { buildPullRequestFlowChartFilters } from "./utils";

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

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
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

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
      return getWorkspaceTimeToApprovalChart(filters);
    },
    prsWithoutApproval: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.prsWithoutApproval", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
      return getWorkspacePrsWithoutApproval(filters);
    },
    sizeCommentCorrelation: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.sizeCommentCorrelation", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
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

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
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

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
      return getCodeReviewTeamOverview(filters);
    },
    kpiTimeToFirstReview: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.kpiTimeToFirstReview", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
      return getKpiTimeToFirstReview(filters);
    },
    kpiTimeToApproval: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.kpiTimeToApproval", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
      return getKpiTimeToApproval(filters);
    },
    kpiAvgCommentsPerPr: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.kpiAvgCommentsPerPr", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
      return getKpiAvgCommentsPerPr(filters);
    },
    kpiPrsWithoutApproval: async (_, { input }, context) => {
      logger.info("query.metrics.codeReviewEfficiency.kpiPrsWithoutApproval", {
        workspaceId: context.workspaceId,
        input,
      });

      if (!context.workspaceId) {
        throw new ResourceNotFoundException("Workspace not found");
      }

      const filters = buildPullRequestFlowChartFilters(
        input,
        context.workspaceId
      );
      return getKpiPrsWithoutApproval(filters);
    },
  }
);
