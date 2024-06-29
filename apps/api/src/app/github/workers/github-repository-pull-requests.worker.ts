import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { Repository } from "@prisma/client";
import { syncGitHubRepositoryPullRequests } from "../services/github-repository-pull-requests.service";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";

export const githubRepositoryPullRequestsSyncWorker = createWorker(
  SweetQueue.GITHUB_SYNC_REPOSITORY_PULL_REQUESTS,
  async (job: Job<{ gitInstallationId: number; repository: Repository }>) => {
    const installationId = job.data.gitInstallationId;

    if (!installationId || !job.data.repository.name) {
      throw new InputValidationException("Missing job data", { job });
    }

    await withDelayedRetryOnRateLimit(
      () =>
        syncGitHubRepositoryPullRequests(
          job.data.repository.name,
          installationId
        ),
      {
        job,
        installationId,
      }
    );
  },
  {
    limiter: {
      max: 1,
      duration: 1000,
    },
  }
);
