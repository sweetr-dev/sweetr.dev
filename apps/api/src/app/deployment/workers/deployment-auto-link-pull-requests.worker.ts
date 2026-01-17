import { Job } from "bullmq";
import { QueuePayload, SweetQueues } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { handleDeploymentPullRequestAutoLinking } from "../services/deployment-pr-linking.service";

export const deploymentAutoLinkPullRequestsWorker = createWorker(
  SweetQueues.DEPLOYMENT_AUTO_LINK_PULL_REQUESTS.name,
  async (job: Job<QueuePayload<"DEPLOYMENT_AUTO_LINK_PULL_REQUESTS">>) => {
    logger.info("[DEPLOYMENT_AUTO_LINK_PULL_REQUESTS]", { data: job.data });

    await handleDeploymentPullRequestAutoLinking({
      workspaceId: job.data.workspaceId,
      deploymentId: job.data.deploymentId,
    });
  }
);
