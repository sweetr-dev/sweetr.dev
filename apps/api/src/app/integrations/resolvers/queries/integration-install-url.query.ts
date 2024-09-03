import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getIntegrationInstallUrl } from "../../services/integrations.service";

export const integrationInstallUrlQuery = createFieldResolver("Integration", {
  installUrl: async ({ app }) => {
    logger.info("query.workspace.integrations.installUrl", { app });

    if (!app) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return getIntegrationInstallUrl(app);
  },
});
