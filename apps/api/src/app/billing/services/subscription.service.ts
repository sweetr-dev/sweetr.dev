import { Subscription } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { logger } from "../../../lib/logger";
import { findWorkspaceByIdOrThrow } from "../../workspaces/services/workspace.service";
import { getStripeSubscription } from "./stripe.service";

export const findSubscription = (workspaceId: number) => {
  return getPrisma(workspaceId).subscription.findFirst({
    where: { workspaceId },
    include: {
      workspace: true,
    },
  });
};

export const isSubscriptionActive = (subscription: Subscription) => {
  return subscription.status === "active";
};

export const syncSubscriptionWithStripe = async (subscriptionId: string) => {
  logger.info("syncSubscriptionWithStripe", { subscriptionId });

  const subscription = await getStripeSubscription(subscriptionId);

  const workspace = await findWorkspaceByIdOrThrow(
    parseInt(subscription.metadata.workspaceId)
  );

  const priceId = subscription.items.data.at(0)?.plan.id;

  if (!priceId) {
    throw new BusinessRuleException("[Stripe] Missing priceId");
  }

  const data = {
    workspaceId: workspace.id,
    priceId,
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    object: JSON.stringify(subscription),
  };

  return getPrisma(workspace.id).subscription.upsert({
    where: {
      subscriptionId: data.subscriptionId,
    },
    create: data,
    update: data,
  });
};
