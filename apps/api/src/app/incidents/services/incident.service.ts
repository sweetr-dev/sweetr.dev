import { getPrisma, take } from "../../../prisma";
import { Prisma } from "@prisma/client";
import {
  FindIncidentByIdArgs,
  PaginateIncidentsArgs,
  UpsertIncidentInput,
} from "./incident.types";
import { getIncidentValidationSchema } from "./incident.validation";
import { validateInputOrThrow } from "../../validator.service";

export const findIncidentById = async ({
  workspaceId,
  incidentId,
}: FindIncidentByIdArgs) => {
  return getPrisma(workspaceId).incident.findUnique({
    where: { id: incidentId, workspaceId },
  });
};

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
      causeDeployment: {
        archivedAt: null,
        environment: {
          archivedAt: null,
        },
      },
    },
    orderBy: {
      detectedAt: "desc",
    },
  };

  if (args.applicationIds?.length) {
    query.where = {
      ...query.where,
      causeDeployment: {
        ...query.where?.causeDeployment,
        applicationId: { in: args.applicationIds },
      } as Prisma.DeploymentWhereInput,
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
      causeDeployment: {
        ...query.where?.causeDeployment,
        environmentId: { in: args.environmentIds },
      } as Prisma.DeploymentWhereInput,
    };
  }

  return getPrisma(workspaceId).incident.findMany(query);
};

export const upsertIncident = async (input: UpsertIncidentInput) => {
  const workspaceId = input.workspaceId;

  const { incidentId, ...data } = await validateInputOrThrow(
    getIncidentValidationSchema(workspaceId),
    input
  );

  return getPrisma(workspaceId).incident.upsert({
    where: {
      id: incidentId || 0,
    },
    create: data,
    update: data,
  });
};
