import { getPrisma, take } from "../../../prisma";
import { Prisma } from "@prisma/client";
import { PaginateDeploymentsArgs } from "./deployment.types";

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
