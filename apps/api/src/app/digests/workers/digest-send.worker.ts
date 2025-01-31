import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { DigestWithRelations } from "../services/digest.types";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { sendDigest } from "../services/digest.service";

export const digestSendWorker = createWorker(
  SweetQueue.DIGEST_SEND,
  async (job: Job<DigestWithRelations>) => {
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
