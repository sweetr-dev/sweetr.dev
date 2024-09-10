import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  findAutomationByType,
  findAutomationsByWorkspace,
} from "../../services/automation.service";
import { transformAutomation } from "../transformers/automation.transformer";

export const workspaceAutomationsQuery = createFieldResolver("Workspace", {
  automation: async (workspace, { input }) => {
    logger.info("query.workspace.automation", { workspace });

    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const automation = await findAutomationByType({
      workspaceId: workspace.id,
      type: input.type,
    });

    if (!automation) return null;

    return transformAutomation(automation);
  },
  automations: async (workspace) => {
    logger.info("query.workspace.automations", { workspace });

    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const automations = await findAutomationsByWorkspace(workspace.id);

    return automations.map(transformAutomation);
  },
});
