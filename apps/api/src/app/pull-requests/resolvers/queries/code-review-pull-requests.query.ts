import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findPullRequestById } from "../../services/pull-request.service";
import { transformPullRequest } from "../transformers/pull-request.transformer";

export const codeReviewPullRequestsQuery = createFieldResolver("CodeReview", {
  pullRequest: async (codeReview) => {
    logger.info("query.pullRequests", { codeReview });

    if (!codeReview["pullRequestId"] || !codeReview["workspaceId"]) {
      throw new ResourceNotFoundException("Code Review Pull Request not found");
    }

    const pullRequest = await findPullRequestById(
      codeReview["workspaceId"],
      codeReview["pullRequestId"]
    );

    if (!pullRequest) {
      throw new ResourceNotFoundException("Pull Request not found");
    }

    return transformPullRequest(pullRequest);
  },
});
