import { GithubAppAuthorizationRevokedEvent } from "@octokit/webhooks-types";
import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { deleteUserByGitUserId } from "../../auth/services/auth.service";

export const githubOAuthRevokedWorker = createWorker(
  SweetQueue.GITHUB_OAUTH_REVOKED,
  async (job: Job<GithubAppAuthorizationRevokedEvent>) => {
    await deleteUserByGitUserId(job.data.sender.node_id);
  }
);
