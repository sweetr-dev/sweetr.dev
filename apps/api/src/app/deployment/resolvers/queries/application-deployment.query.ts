import { Application } from "@sweetr/graphql-types/api";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findLastProductionDeploymentByApplicationId } from "../../services/deployment.service";
import { transformDeployment } from "../transformers/deployment.transformer";

export const applicationDeploymentQuery = createFieldResolver("Application", {
  lastProductionDeployment: async (application: Application) => {
    logger.info("query.application.lastDeployment", { application });

    if (!application.id) {
      throw new ResourceNotFoundException("Application not found");
    }

    if (!application["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const deployment = await findLastProductionDeploymentByApplicationId({
      workspaceId: application["workspaceId"] as number,
      applicationId: application.id as number,
    });

    if (!deployment) return null;

    return transformDeployment(deployment);
  },
});
