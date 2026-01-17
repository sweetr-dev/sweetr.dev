import { Job } from "bullmq";
import { QueuePayload, SweetQueues } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";
import { syncGitHubRepositories } from "../services/github-repository.service";

export const githubRepositoriesSyncWorker = createWorker(
  SweetQueues.GITHUB_REPOSITORIES_SYNC.name,
  async (
    job: Job<QueuePayload<"GITHUB_REPOSITORIES_SYNC">>,
    token?: string
  ) => {
    const installationId = job.data.installation?.id;

    if (!installationId) {
      throw new InputValidationException(
        "Missing installation or organization",
        { job }
      );
    }

    // This job is triggered by GitHub repository webhooks, or when the user is first installing Sweetr.
    // On first installation, repositories_added is not present.
    const syncRepositories =
      "repositories_added" in job.data
        ? job.data.repositories_added?.map((repository) => repository.name)
        : undefined;

    await withDelayedRetryOnRateLimit(
      () => syncGitHubRepositories(installationId, syncRepositories),
      {
        job,
        jobToken: token,
        installationId,
      }
    );
  }
);
