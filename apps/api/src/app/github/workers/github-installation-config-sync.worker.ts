import { Job } from "bullmq";
import { QueuePayload, SweetQueues } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { syncInstallationConfig } from "../services/github-installation.service";

export const githubInstallationConfigSyncWorker = createWorker(
  SweetQueues.GITHUB_INSTALLATION_CONFIG_SYNC.name,
  async (job: Job<QueuePayload<"GITHUB_INSTALLATION_CONFIG_SYNC">>) => {
    await syncInstallationConfig(job.data.installation.id);
  }
);
