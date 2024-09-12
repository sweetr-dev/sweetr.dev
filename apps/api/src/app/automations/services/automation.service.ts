import { JsonObject } from "@prisma/client/runtime/library";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import {
  AutomationTypeMap,
  CanRunAutomationArgs,
  FindAutomationByTypeArgs,
  UpsertAutomationArgs,
} from "./automation.types";
import { isObject } from "radash";
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

  return automation as unknown as AutomationTypeMap[T];
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
