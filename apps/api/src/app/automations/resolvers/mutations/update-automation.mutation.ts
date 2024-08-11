import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceOrThrow } from "../../../workspace-authorization.service";
import { upsertAutomationSettings } from "../../services/automation.service";
import { transformAutomation } from "../transformers/automation.transformer";

export const updateAutomationMutation = createMutationResolver({
  updateAutomation: async (_, { input }, context) => {
    logger.info("mutation.updateAutomation", { input });

    await authorizeWorkspaceOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const automationSetting = await upsertAutomationSettings({
      ...input,
    });

    return transformAutomation({
      ...automationSetting.automation,
      settings: [automationSetting],
    });
  },
});
