import { Job } from "bullmq";
import { addJob, SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { syncGitHubInstallation } from "../services/github-installation.service";
import { createWorker } from "../../../bull-mq/workers";

export const githubInstallationSyncWorker = createWorker(
  SweetQueues.GITHUB_INSTALLATION_SYNC.name,
  async (job: Job<QueuePayload<"GITHUB_INSTALLATION_SYNC">>) => {
    await syncGitHubInstallation(job.data.installation, job.data.sender);

    await addJob(
      "SAAS_NOTIFY_NEW_INSTALLATION",
      {
        installationId: job.data.installation.id,
      },
      {
        delay: 1000 * 10,
      }
    );
  }
);
