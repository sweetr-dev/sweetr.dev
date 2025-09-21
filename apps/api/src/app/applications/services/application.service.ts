import { assign } from "radash";
import { getPrisma, take } from "../../../prisma";
import {
  FindApplicationByIdInput,
  PaginateApplicationsArgs,
  UpsertApplicationInput,
} from "./application.types";
import { Application, Prisma } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";

export const findApplicationById = async ({
  applicationId,
  workspaceId,
}: FindApplicationByIdInput): Promise<Application | null> => {
  return getPrisma(workspaceId).application.findUnique({
    where: {
      id: applicationId,
      workspaceId,
    },
  });
};

export const paginateApplications = async (
  workspaceId: number,
  args: PaginateApplicationsArgs
) => {
  const query: Prisma.ApplicationFindManyArgs = {
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
      id: { in: args.applicationIds },
    };
  }

  if (args.teamIds?.length) {
    query.where = {
      ...query.where,
      teamId: { in: args.teamIds },
    };
  }

  if (args.query) {
    query.where = {
      ...query.where,
      name: {
        contains: args.query,
        mode: "insensitive",
      },
    };
  }

  return getPrisma(workspaceId).application.findMany(query);
};

export const upsertApplication = async (input: UpsertApplicationInput) => {
  const { workspaceId, deploymentSettings, applicationId, ...data } = input;

  const application = await getPrisma(workspaceId).application.findUnique({
    where: {
      id: applicationId || 0,
    },
  });

  if (!application) {
    const newApplication = await getPrisma(workspaceId).application.create({
      data: {
        ...data,
        workspaceId,
        deploymentSettings: deploymentSettings,
      },
    });

    return newApplication;
  }

  const updatedSettings = deploymentSettings
    ? assign(application.deploymentSettings as object, deploymentSettings)
    : application.deploymentSettings;

  return getPrisma(workspaceId).application.update({
    where: {
      id: application.id,
    },
    data: {
      ...data,
      workspaceId,
      deploymentSettings: updatedSettings as JsonObject,
    },
  });
};
