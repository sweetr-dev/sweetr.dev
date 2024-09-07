import { addJob, SweetQueue } from "../../../../bull-mq/queues";

const webhookToQueueMap: Record<string, SweetQueue[]> = {
  app_uninstalled: [SweetQueue.SLACK_APP_UNINSTALLED],
};

export const enqueueSlackWebhook = async (
  type: string,
  payload: unknown
): Promise<void> => {
  if (!webhookToQueueMap[type]) {
    return;
  }

  for (const queue of webhookToQueueMap[type]) {
    await addJob(queue, payload);
  }
};
