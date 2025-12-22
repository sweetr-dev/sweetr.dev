import { Application, Environment, PullRequest } from "@prisma/client";

export interface CreateDeploymentFromPullRequestMergeArgs {
  application: Application;
  environment: Environment;
  pullRequest: PullRequest;
  workspaceId: number;
}
