import { addJobs, SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { findScheduledDigests } from "../services/digest-schedule.service";

export const cronScheduleDigestsWorker = createWorker(
  SweetQueue.CRON_SCHEDULE_DIGESTS,
  async () => {
    logger.info("cronScheduleDigestsWorker");

    const digests = await findScheduledDigests(new Date());

    logger.info(
      `cronScheduleDigestsWorker: processing ${digests.length} digests`,
      {
        extra: { digests: digests.map((d) => d.id) },
      }
    );

    await addJobs(SweetQueue.DIGEST_SEND, digests);
  }
);
