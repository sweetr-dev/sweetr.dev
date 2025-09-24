import { getPrisma, take } from "../../../prisma";
import { Prisma } from "@prisma/client";
import { PaginateIncidentsArgs } from "./incident.types";

export const paginateIncidents = async (
  workspaceId: number,
  args: PaginateIncidentsArgs
) => {
  const query: Prisma.IncidentFindManyArgs = {
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

  if (args.applicationIds?.length) {
    query.where = {
      ...query.where,
      causeDeployment: { applicationId: { in: args.applicationIds } },
    };
  }

  if (args.detectedAt?.from || args.detectedAt?.to) {
    query.where = {
      ...query.where,
      detectedAt: { gte: args.detectedAt.from, lte: args.detectedAt.to },
    };
  }

  if (args.environmentIds?.length) {
    query.where = {
      ...query.where,
      causeDeployment: { environmentId: { in: args.environmentIds } },
    };
  }

  return getPrisma(workspaceId).incident.findMany(query);
};
