import { Integration } from "@sweetr/graphql-types/dist/api";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getWorkspaceIntegrations } from "../../services/integrations.service";

export const workspaceIntegrationsQuery = createFieldResolver("Workspace", {
  integrations: async ({ id: workspaceId }) => {
    logger.info("query.workspace.integrations", { workspaceId });

    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const integrations = await getWorkspaceIntegrations(workspaceId);

    return integrations as Integration[];
  },
});
