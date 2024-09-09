import { JsonObject } from "@prisma/client/runtime/library";
import { getPrisma } from "../../../prisma";
import {
  FindAutomationBySlugArgs,
  UpsertAutomationArgs,
} from "./automation.types";
import { isObject } from "radash";
import { AutomationType, Workspace } from "@prisma/client";

export const findAutomationByType = async ({
  workspaceId,
  type,
}: FindAutomationBySlugArgs) => {
  return getPrisma(workspaceId).automation.findFirst({
    where: {
      workspaceId,
      type,
    },
  });
};

export const findAutomationsByWorkspace = async (workspaceId: number) => {
  return getPrisma(workspaceId).automation.findMany({
    where: {
      workspaceId,
    },
  });
};

export const isAutomationActive = async (
  workspaceId: number,
  type: AutomationType
): Promise<boolean> => {
  const automation = await findAutomationByType({
    workspaceId,
    type,
  });

  return automation?.enabled || false;
};

export const upsertAutomationSettings = async ({
  workspaceId,
  type,
  enabled,
  settings,
}: UpsertAutomationArgs) => {
  return getPrisma(workspaceId).automation.upsert({
    where: {
      workspaceId_type: {
        workspaceId,
        type,
      },
    },
    create: {
      workspaceId,
      type,
      enabled,
      settings: isObject(settings) ? (settings as JsonObject) : {},
    },
    update: {
      enabled,
      settings: isObject(settings) ? (settings as JsonObject) : undefined,
    },
  });
};
