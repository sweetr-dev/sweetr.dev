import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  findTeamPullRequestsInProgress,
  groupPullRequestByState,
} from "../../services/pull-request.service";
import { transformPullRequest } from "../transformers/pull-request.transformer";
import { protectWithPaywall } from "../../../billing/services/billing.service";

export const pullRequestsInProgressQuery = createFieldResolver("Team", {
  pullRequestsInProgress: async (team, _, { workspaceId }) => {
    logger.info("query.pullRequestsInProgress", { team });

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspaceId);

    const pullRequests = await findTeamPullRequestsInProgress(
      workspaceId,
      team.id
    );

    const groupedPrs = groupPullRequestByState(pullRequests);

    return {
      drafted: groupedPrs.drafted.map(transformPullRequest),
      pendingReview: groupedPrs.pendingReview.map(transformPullRequest),
      changesRequested: groupedPrs.changesRequested.map(transformPullRequest),
      pendingMerge: groupedPrs.pendingMerge.map(transformPullRequest),
    };
  },
});
