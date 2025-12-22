import { Job } from "bullmq";
import { addJob, SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import type { PostDeploymentInput } from "../services/deployment.validation";
import { logger } from "../../../lib/logger";
import { handleDeploymentTriggeredByApi } from "../services/deployment-create-from-api.service";

type DeploymentCreateJobData = Omit<PostDeploymentInput, "deployedAt"> & {
  workspaceId: number;
  deployedAt: Date;
};

export const deploymentTriggeredByApiWorker = createWorker(
  SweetQueue.DEPLOYMENT_TRIGGERED_BY_API,
  async (job: Job<DeploymentCreateJobData>) => {
    logger.info("deploymentTriggeredByApiWorker", { data: job.data });

    const deployment = await handleDeploymentTriggeredByApi(job.data);

    logger.info("deploymentTriggeredByApiWorker: Deployment created", {
      deployment,
    });

    await addJob(SweetQueue.DEPLOYMENT_AUTO_LINK_PULL_REQUESTS, {
      deploymentId: deployment.id,
      workspaceId: job.data.workspaceId,
    });
  }
);
