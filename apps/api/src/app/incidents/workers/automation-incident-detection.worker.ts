import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { handleIncidentDetectionAutomation } from "../services/incident-detection.service";

interface AutomationIncidentDetectionJobData {
  deploymentId: number;
  workspaceId: number;
}

export const automationIncidentDetectionWorker = createWorker(
  SweetQueue.AUTOMATION_INCIDENT_DETECTION,
  async (job: Job<AutomationIncidentDetectionJobData>) => {
    logger.info("[AUTOMATION_INCIDENT_DETECTION]", { data: job.data });

    await handleIncidentDetectionAutomation({
      workspaceId: job.data.workspaceId,
      deploymentId: job.data.deploymentId,
    });
  }
);
