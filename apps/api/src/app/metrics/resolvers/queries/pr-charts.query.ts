import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";
import {
  getCycleTimeChartData,
  getPullRequestSizeDistributionChartData,
  getTimeForApprovalChartData,
  getTimeForFirstReviewChartData,
  getTimeToMergeChartData,
} from "../../services/chart-pull-request.service";

export const chartsQuery = createFieldResolver("Charts", {
  timeToMerge: async (_, __, context) => {
    logger.info("query.charts.timeToMerge", {
      chartFilter: context.chartFilter,
      workspaceId: context.workspaceId,
    });

    if (!context.chartFilter || !context.workspaceId) {
      throw new InputValidationException("Missing chart filters");
    }

    const result = await getTimeToMergeChartData({
      workspaceId: context.workspaceId,
      startDate: context.chartFilter.dateTimeRange.from,
      endDate: context.chartFilter.dateTimeRange.to,
      teamId: context.chartFilter.teamId,
      period: context.chartFilter.period,
    });

    return {
      columns: result.map((chartData) => chartData.period),
      data: result.map((chartData) => chartData.value),
    };
  },
  timeForFirstReview: async (_, __, context) => {
    logger.info("query.charts.timeForFirstReview", {
      chartFilter: context.chartFilter,
      workspaceId: context.workspaceId,
    });

    if (!context.chartFilter || !context.workspaceId) {
      throw new InputValidationException("Missing chart filters");
    }

    const result = await getTimeForFirstReviewChartData({
      workspaceId: context.workspaceId,
      startDate: context.chartFilter.dateTimeRange.from,
      endDate: context.chartFilter.dateTimeRange.to,
      teamId: context.chartFilter.teamId,
      period: context.chartFilter.period,
    });

    return {
      columns: result.map((chartData) => chartData.period),
      data: result.map((chartData) => chartData.value),
    };
  },
  timeForApproval: async (_, __, context) => {
    logger.info("query.charts.timeForApproval", {
      chartFilter: context.chartFilter,
      workspaceId: context.workspaceId,
    });

    if (!context.chartFilter || !context.workspaceId) {
      throw new InputValidationException("Missing chart filters");
    }

    const result = await getTimeForApprovalChartData({
      workspaceId: context.workspaceId,
      startDate: context.chartFilter.dateTimeRange.from,
      endDate: context.chartFilter.dateTimeRange.to,
      teamId: context.chartFilter.teamId,
      period: context.chartFilter.period,
    });

    return {
      columns: result.map((chartData) => chartData.period),
      data: result.map((chartData) => chartData.value),
    };
  },
  cycleTime: async (_, __, context) => {
    logger.info("query.charts.cycleTime", {
      chartFilter: context.chartFilter,
      workspaceId: context.workspaceId,
    });

    if (!context.chartFilter || !context.workspaceId) {
      throw new InputValidationException("Missing chart filters");
    }

    const result = await getCycleTimeChartData({
      workspaceId: context.workspaceId,
      startDate: context.chartFilter.dateTimeRange.from,
      endDate: context.chartFilter.dateTimeRange.to,
      teamId: context.chartFilter.teamId,
      period: context.chartFilter.period,
    });

    return {
      columns: result.map((chartData) => chartData.period),
      data: result.map((chartData) => chartData.value),
    };
  },
  pullRequestSizeDistribution: async (_, __, context) => {
    logger.info("query.charts.pullRequestSizeDistribution", {
      chartFilter: context.chartFilter,
      workspaceId: context.workspaceId,
    });

    if (!context.chartFilter || !context.workspaceId) {
      throw new InputValidationException("Missing chart filters");
    }

    return getPullRequestSizeDistributionChartData({
      workspaceId: context.workspaceId,
      startDate: context.chartFilter.dateTimeRange.from,
      endDate: context.chartFilter.dateTimeRange.to,
      teamId: context.chartFilter.teamId,
      period: context.chartFilter.period,
    });
  },
});
