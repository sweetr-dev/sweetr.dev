import {
  Application,
  Environment,
  PullRequest,
  PullRequestTracking,
} from "@prisma/client";

export interface CreateDeploymentFromPullRequestMergeArgs {
  application: Application;
  environment: Environment;
  pullRequest: PullRequest & { tracking: PullRequestTracking | null };
  workspaceId: number;
}
