import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findPullRequestByCodeReviewId } from "../../services/pull-request.service";
import { transformPullRequest } from "../transformers/pull-request.transformer";

export const teamPullRequestsQuery = createFieldResolver("CodeReview", {
  pullRequest: async (codeReview) => {
    logger.info("query.pullRequests", { codeReview });

    if (!codeReview.id || !codeReview["workspaceId"]) {
      throw new ResourceNotFoundException("Code Review not found");
    }

    const pullRequest = await findPullRequestByCodeReviewId(
      codeReview["workspaceId"],
      codeReview.id
    );

    return transformPullRequest(pullRequest);
  },
});
