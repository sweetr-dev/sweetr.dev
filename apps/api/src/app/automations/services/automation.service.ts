import { JsonObject } from "@prisma/client/runtime/library";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import {
  Automation,
  AutomationTypeMap,
  CanRunAutomationArgs,
  FindAutomationByTypeArgs,
  UpsertAutomationArgs,
} from "./automation.types";
import { assign, isObject } from "radash";
import { AutomationType, GitProvider } from "@prisma/client";
import { isActiveCustomer } from "../../workspace-authorization.service";

export const findAutomationByType = async <T extends AutomationType>({
  workspaceId,
  type,
}: FindAutomationByTypeArgs<T>): Promise<AutomationTypeMap[T] | null> => {
  const automation = await getPrisma(workspaceId).automation.findFirst({
    where: {
      workspaceId,
      type,
    },
  });

  if (!automation) return null;

  // JSON types in Prisma is bad
  return automation as unknown as AutomationTypeMap[T];
};

export const findAutomationsByWorkspace = async (workspaceId: number) => {
  const automations = await getPrisma(workspaceId).automation.findMany({
    where: {
      workspaceId,
    },
  });

  // JSON types in Prisma is bad
  return automations as unknown as Automation[];
};

export const upsertAutomationSettings = async ({
  workspaceId,
  type,
  enabled,
  settings,
}: UpsertAutomationArgs) => {
  const automation = await getPrisma(workspaceId).automation.findUnique({
    where: {
      workspaceId_type: {
        workspaceId,
        type,
      },
    },
  });

  if (!automation) {
    const newAutomation = await getPrisma(workspaceId).automation.create({
      data: {
        workspaceId,
        type,
        enabled: enabled ?? false,
        settings: isObject(settings) ? (settings as JsonObject) : {},
      },
    });

    return newAutomation as unknown as Automation;
  }

  const updatedSettings = settings
    ? assign(automation.settings as object, settings)
    : automation.settings;

  const updatedAutomation = await getPrisma(workspaceId).automation.update({
    where: {
      id: automation.id,
    },
    data: {
      enabled,
      settings: updatedSettings as JsonObject,
    },
  });

  return updatedAutomation as unknown as Automation;
};

export const canRunAutomation = async ({
  automation,
  workspace,
  requiredScopes,
}: CanRunAutomationArgs): Promise<boolean> => {
  if (!automation?.enabled) return false;
  if (!isActiveCustomer(workspace)) return false;
  if (!workspace.installation) return false;

  const hasRequiredScopes = requiredScopes.every((scope) => {
    const [permission, access] = Object.entries(scope)[0];

    return workspace.installation?.permissions?.[permission] === access;
  });

  if (!hasRequiredScopes) return false;

  return true;
};

export const findWorkspaceByInstallationId = async (
  gitInstallationId: number
) => {
  const workspace = await getBypassRlsPrisma().workspace.findFirst({
    where: {
      installation: {
        gitInstallationId: gitInstallationId.toString(),
        gitProvider: GitProvider.GITHUB,
      },
    },
    include: {
      organization: true,
      gitProfile: true,
      subscription: true,
      installation: true,
    },
  });

  if (!workspace) return null;

  if (!workspace.gitProfile && !workspace.organization) return null;

  return workspace;
};
