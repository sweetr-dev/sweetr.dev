import { InstallationDeletedEvent } from "@octokit/webhooks-types";
import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { handleAppUninstall } from "../services/github-deleted.service";

export const githubInstallationDeletedWorker = createWorker(
  SweetQueue.GITHUB_INSTALLATION_DELETED,
  async (job: Job<InstallationDeletedEvent>) => {
    await handleAppUninstall(job.data.installation);
  }
);
