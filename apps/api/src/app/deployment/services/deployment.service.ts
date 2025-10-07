import { getPrisma, take } from "../../../prisma";
import { Prisma } from "@prisma/client";
import {
  FindDeploymentByIdArgs,
  FindLastProductionDeploymentByApplicationIdArgs,
  PaginateDeploymentsArgs,
} from "./deployment.types";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";

export const findDeploymentById = async ({
  workspaceId,
  deploymentId,
}: FindDeploymentByIdArgs) => {
  return getPrisma(workspaceId).deployment.findUnique({
    where: {
      id: deploymentId,
    },
  });
};

export const findDeploymentByIdOrThrow = async ({
  workspaceId,
  deploymentId,
}: FindDeploymentByIdArgs) => {
  const deployment = await findDeploymentById({ workspaceId, deploymentId });

  if (!deployment) {
    throw new ResourceNotFoundException("Deployment not found");
  }

  return deployment;
};

export const paginateDeployments = async (
  workspaceId: number,
  args: PaginateDeploymentsArgs
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

  if (args.deploymentIds?.length) {
    query.where = {
      ...query.where,
      id: { in: args.deploymentIds },
    };
  }

  if (args.query) {
    query.where = {
      ...query.where,
      OR: [
        { version: { contains: args.query, mode: "insensitive" } },
        { description: { contains: args.query, mode: "insensitive" } },
      ],
    };
  }

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

export const findLastProductionDeploymentByApplicationId = async ({
  workspaceId,
  applicationId,
}: FindLastProductionDeploymentByApplicationIdArgs) => {
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
