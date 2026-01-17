import { Job } from "bullmq";
import { QueuePayload, SweetQueues } from "../../../../bull-mq/queues";
import { createWorker } from "../../../../bull-mq/workers";
import { logger } from "../../../../lib/logger";
import { removeIntegrationBySlackTeamId } from "../services/slack-integration.service";

export const slackAppUninstalledWorker = createWorker(
  SweetQueues.SLACK_APP_UNINSTALLED.name,
  async (job: Job<QueuePayload<"SLACK_APP_UNINSTALLED">>) => {
    logger.info("slackAppUninstalled", { teamId: job.data.team_id });

    if (job.data.team_id) {
      await removeIntegrationBySlackTeamId(job.data.team_id);
    }
  }
);
