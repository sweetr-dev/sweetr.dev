import { thirtyDaysAgo } from "../../../../lib/date";
import { createFieldResolver } from "../../../../lib/graphql";
import { WorkspaceMetricInput } from "../../../../graphql-types";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  getChangeFailureRateMetric,
  getDeploymentFrequencyMetric,
  getDoraTeamOverview,
  getLeadTimeMetric,
  getMeanTimeToRecoverMetric,
} from "../../services/dora-metrics.service";
import { DoraMetricsFilters } from "../../services/dora-metrics.types";
import {
  transformChangeFailureRateMetric,
  transformDeploymentFrequencyMetric,
  transformLeadTimeMetric,
  transformMeanTimeToRecoverMetric,
} from "../transformers/dora-metrics.transformer";

const buildDoraWorkspaceMetricFilters = (
  workspaceId: number,
  input: WorkspaceMetricInput
): DoraMetricsFilters => ({
  workspaceId,
  dateRange: {
    from: input.dateRange.from ?? thirtyDaysAgo().toISOString(),
    to: input.dateRange.to ?? new Date().toISOString(),
  },
  period: input.period,
  teamIds: input.teamIds ?? undefined,
  applicationIds: input.applicationIds ?? undefined,
  environmentIds: input.environmentIds ?? undefined,
  repositoryIds: input.repositoryIds ?? undefined,
});

export const doraMetricsQuery = createFieldResolver("DoraMetrics", {
  leadTime: async (_, { input }, context) => {
    logger.info("query.metrics.dora.leadTime", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const filters = buildDoraWorkspaceMetricFilters(context.workspaceId, input);

    const result = await getLeadTimeMetric(filters);

    return {
      ...transformLeadTimeMetric(result),
      doraFilters: filters,
    };
  },
  changeFailureRate: async (_, { input }, context) => {
    logger.info("query.metrics.dora.changeFailureRate", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getChangeFailureRateMetric(
      buildDoraWorkspaceMetricFilters(context.workspaceId, input)
    );

    return transformChangeFailureRateMetric(result);
  },
  deploymentFrequency: async (_, { input }, context) => {
    logger.info("query.metrics.dora.deploymentFrequency", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getDeploymentFrequencyMetric(
      buildDoraWorkspaceMetricFilters(context.workspaceId, input)
    );

    return transformDeploymentFrequencyMetric(result);
  },
  meanTimeToRecover: async (_, { input }, context) => {
    logger.info("query.metrics.dora.meanTimeToRecover", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getMeanTimeToRecoverMetric(
      buildDoraWorkspaceMetricFilters(context.workspaceId, input)
    );

    return transformMeanTimeToRecoverMetric(result);
  },
  teamOverview: async (_, { input }, context) => {
    logger.info("query.metrics.dora.teamOverview", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return getDoraTeamOverview(
      buildDoraWorkspaceMetricFilters(context.workspaceId, input)
    );
  },
});
