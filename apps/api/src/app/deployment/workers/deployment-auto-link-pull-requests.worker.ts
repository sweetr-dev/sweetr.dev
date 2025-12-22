import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { handleDeploymentPullRequestAutoLinking } from "../services/deployment-pr-linking.service";

interface DeploymentAutoLinkPullRequestsJobData {
  deploymentId: number;
  workspaceId: number;
}

export const deploymentAutoLinkPullRequestsWorker = createWorker(
  SweetQueue.DEPLOYMENT_AUTO_LINK_PULL_REQUESTS,
  async (job: Job<DeploymentAutoLinkPullRequestsJobData>) => {
    logger.info("[DEPLOYMENT_AUTO_LINK_PULL_REQUESTS]", { data: job.data });

    await handleDeploymentPullRequestAutoLinking({
      workspaceId: job.data.workspaceId,
      deploymentId: job.data.deploymentId,
    });
  }
);
