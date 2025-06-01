import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { InstallationRepositoriesEvent } from "@octokit/webhooks-types";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { syncGitHubRepositories } from "../services/github-repository.service";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";

export const githubRepositoriesSyncWorker = createWorker(
  SweetQueue.GITHUB_REPOSITORIES_SYNC,
  async (
    job: Job<InstallationRepositoriesEvent | { installation?: { id: number } }>,
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
