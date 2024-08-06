import Stripe from "stripe";
import { addJob, SweetQueue } from "../../../bull-mq/queues";

const webhookToQueueMap: Record<string, SweetQueue[]> = {
  // Subscription
  "customer.subscription.created": [SweetQueue.STRIPE_SUBSCRIPTION_UPDATED],
  "customer.subscription.updated": [SweetQueue.STRIPE_SUBSCRIPTION_UPDATED],
  "customer.subscription.deleted": [SweetQueue.STRIPE_SUBSCRIPTION_UPDATED],

  // Invoice
  "invoice.upcoming": [SweetQueue.STRIPE_SUBSCRIPTION_REPORT_USAGE],
};

export const enqueueStripeWebhook = async (event: Stripe.Event) => {
  if (!webhookToQueueMap[event.type]) {
    return;
  }

  for (const queue of webhookToQueueMap[event.type]) {
    await addJob(queue, event.data);
  }
};
