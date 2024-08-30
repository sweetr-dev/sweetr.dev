import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { authorizeWorkspaceOrThrow } from "../../../workspace-authorization.service";
import { findWorkspaceById } from "../../../workspaces/services/workspace.service";

export const installIntegrationMUtation = createMutationResolver({
  installIntegration: async (_, { input }, context) => {
    logger.info("mutation.installIntegration", { input });

    authorizeWorkspaceOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken?.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const workspace = await findWorkspaceById(input.workspaceId);

    if (!workspace) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return null;
  },
});
