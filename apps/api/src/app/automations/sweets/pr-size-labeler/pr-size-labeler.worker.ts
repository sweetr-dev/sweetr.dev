import {
  PullRequestOpenedEvent,
  PullRequestSynchronizeEvent,
} from "@octokit/webhooks-types";
import { Job } from "bullmq";
import { SweetQueue } from "../../../../bull-mq/queues";
import { createWorker } from "../../../../bull-mq/workers";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";
import { withDelayedRetryOnRateLimit } from "../../../github/services/github-rate-limit.service";
import { runPrSizeLabelerAutomation } from "./pr-size-labeler.service";

export const prTitleCheckWorker = createWorker(
  SweetQueue.AUTOMATION_PR_SIZE_LABELER,
  async (
    job: Job<PullRequestOpenedEvent | PullRequestSynchronizeEvent>,
    token?: string
  ) => {
    if (!job.data.installation?.id) {
      throw new InputValidationException(
        "Received Pull Request webhook without installation",
        { extra: { jobData: job.data }, severity: "error" }
      );
    }

    if (!job.data.pull_request?.node_id) {
      throw new InputValidationException(
        "Received Pull Request webhook without Pull Request",
        { extra: { jobData: job.data }, severity: "error" }
      );
    }

    const installationId = job.data.installation.id;

    await withDelayedRetryOnRateLimit(
      () => runPrSizeLabelerAutomation(installationId, job.data.pull_request),
      {
        job,
        jobToken: token,
        installationId,
      }
    );
  },
  {
    limiter: {
      max: 8,
      duration: 1000,
    },
  }
);
