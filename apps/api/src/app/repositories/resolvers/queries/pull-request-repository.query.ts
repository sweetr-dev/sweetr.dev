import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findRepositoryById } from "../../services/repository.service";
import { transformRepository } from "../transformers/repository.transformer";

export const pullRequestRepositoryQuery = createFieldResolver("PullRequest", {
  repository: async (pullRequest) => {
    logger.info("query.pullRequest.repository", { pullRequest });

    if (
      !pullRequest.id ||
      !pullRequest["workspaceId"] ||
      !pullRequest["repositoryId"]
    ) {
      throw new ResourceNotFoundException("Pull Request not found");
    }

    const repository = await findRepositoryById({
      workspaceId: pullRequest["workspaceId"] as number,
      repositoryId: pullRequest["repositoryId"] as number,
    });

    if (!repository) {
      throw new ResourceNotFoundException("Repository not found");
    }

    return transformRepository(repository);
  },
});
