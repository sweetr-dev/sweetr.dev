import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { RepositoryEvent } from "@octokit/webhooks-types";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { syncGitHubRepositories } from "../services/github-repository.service";

export const githubRepositoriesSyncWorker = createWorker(
  SweetQueue.GITHUB_REPOSITORIES_SYNC,
  async (
    job: Job<RepositoryEvent & { shouldSyncRepositoryPullRequests?: boolean }>
  ) => {
    if (!job.data.installation) {
      throw new InputValidationException(
        "Missing installation or organization",
        { job }
      );
    }

    await syncGitHubRepositories(
      job.data.installation.id,
      job.data.shouldSyncRepositoryPullRequests || false
    );
  }
);
