import {
  InstallationNewPermissionsAcceptedEvent,
  InstallationSuspendEvent,
  InstallationUnsuspendEvent,
} from "@octokit/webhooks-types";
import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { syncInstallationConfig as syncInstallationConfig } from "../services/github-installation.service";
import { createWorker } from "../../../bull-mq/workers";

export const githubInstallationConfigSyncWorker = createWorker(
  SweetQueue.GITHUB_INSTALLATION_CONFIG_SYNC,
  async (
    job: Job<
      | InstallationNewPermissionsAcceptedEvent
      | InstallationSuspendEvent
      | InstallationUnsuspendEvent
    >
  ) => {
    await syncInstallationConfig(job.data.installation.id);
  }
);
