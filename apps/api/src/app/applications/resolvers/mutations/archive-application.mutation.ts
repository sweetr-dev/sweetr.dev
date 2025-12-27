import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import {
  archiveApplication,
  unarchiveApplication,
} from "../../services/application.service";
import { transformApplication } from "../transformers/application.transformer";

export const archiveApplicationMutation = createMutationResolver({
  archiveApplication: async (_, { input }, context) => {
    logger.info("mutation.archiveApplication", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const application = await archiveApplication({
      workspaceId: input.workspaceId,
      applicationId: input.applicationId,
    });

    return transformApplication(application);
  },
  unarchiveApplication: async (_, { input }, context) => {
    logger.info("mutation.unarchiveApplication", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const application = await unarchiveApplication({
      workspaceId: input.workspaceId,
      applicationId: input.applicationId,
    });

    return transformApplication(application);
  },
});

