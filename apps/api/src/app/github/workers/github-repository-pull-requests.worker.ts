import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { Repository } from "@prisma/client";
import { syncGitHubRepositoryPullRequests } from "../services/github-repository-pull-requests.service";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";

export const githubRepositoryPullRequestsSyncWorker = createWorker(
  SweetQueue.GITHUB_SYNC_REPOSITORY_PULL_REQUESTS,
  async (job: Job<{ gitInstallationId: number; repository: Repository }>) => {
    if (!job.data.gitInstallationId || !job.data.repository.name) {
      throw new InputValidationException("Missing job data", { job });
    }

    await syncGitHubRepositoryPullRequests(
      job.data.repository.name,
      job.data.gitInstallationId
    );
  }
);
