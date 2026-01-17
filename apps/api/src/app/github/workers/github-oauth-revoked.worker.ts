import { Job } from "bullmq";
import { QueuePayload, SweetQueues } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { deleteUserByGitUserId } from "../../auth/services/auth.service";

export const githubOAuthRevokedWorker = createWorker(
  SweetQueues.GITHUB_OAUTH_REVOKED.name,
  async (job: Job<QueuePayload<"GITHUB_OAUTH_REVOKED">>) => {
    await deleteUserByGitUserId(job.data.sender.node_id);
  }
);
