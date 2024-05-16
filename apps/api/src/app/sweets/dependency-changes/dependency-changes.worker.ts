import {
  PullRequestOpenedEvent,
  PullRequestSynchronizeEvent,
} from "@octokit/webhooks-types";
import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { handlePackageHealthAutomation } from "./dependency-changes.service";
import { createWorker } from "../../../bull-mq/workers";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";

export const dependencyChangesWorker = createWorker(
  SweetQueue.SWEET_DEPENDENCY_CHANGES,
  async (job: Job<PullRequestSynchronizeEvent | PullRequestOpenedEvent>) => {
    if (!job.data.installation) {
      throw new InputValidationException(
        "Received Pull Request webhook without installation",
        { extra: { jobData: job.data } }
      );
    }

    if (job.data.repository.fork) {
      return;
    }

    await handlePackageHealthAutomation(
      job.data.installation.id,
      job.data.pull_request
    );
  }
);
