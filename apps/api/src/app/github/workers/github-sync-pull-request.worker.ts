import {
  PullRequestClosedEvent,
  PullRequestOpenedEvent,
  PullRequestSynchronizeEvent,
} from "@octokit/webhooks-types";
import { Job } from "bullmq";
import { addJob, SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { syncPullRequest } from "../services/github-pull-request.service";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";

export const syncPullRequestWorker = createWorker(
  SweetQueue.GITHUB_SYNC_PULL_REQUEST,
  async (
    job: Job<
      (
        | PullRequestSynchronizeEvent
        | PullRequestOpenedEvent
        | PullRequestClosedEvent
      ) & {
        syncReviews?: boolean;
        initialSync?: boolean;
      }
    >,
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
    const options = {
      syncReviews: job.data.syncReviews || false,
      initialSync: job.data.initialSync || false,
      failCount: job.attemptsMade,
    };

    await withDelayedRetryOnRateLimit(
      () =>
        syncPullRequest(installationId, job.data.pull_request.node_id, options),
      {
        job,
        jobToken: token,
        installationId,
      }
    );

    await addJob(SweetQueue.AUTOMATION_PR_SIZE_LABELER, job.data);

    if (job.data.action === "closed") {
      await addJob(SweetQueue.ALERT_MERGED_WITHOUT_APPROVAL, job.data);
    }
  },
  {
    limiter: {
      max: 8,
      duration: 1000,
    },
  }
);
