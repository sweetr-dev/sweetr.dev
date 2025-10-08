import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";
import { upsertApplication } from "../../services/application.service";
import { transformApplication } from "../transformers/application.transformer";

export const upsertApplicationMutation = createMutationResolver({
  upsertApplication: async (_, { input }, context) => {
    logger.info("mutation.upsertApplication", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const application = await upsertApplication({
      ...input,
      applicationId: input.applicationId ?? undefined,
      deploymentSettings: input.deploymentSettings ?? undefined,
    });

    return transformApplication(application);
  },
});
