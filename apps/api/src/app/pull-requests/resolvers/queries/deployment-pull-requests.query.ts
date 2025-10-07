import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  countPullRequestsByDeploymentId,
  findPullRequestsByDeploymentId,
} from "../../services/pull-request.service";
import { transformPullRequest } from "../transformers/pull-request.transformer";

export const deploymentPullRequestsQuery = createFieldResolver("Deployment", {
  pullRequests: async (deployment) => {
    logger.info("query.deployment.pullRequests", { deployment });

    if (!deployment["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const pullRequests = await findPullRequestsByDeploymentId({
      workspaceId: deployment["workspaceId"] as number,
      deploymentId: deployment.id as number,
    });

    return pullRequests.map(transformPullRequest);
  },
  pullRequestCount: async (deployment) => {
    if (!deployment["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return await countPullRequestsByDeploymentId({
      workspaceId: deployment["workspaceId"] as number,
      deploymentId: deployment.id as number,
    });
  },
});
