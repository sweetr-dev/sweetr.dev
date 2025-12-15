import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";

const mockData = {
  columns: [
    "2025-07-01T00:00:00Z",
    "2025-07-08T00:00:00Z",
    "2025-07-15T00:00:00Z",
    "2025-07-22T00:00:00Z",
    "2025-07-29T00:00:00Z",
    "2025-08-05T00:00:00Z",
    "2025-08-12T00:00:00Z",
    "2025-08-19T00:00:00Z",
    "2025-08-26T00:00:00Z",
    "2025-09-02T00:00:00Z",
    "2025-09-09T00:00:00Z",
    "2025-09-16T00:00:00Z",
    "2025-09-23T00:00:00Z",
    "2025-09-30T00:00:00Z",
  ],
  data: [15, 12, 18, 1, 13, 9, 8, 11, 1, 12, 9, 1, 11, 9],
};

export const doraMetricsQuery = createFieldResolver("DoraMetrics", {
  leadTime: async (_, { input }, context) => {
    logger.info("query.metrics.dora.leadTime", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return {
      columns: mockData.columns,
      data: mockData.data.map((value) => BigInt(value)),
      amount: 0,
      before: 0,
      change: 0,
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

    return {
      columns: mockData.columns,
      data: mockData.data.map((value) => BigInt(value)),
      amount: 0,
      before: 0,
      change: 0,
    };
  },
  deploymentFrequency: async (_, { input }, context) => {
    logger.info("query.metrics.dora.deploymentFrequency", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return {
      columns: mockData.columns,
      data: mockData.data.map((value) => BigInt(value)),
      amount: 0,
      avg: 0,
      before: 0,
      change: 0,
    };
  },
  meanTimeToRecover: async (_, { input }, context) => {
    logger.info("query.metrics.dora.meanTimeToRecover", {
      workspaceId: context.workspaceId,
      input,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return {
      columns: mockData.columns,
      data: mockData.data.map((value) => BigInt(value)),
      amount: 0,
      before: 0,
      change: 0,
    };
  },
});
