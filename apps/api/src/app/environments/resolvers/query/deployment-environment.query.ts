import { Deployment } from "@sweetr/graphql-types/api";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findEnvironmentById } from "../../services/environment.service";
import { transformEnvironment } from "../transformers/environment.transformer";

export const deploymentEnvironmentQuery = createFieldResolver("Deployment", {
  environment: async (deployment: Deployment) => {
    logger.info("query.deployment.environment", { deployment });

    if (!deployment["environmentId"]) {
      throw new ResourceNotFoundException("Deployment environment not found");
    }

    if (!deployment.id) {
      throw new ResourceNotFoundException("Environment not found");
    }

    if (!deployment["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const environment = await findEnvironmentById({
      workspaceId: deployment["workspaceId"] as number,
      environmentId: deployment["environmentId"] as number,
    });

    if (!environment) {
      throw new ResourceNotFoundException("Environment not found");
    }

    return transformEnvironment(environment);
  },
});
