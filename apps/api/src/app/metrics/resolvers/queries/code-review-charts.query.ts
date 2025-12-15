import { thirtyDaysAgo } from "../../../../lib/date";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getCodeReviewDistributionChartData } from "../../services/chart-code-review.service";

export const codeReviewChartQuery = createFieldResolver("Metrics", {
  codeReviewDistribution: async (_, { input }, context) => {
    logger.info("query.metrics.codeReviewDistribution", {
      chartFilter: context.chartFilter,
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
});
