import { Job } from "bullmq";
import { SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { sendDigest } from "../services/digest.service";

export const digestSendWorker = createWorker(
  SweetQueues.DIGEST_SEND.name,
  async (job: Job<QueuePayload<"DIGEST_SEND">>) => {
    const digest = job.data;

    logger.info("digestSendWorker", { extra: { digest } });

    if (!digest || !digest.type) {
      throw new InputValidationException("digestSendWorker: Invalid digest", {
        extra: { digest },
      });
    }

    await sendDigest(digest);
  }
);
