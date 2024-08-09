import Stripe from "stripe";
import { addJob, SweetQueue } from "../../../bull-mq/queues";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { getStripeClient } from "../../../lib/stripe";
import { getPrisma } from "../../../prisma";
import { CreateSessionArgs } from "./stripe.types";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { env } from "../../../env";

const webhookToQueueMap: Record<string, SweetQueue[]> = {
  "customer.subscription.created": [SweetQueue.STRIPE_SUBSCRIPTION_UPDATED],
  "customer.subscription.updated": [SweetQueue.STRIPE_SUBSCRIPTION_UPDATED],
  "customer.subscription.deleted": [SweetQueue.STRIPE_SUBSCRIPTION_UPDATED],
};

export const enqueueStripeWebhook = async (event: Stripe.Event) => {
  if (!webhookToQueueMap[event.type]) {
    throw new BusinessRuleException("Unsupported Stripe webhook", {
      type: event.type,
    });
  }

  for (const queue of webhookToQueueMap[event.type]) {
    await addJob(queue, event.data);
  }
};

export const getStripeSubscription = (subscriptionId: string) =>
  getStripeClient().subscriptions.retrieve(subscriptionId);

export const createStripeCustomerPortalSession = async (
  workspaceId: number
) => {
  const workspace = await getPrisma(workspaceId).workspace.findFirst({
    where: { id: workspaceId },
    include: {
      subscription: true,
    },
  });

  console.log("no sub", workspace);

  if (!workspace?.subscription) return null;

  console.log("creating session");

  const session = await getStripeClient().billingPortal.sessions.create({
    customer: workspace.subscription.customerId,
    return_url: `${env.FRONTEND_URL}/settings/billing`,
  });

  return session;
};

export const createStripeCheckoutSession = async ({
  key,
  quantity,
  workspaceId,
}: CreateSessionArgs) => {
  const prices = await getStripeClient().prices.list({
    lookup_keys: [key],
    expand: ["data.product"],
  });

  if (!prices.data[0]) {
    throw new ResourceNotFoundException("Could not find plan");
  }

  return getStripeClient().checkout.sessions.create({
    billing_address_collection: "auto",
    allow_promotion_codes: true,
    line_items: [
      {
        price: prices.data[0].id,
        quantity: quantity,
      },
    ],
    subscription_data: {
      metadata: {
        workspaceId,
      },
    },
    mode: "subscription",
    success_url: `${env.FRONTEND_URL}/settings/billing?newPurchase=true`,
    cancel_url: `${env.FRONTEND_URL}/settings/billing`,
  });
};
