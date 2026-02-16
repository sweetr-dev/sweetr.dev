import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";
import { syncOrganizationTeams } from "../services/github-team.service";

export const githubTeamsSyncWorker = createWorker(
  SweetQueue.GITHUB_SYNC_TEAMS,
  async (
    job: Job<{ installationId: number; organizationName: string }>,
    token?: string
  ) => {
    const { installationId, organizationName } = job.data;

    if (!installationId || !organizationName) {
      throw new InputValidationException(
        "Missing installationId or organizationName",
        { jobData: job.data }
      );
    }

    await withDelayedRetryOnRateLimit(
      () => syncOrganizationTeams(installationId, organizationName),
      {
        job,
        jobToken: token,
        installationId,
      }
    );
  },
  {
    limiter: {
      max: 2,
      duration: 1000,
    },
  }
);
