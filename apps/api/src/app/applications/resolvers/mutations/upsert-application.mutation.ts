import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceOrThrow } from "../../../workspace-authorization.service";
import { upsertApplication } from "../../services/application.service";
import { transformApplication } from "../transformers/application.transformer";

export const upsertApplicationMutation = createMutationResolver({
  upsertApplication: async (_, { input }, context) => {
    logger.info("mutation.upsertApplication", { input });

    authorizeWorkspaceOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const application = await upsertApplication(input);

    return transformApplication(application);
  },
});
