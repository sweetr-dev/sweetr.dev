import { JsonObject } from "@prisma/client/runtime/library";
import { getPrisma } from "../../../prisma";
import {
  FindAutomationByTypeArgs,
  UpsertAutomationArgs,
} from "./automation.types";
import { isObject } from "radash";

export const findAutomationByType = async ({
  workspaceId,
  type,
}: FindAutomationByTypeArgs) => {
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
      enabled: enabled || false,
      settings: isObject(settings) ? (settings as JsonObject) : {},
    },
    update: {
      enabled,
      settings: isObject(settings) ? (settings as JsonObject) : undefined,
    },
  });
};
