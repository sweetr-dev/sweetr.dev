import { Job } from "bullmq";
import { SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { alertMergedWithoutApproval } from "../services/alert-merged-without-approval.service";

export const alertMergedWithoutApprovalWorker = createWorker(
  SweetQueues.ALERT_MERGED_WITHOUT_APPROVAL.name,
  async (job: Job<QueuePayload<"ALERT_MERGED_WITHOUT_APPROVAL">>) => {
    logger.info("alertMergedWithoutApprovalWorker", {
      pullRequestId: job.data.pull_request?.node_id,
      installationId: job.data.installation?.id,
    });

    if (!job.data.installation?.id) {
      throw new InputValidationException(
        "Received Pull Request webhook without installation",
        { extra: { jobData: job.data }, severity: "error" }
      );
    }

    if (!job.data.pull_request?.node_id) {
      throw new InputValidationException(
        "Received Pull Request webhook without Pull Request",
        { extra: { jobData: job.data }, severity: "error" }
      );
    }

    await alertMergedWithoutApproval(
      job.data.installation.id.toString(),
      job.data.pull_request.node_id
    );
  }
);
