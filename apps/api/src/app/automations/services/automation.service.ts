import { getPrisma } from "../../../prisma";
import { FindAutomationBySlug } from "./automation.types";

export const findAutomationBySlug = async ({
  workspaceId,
  slug,
}: FindAutomationBySlug) => {
  return getPrisma(workspaceId).automation.findFirst({
    where: {
      available: true,
      slug,
    },
    include: {
      settings: {
        where: {
          workspaceId,
        },
      },
    },
  });
};

export const findAutomationsByWorkspace = async (workspaceId: number) => {
  return getPrisma(workspaceId).automation.findMany({
    where: {
      available: true,
    },
    include: {
      settings: {
        where: {
          workspaceId,
        },
      },
    },
  });
};

export const upsertAutomationSettings = async ({
  workspaceId,
  slug,
  enabled,
}) => {
  const automation = await getPrisma(workspaceId).automation.findFirstOrThrow({
    where: { slug },
  });

  return getPrisma(workspaceId).automationSetting.upsert({
    where: {
      automationId_workspaceId: {
        automationId: automation.id,
        workspaceId,
      },
      automation: {
        slug,
      },
    },
    create: {
      automationId: automation.id,
      workspaceId,
      enabled,
      settings: {},
    },
    update: {
      enabled,
    },
    include: {
      automation: true,
    },
  });
};
