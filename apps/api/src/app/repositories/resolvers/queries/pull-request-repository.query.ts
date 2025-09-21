import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findRepositoryById } from "../../services/repository.service";
import { transformRepository } from "../transformers/repository.transformer";

export const pullRequestRepositoryQuery = createFieldResolver("PullRequest", {
  repository: async (pullRequest, _, context) => {
    logger.info("query.pullRequest.repository", { pullRequest });

    if (
      !pullRequest.id ||
      !context.workspaceId ||
      !pullRequest["repositoryId"]
    ) {
      throw new ResourceNotFoundException("Pull Request not found");
    }

    const repository = await findRepositoryById({
      workspaceId: context.workspaceId,
      repositoryId: pullRequest["repositoryId"] as number,
    });

    if (!repository) {
      throw new ResourceNotFoundException("Repository not found");
    }

    return transformRepository(repository);
  },
});
