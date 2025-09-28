import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";
import { upsertAutomationSettings } from "../../services/automation.service";
import { transformAutomation } from "../transformers/automation.transformer";

export const updateAutomationMutation = createMutationResolver({
  updateAutomation: async (_, { input }, context) => {
    logger.info("mutation.updateAutomation", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const automation = await upsertAutomationSettings({
      workspaceId: input.workspaceId,
      type: input.type,
      enabled: input.enabled ?? undefined,
      settings: input.settings ?? undefined,
    });

    return transformAutomation(automation);
  },
});
