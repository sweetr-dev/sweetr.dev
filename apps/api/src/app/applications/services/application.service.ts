import { assign } from "radash";
import { getPrisma, take } from "../../../prisma";
import {
  FindApplicationByIdArgs,
  PaginateApplicationsArgs,
  UpsertApplicationInput,
} from "./application.types";
import { Application, Prisma } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { getApplicationValidationSchema } from "./application.validation";
import { validateInputOrThrow } from "../../validator.service";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";

export const findApplicationById = async ({
  applicationId,
  workspaceId,
}: FindApplicationByIdArgs): Promise<Application | null> => {
  return getPrisma(workspaceId).application.findUnique({
    where: {
      id: applicationId,
      workspaceId,
    },
  });
};

export const findApplicationByIdOrThrow = async ({
  workspaceId,
  applicationId,
}: FindApplicationByIdArgs) => {
  const application = await findApplicationById({ workspaceId, applicationId });

  if (!application) {
    throw new ResourceNotFoundException("Application not found");
  }

  return application;
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
  const workspaceId = input.workspaceId;

  const { applicationId, deploymentSettings, ...data } =
    await validateInputOrThrow(
      getApplicationValidationSchema(workspaceId),
      input
    );

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
