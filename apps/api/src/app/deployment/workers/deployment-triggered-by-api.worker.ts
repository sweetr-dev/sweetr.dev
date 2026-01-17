import { Job } from "bullmq";
import { addJob, SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { handleDeploymentTriggeredByApi } from "../services/deployment-create-from-api.service";

export const deploymentTriggeredByApiWorker = createWorker(
  SweetQueues.DEPLOYMENT_TRIGGERED_BY_API.name,
  async (job: Job<QueuePayload<"DEPLOYMENT_TRIGGERED_BY_API">>) => {
    logger.info("deploymentTriggeredByApiWorker", { data: job.data });

    const deployment = await handleDeploymentTriggeredByApi(job.data);

    logger.info("deploymentTriggeredByApiWorker: Deployment created", {
      deployment,
    });

    await addJob("DEPLOYMENT_AUTO_LINK_PULL_REQUESTS", {
      deploymentId: deployment.id,
      workspaceId: job.data.workspaceId,
    });
  }
);
