import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { DigestWithRelations } from "../services/digest.types";
import { DigestType } from "@prisma/client";
import { sendTeamWipDigest } from "../services/digest-team-wip.service";
import { sendTeamMetricsDigest } from "../services/digest-team-metrics.service";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";

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

    if (digest.type === DigestType.TEAM_METRICS) {
      await sendTeamMetricsDigest(digest);
    }

    if (digest.type === DigestType.TEAM_WIP) {
      await sendTeamWipDigest(digest);
    }
  }
);
