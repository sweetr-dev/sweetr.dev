import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";
import { getCodeReviewDistributionChartData } from "../../services/chart-code-review.service";

export const chartsQuery = createFieldResolver("Charts", {
  codeReviewDistribution: async (_, __, context) => {
    logger.info("query.charts.codeReviewDistribution", {
      chartFilter: context.chartFilter,
      workspaceId: context.workspaceId,
    });

    if (!context.chartFilter || !context.workspaceId) {
      throw new InputValidationException("Missing chart filters");
    }

    const result = await getCodeReviewDistributionChartData({
      workspaceId: context.workspaceId,
      startDate: context.chartFilter.dateTimeRange.from,
      endDate: context.chartFilter.dateTimeRange.to,
      teamId: context.chartFilter.teamId,
      period: context.chartFilter.period,
    });

    return result;
  },
});
