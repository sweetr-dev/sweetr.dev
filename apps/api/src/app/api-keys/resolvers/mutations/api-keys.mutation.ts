import { logger } from "../../../../lib/logger";
import { createMutationResolver } from "../../../../lib/graphql";
import { regenerateApiKey } from "../../services/api-keys.service";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";

export const regenerateApiKeyMutation = createMutationResolver({
  regenerateApiKey: async (_, { input }, context) => {
    logger.info("mutation.regenerateApiKey", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    return regenerateApiKey(
      input.workspaceId,
      context.currentToken.gitProfileId
    );
  },
});
