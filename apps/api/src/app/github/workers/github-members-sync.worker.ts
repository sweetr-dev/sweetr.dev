import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { syncOrganizationMembers } from "../services/github-member.service";
import {
  OrganizationMemberAddedEvent,
  OrganizationMemberRemovedEvent,
} from "@octokit/webhooks-types";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";

export const githubMemberSyncWorker = createWorker(
  SweetQueue.GITHUB_MEMBERS_SYNC,
  async (
    job: Job<OrganizationMemberAddedEvent | OrganizationMemberRemovedEvent>
  ) => {
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
        installationId,
      }
    );
  }
);
