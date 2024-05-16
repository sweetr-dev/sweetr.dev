import { parseISO } from "date-fns";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findPullRequestTracking } from "../../services/pull-request.service";
import { transformPullRequestTracking } from "../transformers/pull-request-tracking.transformer";

export const teamPullRequestsQuery = createFieldResolver("PullRequest", {
  tracking: async (pullRequest) => {
    logger.info("query.pullRequest.tracking", { pullRequest });

    if (
      !pullRequest.id ||
      !pullRequest.createdAt ||
      !pullRequest["workspaceId"]
    ) {
      throw new ResourceNotFoundException("Pull Request not found");
    }

    const tracking = await findPullRequestTracking(
      pullRequest["workspaceId"],
      pullRequest.id
    );

    return transformPullRequestTracking(
      tracking,
      parseISO(pullRequest.createdAt),
      pullRequest.state
    );
  },
});
