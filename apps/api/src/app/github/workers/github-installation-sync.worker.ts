import { InstallationCreatedEvent } from "@octokit/webhooks-types";
import { Job } from "bullmq";
import { addJob, SweetQueue } from "../../../bull-mq/queues";
import { syncGitHubInstallation } from "../services/github-installation.service";
import { createWorker } from "../../../bull-mq/workers";

export const githubInstallationSyncWorker = createWorker(
  SweetQueue.GITHUB_INSTALLATION_SYNC,
  async (job: Job<InstallationCreatedEvent>) => {
    await syncGitHubInstallation(job.data.installation, job.data.sender);

    await addJob(
      SweetQueue.SAAS_NOTIFY_NEW_INSTALLATION,
      {
        installationId: job.data.installation.id,
      },
      {
        delay: 1000 * 10,
      }
    );
  }
);
