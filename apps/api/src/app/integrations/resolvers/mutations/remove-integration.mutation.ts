import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { authorizeWorkspaceOrThrow } from "../../../workspace-authorization.service";
import { findWorkspaceById } from "../../../workspaces/services/workspace.service";
import { removeIntegration } from "../../services/integrations.service";

export const removeIntegrationMUtation = createMutationResolver({
  removeIntegration: async (_, { input }, context) => {
    logger.info("mutation.removeIntegration", { input });

    authorizeWorkspaceOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken?.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const workspace = await findWorkspaceById(input.workspaceId);

    if (!workspace) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await removeIntegration({
      workspaceId: workspace.id,
      app: input.app,
    });

    return null;
  },
});
