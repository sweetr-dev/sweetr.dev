import { thirtyDaysAgo } from "../../../../lib/date";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  getLeadTimeMetric,
  getChangeFailureRateMetric,
  getDeploymentFrequencyMetric,
  getMeanTimeToRecoverMetric,
} from "../../services/dora-metrics.service";
import {
  transformLeadTimeMetric,
  transformChangeFailureRateMetric,
  transformDeploymentFrequencyMetric,
  transformMeanTimeToRecoverMetric,
} from "../transformers/dora-metrics.transformer";

export const doraMetricsQuery = createFieldResolver("DoraMetrics", {
  leadTime: async (_, { input }, context) => {
    logger.info("query.metrics.dora.leadTime", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getLeadTimeMetric({
      workspaceId: context.workspaceId,
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

    return transformLeadTimeMetric(result);
  },
  changeFailureRate: async (_, { input }, context) => {
    logger.info("query.metrics.dora.changeFailureRate", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const result = await getChangeFailureRateMetric({
      workspaceId: context.workspaceId,
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

    const result = await getDeploymentFrequencyMetric({
      workspaceId: context.workspaceId,
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

    const result = await getMeanTimeToRecoverMetric({
      workspaceId: context.workspaceId,
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

    return transformMeanTimeToRecoverMetric(result);
  },
});
