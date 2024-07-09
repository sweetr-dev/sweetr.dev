import {
  PullRequestReviewDismissedEvent,
  PullRequestReviewSubmittedEvent,
} from "@octokit/webhooks-types";
import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { syncCodeReviews } from "../services/github-code-review.service";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";

export const syncCodeReviewWorker = createWorker(
  SweetQueue.GITHUB_SYNC_CODE_REVIEW,
  async (
    job: Job<PullRequestReviewSubmittedEvent | PullRequestReviewDismissedEvent>,
    token?: string
  ) => {
    const installationId = job.data.installation?.id;

    if (!installationId) {
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

    await withDelayedRetryOnRateLimit(
      () => syncCodeReviews(installationId, job.data.pull_request.node_id),
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
