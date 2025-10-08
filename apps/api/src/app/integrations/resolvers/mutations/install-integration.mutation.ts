import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  authorizeWorkspaceMemberOrThrow,
  preventCSRFAttack,
} from "../../../authorization.service";
import { findWorkspaceById } from "../../../workspaces/services/workspace.service";
import { installIntegration } from "../../services/integrations.service";

export const installIntegrationMutation = createMutationResolver({
  installIntegration: async (_, { input }, context) => {
    logger.info("mutation.installIntegration", { input });

    await preventCSRFAttack(input.state);

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken?.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const workspace = await findWorkspaceById(input.workspaceId);

    if (!workspace) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await installIntegration({
      workspaceId: workspace.id,
      app: input.app,
      code: input.code,
    });

    return null;
  },
});
