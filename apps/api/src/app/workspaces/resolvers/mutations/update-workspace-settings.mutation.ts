import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceOrThrow } from "../../../workspace-authorization.service";
import { transformWorkspace } from "../transformers/workspace.transformer";
import { updateWorkspaceSettings } from "../../services/workspace-settings.service";

export const updateWorkspaceSettingsMutation = createMutationResolver({
  updateWorkspaceSettings: async (_, { input }, context) => {
    logger.info("mutation.updateWorkspaceSettings", { input });

    authorizeWorkspaceOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    const { workspaceId, settings } = input;

    await protectWithPaywall(input.workspaceId);

    const workspace = await updateWorkspaceSettings(workspaceId, settings);

    return transformWorkspace(workspace);
  },
});
