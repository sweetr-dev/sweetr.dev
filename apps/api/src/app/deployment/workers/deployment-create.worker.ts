import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { CreateDeploymentInput } from "../services/deployment.validation";

export const deploymentCreateWorker = createWorker(
  SweetQueue.DEPLOYMENT_CREATE,
  async (job: Job<CreateDeploymentInput>) => {
    console.log("deploymentCreateWorker", job.data);
  }
);
