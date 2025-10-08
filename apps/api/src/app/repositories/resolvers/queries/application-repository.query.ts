import { Application } from "../../../../graphql-types";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findRepositoryById } from "../../services/repository.service";
import { transformRepository } from "../transformers/repository.transformer";

export const applicationRepositoryQuery = createFieldResolver("Application", {
  repository: async (application: Application, _, context) => {
    logger.info("query.application.repository", { application });

    if (!application.id || !application["repositoryId"]) {
      throw new ResourceNotFoundException("Application not found");
    }

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const repository = await findRepositoryById({
      workspaceId: context.workspaceId,
      repositoryId: application["repositoryId"] as number,
    });

    if (!repository) {
      throw new ResourceNotFoundException("Repository not found");
    }

    return transformRepository(repository);
  },
});
