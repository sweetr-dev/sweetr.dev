import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { RepositoryEvent } from "@octokit/webhooks-types";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { syncGitHubRepositories } from "../services/github-repository.service";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";

export const githubRepositoriesSyncWorker = createWorker(
  SweetQueue.GITHUB_REPOSITORIES_SYNC,
  async (job: Job<RepositoryEvent & { syncPullRequests?: boolean }>) => {
    const installationId = job.data.installation?.id;

    if (!installationId) {
      throw new InputValidationException(
        "Missing installation or organization",
        { job }
      );
    }

    await withDelayedRetryOnRateLimit(
      () =>
        syncGitHubRepositories(
          installationId,
          job.data.syncPullRequests || false
        ),
      {
        job,
        installationId,
      }
    );
  }
);
