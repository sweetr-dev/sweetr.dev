import {
  PullRequestClosedEvent,
  PullRequestOpenedEvent,
  PullRequestSynchronizeEvent,
} from "@octokit/webhooks-types";
import { PullRequest, PullRequestState } from "@prisma/client";
import { Job } from "bullmq";
import { addJob, JobPriority, SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import {
  incrementSyncBatchProgress,
  maybeFinishSyncBatch,
} from "../../sync-batch/services/sync-batch.service";
import { syncPullRequest } from "../services/github-pull-request.service";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";
import { DataIntegrityException } from "../../errors/exceptions/data-integrity.exception";

type JobData = (
  | PullRequestSynchronizeEvent
  | PullRequestOpenedEvent
  | PullRequestClosedEvent
) & { syncReviews?: boolean; syncBatchId?: number };

export const syncPullRequestWorker = createWorker(
  SweetQueue.GITHUB_SYNC_PULL_REQUEST,
  async (job: Job<JobData>, token?: string) => {
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
    const syncBatchId = job.data.syncBatchId;

    // We consider sync batch as done when all PRs have been attempted
    if (syncBatchId && job.attemptsMade === 0) {
      await incrementSyncBatchProgress(syncBatchId, "done", 1);
      await maybeFinishSyncBatch(syncBatchId);
    }

    const pullRequest = await withDelayedRetryOnRateLimit(
      () =>
        syncPullRequest({
          gitInstallationId: installationId,
          pullRequestId: job.data.pull_request.node_id,
          // GraphQL API is unreliable for getting the merge commit SHA, so we must use webhook data or refetch from HTTP API.
          // To avoid over-fetching, we attempt to use the webhook data first, and if it's not available, we refetch from the HTTP API.
          // See https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#get-a-pull-request
          webhookMergeCommitSha:
            job.data.pull_request.merge_commit_sha ?? undefined,
        }),
      { job, jobToken: token, installationId }
    );

    if (pullRequest) {
      await handlePostSyncActions(job.data, pullRequest);
    }
  },
  { limiter: { max: 8, duration: 1000 } }
);

const handlePostSyncActions = async (
  jobData: JobData,
  pullRequest: PullRequest
) => {
  const installationId = jobData.installation?.id;
  const syncBatchId = jobData.syncBatchId;

  if (!installationId) {
    throw new DataIntegrityException(
      "handlePostSyncActions: Missing installation ID",
      { extra: { jobData, pullRequest } }
    );
  }

  if (jobData.syncReviews) {
    logger.debug("syncPullRequest: Adding job to sync reviews", {
      pullRequest,
    });

    await addJob(
      SweetQueue.GITHUB_SYNC_CODE_REVIEW,
      {
        pull_request: { node_id: pullRequest.gitPullRequestId },
        installation: { id: installationId },
      },
      { priority: JobPriority.LOW }
    );
  }

  if (!syncBatchId) {
    await addJob(SweetQueue.AUTOMATION_PR_SIZE_LABELER, jobData);
  }

  if (pullRequest.state === PullRequestState.MERGED) {
    if (!syncBatchId) {
      await addJob(SweetQueue.ALERT_MERGED_WITHOUT_APPROVAL, jobData);
    }

    await addJob(SweetQueue.DEPLOYMENT_TRIGGERED_BY_PULL_REQUEST_MERGE, {
      workspaceId: pullRequest.workspaceId,
      pullRequestId: pullRequest.id,
      installationId,
    });
  }
};
