import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { syncOrganizationMembers } from "../services/github-member.service";
import {
  OrganizationMemberAddedEvent,
  OrganizationMemberRemovedEvent,
} from "@octokit/webhooks-types";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";

export const githubMemberSyncWorker = createWorker(
  SweetQueue.GITHUB_MEMBERS_SYNC,
  async (
    job: Job<OrganizationMemberAddedEvent | OrganizationMemberRemovedEvent>
  ) => {
    if (!job.data.installation || !job.data.organization) {
      throw new InputValidationException(
        "Missing installation or organization",
        { job }
      );
    }

    await syncOrganizationMembers(
      job.data.installation.id,
      job.data.organization.login
    );
  }
);
