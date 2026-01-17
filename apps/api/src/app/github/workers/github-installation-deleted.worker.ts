import { Job } from "bullmq";
import { SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { handleAppUninstall } from "../services/github-deleted.service";

export const githubInstallationDeletedWorker = createWorker(
  SweetQueues.GITHUB_INSTALLATION_DELETED.name,
  async (job: Job<QueuePayload<"GITHUB_INSTALLATION_DELETED">>) => {
    await handleAppUninstall(job.data.installation);
  }
);
