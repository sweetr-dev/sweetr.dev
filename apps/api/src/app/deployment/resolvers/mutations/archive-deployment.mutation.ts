import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import {
  archiveDeployment,
  unarchiveDeployment,
} from "../../services/deployment.service";
import { transformDeployment } from "../transformers/deployment.transformer";

export const archiveDeploymentMutation = createMutationResolver({
  archiveDeployment: async (_, { input }, context) => {
    logger.info("mutation.archiveDeployment", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const deployment = await archiveDeployment({
      workspaceId: input.workspaceId,
      deploymentId: input.deploymentId,
    });

    return transformDeployment(deployment);
  },
  unarchiveDeployment: async (_, { input }, context) => {
    logger.info("mutation.unarchiveDeployment", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const deployment = await unarchiveDeployment({
      workspaceId: input.workspaceId,
      deploymentId: input.deploymentId,
    });

    return transformDeployment(deployment);
  },
});
