import { Job } from "bullmq";
import { SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { syncOrganizationMembers } from "../services/github-member.service";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";

export const githubMemberSyncWorker = createWorker(
  SweetQueues.GITHUB_MEMBERS_SYNC.name,
  async (job: Job<QueuePayload<"GITHUB_MEMBERS_SYNC">>, token?: string) => {
    const installationId = job.data.installation?.id;

    if (!installationId || !job.data.organization) {
      throw new InputValidationException(
        "Missing installation or organization",
        { job }
      );
    }

    await withDelayedRetryOnRateLimit(
      () =>
        syncOrganizationMembers(installationId, job.data.organization.login),
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
