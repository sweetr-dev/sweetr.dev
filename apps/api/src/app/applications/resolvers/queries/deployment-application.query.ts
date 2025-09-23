import { Deployment } from "../../../../graphql-types";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findApplicationById } from "../../services/application.service";
import { transformApplication } from "../transformers/application.transformer";

export const deploymentApplicationQuery = createFieldResolver("Deployment", {
  application: async (deployment: Deployment) => {
    logger.info("query.deployment.application", { deployment });

    if (!deployment["applicationId"]) {
      throw new ResourceNotFoundException("Deployment application not found");
    }

    if (!deployment.id) {
      throw new ResourceNotFoundException("Deployment not found");
    }

    if (!deployment["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const application = await findApplicationById({
      workspaceId: deployment["workspaceId"] as number,
      applicationId: deployment["applicationId"] as number,
    });

    if (!application) {
      throw new ResourceNotFoundException("Application not found");
    }

    return transformApplication(application);
  },
});
