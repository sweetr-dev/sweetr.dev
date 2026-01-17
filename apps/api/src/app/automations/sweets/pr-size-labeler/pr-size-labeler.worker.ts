import { Job } from "bullmq";
import { SweetQueues, QueuePayload } from "../../../../bull-mq/queues";
import { createWorker } from "../../../../bull-mq/workers";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";
import { withDelayedRetryOnRateLimit } from "../../../github/services/github-rate-limit.service";
import { runPrSizeLabelerAutomation } from "./pr-size-labeler.service";

export const prSizeLabelerWorker = createWorker(
  SweetQueues.AUTOMATION_PR_SIZE_LABELER.name,
  async (
    job: Job<QueuePayload<"AUTOMATION_PR_SIZE_LABELER">>,
    token?: string
  ) => {
    if (!job.data.installation?.id) {
      throw new InputValidationException(
        "[Automation][PR Size Labeler] Received webhook without installation",
        { extra: { jobData: job.data }, severity: "error" }
      );
    }

    if (!job.data.pull_request?.node_id) {
      throw new InputValidationException(
        "[Automation][PR Size Labeler] Received webhook without Pull Request",
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
