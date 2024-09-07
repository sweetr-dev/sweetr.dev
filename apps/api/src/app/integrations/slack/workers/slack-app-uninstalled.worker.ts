import { Job } from "bullmq";
import { SweetQueue } from "../../../../bull-mq/queues";
import { createWorker } from "../../../../bull-mq/workers";
import { logger } from "../../../../lib/logger";
import { removeIntegrationByTeamId } from "../services/slack.service";

export const slackAppUninstalledWorker = createWorker(
  SweetQueue.SLACK_APP_UNINSTALLED,
  async (job: Job<{ team_id: string }>) => {
    logger.info("slackAppUninstalled", { teamId: job.data.team_id });

    if (job.data.team_id) {
      await removeIntegrationByTeamId(job.data.team_id);
    }
  }
);
