import { addJob, SweetQueueName } from "../../../../bull-mq/queues";

const webhookToQueueMap: Partial<Record<string, SweetQueueName[]>> = {
  app_uninstalled: ["SLACK_APP_UNINSTALLED"],
};

export const enqueueSlackWebhook = async (
  type: string,
  payload: unknown
): Promise<void> => {
  if (!webhookToQueueMap[type]) {
    return;
  }

  for (const queue of webhookToQueueMap[type]!) {
    await addJob(queue, payload as { team_id: string });
  }
};
