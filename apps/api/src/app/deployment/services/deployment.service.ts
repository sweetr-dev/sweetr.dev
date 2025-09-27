import { getPrisma, take } from "../../../prisma";
import { Prisma } from "@prisma/client";
import {
  FindDeploymentByIdInput,
  FindLastProductionDeploymentByApplicationIdInput,
  PaginateDeploymentsInput,
} from "./deployment.types";

export const paginateDeployments = async (
  workspaceId: number,
  args: PaginateDeploymentsInput
) => {
  const query: Prisma.DeploymentFindManyArgs = {
    take: take(args.limit),
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    where: {
      workspaceId,
      environment: {
        archivedAt: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  if (args.deployedAt?.from || args.deployedAt?.to) {
    query.where = {
      ...query.where,
      deployedAt: {
        gte: args.deployedAt.from,
        lte: args.deployedAt.to,
      },
    };
  }

  if (args.applicationIds?.length) {
    query.where = {
      ...query.where,
      applicationId: { in: args.applicationIds },
    };
  }

  if (args.environmentIds?.length) {
    query.where = {
      ...query.where,
      environmentId: { in: args.environmentIds },
    };
  }

  return getPrisma(workspaceId).deployment.findMany(query);
};

export const findDeploymentById = async ({
  workspaceId,
  deploymentId,
}: FindDeploymentByIdInput) => {
  return getPrisma(workspaceId).deployment.findUnique({
    where: {
      id: deploymentId,
    },
  });
};

export const findLastProductionDeploymentByApplicationId = async ({
  workspaceId,
  applicationId,
}: FindLastProductionDeploymentByApplicationIdInput) => {
  return getPrisma(workspaceId).deployment.findFirst({
    where: {
      applicationId,
      archivedAt: null,
      environment: { isProduction: true, archivedAt: null },
    },
    orderBy: {
      deployedAt: "desc",
    },
  });
};
