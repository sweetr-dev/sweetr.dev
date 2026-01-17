import Stripe from "stripe";
import { addJob, SweetQueueName } from "../../../bull-mq/queues";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { getStripeClient } from "../../../lib/stripe";
import { getPrisma } from "../../../prisma";
import { CreateSessionArgs } from "./stripe.types";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { env } from "../../../env";

const webhookToQueueMap: Partial<Record<string, SweetQueueName[]>> = {
  "customer.subscription.created": ["STRIPE_SUBSCRIPTION_UPDATED"],
  "customer.subscription.updated": ["STRIPE_SUBSCRIPTION_UPDATED"],
  "customer.subscription.deleted": ["STRIPE_SUBSCRIPTION_UPDATED"],
};

export const enqueueStripeWebhook = async (event: Stripe.Event) => {
  if (!webhookToQueueMap[event.type]) {
    throw new BusinessRuleException("Unsupported Stripe webhook", {
      type: event.type,
    });
  }

  for (const queue of webhookToQueueMap[event.type]!) {
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

  if (!workspace?.subscription?.stripeCustomerId) {
    throw new ResourceNotFoundException("Subscription not found", {
      extra: { workspaceId },
    });
  }

  const session = await getStripeClient().billingPortal.sessions.create({
    customer: workspace.subscription.stripeCustomerId,
    return_url: `${env.WEB_APP_URL}/settings/billing`,
  });

  return session;
};

export const createStripeCheckoutSession = async ({
  workspaceId,
  gitInstallationId,
  successUrl,
  priceId,
}: CreateSessionArgs) => {
  const stripe = getStripeClient();

  const workspace = await getPrisma(workspaceId).workspace.findFirst({
    where: { id: workspaceId },
    include: {
      subscription: true,
      _count: {
        select: {
          gitProfiles: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new ResourceNotFoundException("Workspace not found", {
      extra: { workspaceId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: "auto",
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: workspace._count.gitProfiles,
      },
    ],
    success_url: successUrl,
    cancel_url: successUrl,
    metadata: {
      workspaceId: workspaceId.toString(),
      gitInstallationId: gitInstallationId.toString(),
    },
    subscription_data: {
      metadata: {
        workspaceId: workspaceId.toString(),
        gitInstallationId: gitInstallationId.toString(),
      },
    },
  });

  return session;
};
