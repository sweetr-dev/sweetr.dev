import { logger } from "../../../../lib/logger";
import { createFieldResolver } from "../../../../lib/graphql";
import { findApiKeyByWorkspaceId } from "../../services/api-keys.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { transformApiKey } from "../transformers/api-key.transformer";

export const apiKeyQuery = createFieldResolver("Workspace", {
  apiKey: async (workspace) => {
    logger.info("query.workspace.apiKey");

    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const apiKey = await findApiKeyByWorkspaceId(workspace.id);

    if (!apiKey) {
      return null;
    }

    return transformApiKey(apiKey);
  },
});
