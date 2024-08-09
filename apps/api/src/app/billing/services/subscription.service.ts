import { Subscription } from "@prisma/client";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { logger } from "../../../lib/logger";
import { findWorkspaceByIdOrThrow } from "../../workspaces/services/workspace.service";
import { getStripeSubscription } from "./stripe.service";
import { startOfDay, subDays } from "date-fns";
import { getStripeClient } from "../../../lib/stripe";

export const findSubscription = (workspaceId: number) => {
  return getPrisma(workspaceId).subscription.findFirst({
    where: { workspaceId },
    include: {
      workspace: true,
    },
  });
};

export const findActiveSubscriptions = () => {
  return getBypassRlsPrisma().subscription.findMany({
    where: {
      status: "active",
    },
    include: {
      workspace: true,
    },
  });
};

export const isSubscriptionActive = (subscription: Subscription) => {
  return subscription.status === "active";
};

export const syncSubscriptionQuantity = async (subscription: Subscription) => {
  const contributors = await countContributors(subscription.workspaceId);

  if (contributors !== subscription.quantity) {
    const stripeSubscription = JSON.parse(subscription.object as string);
    const item = stripeSubscription.items.data.at(0);

    if (!item) {
      throw new BusinessRuleException("Stripe subscription has no item", {
        extra: { subscription },
      });
    }

    await getStripeClient().subscriptionItems.update(item.id, {
      quantity: contributors,
    });
  }
};

export const countContributors = (workspaceId: number) => {
  const sinceDate = startOfDay(subDays(new Date(), 30));

  return getPrisma(workspaceId).workspaceMembership.count({
    where: {
      workspaceId,
      gitProfile: {
        OR: [
          {
            codeReviews: {
              some: {
                createdAt: {
                  gte: sinceDate,
                },
              },
            },
          },
          {
            pullRequests: {
              some: {
                createdAt: {
                  gte: sinceDate,
                },
              },
            },
          },
        ],
      },
    },
  });
};

export const syncSubscriptionWithStripe = async (subscriptionId: string) => {
  logger.info("syncSubscriptionWithStripe", { subscriptionId });

  const subscription = await getStripeSubscription(subscriptionId);

  const workspace = await findWorkspaceByIdOrThrow(
    parseInt(subscription.metadata.workspaceId)
  );

  const item = subscription.items.data.at(0);

  if (!item) {
    throw new BusinessRuleException("[Stripe] Missing item");
  }

  if (!item.quantity) {
    throw new BusinessRuleException("[Stripe] Missing item quantity");
  }

  const data = {
    workspaceId: workspace.id,
    priceId: item.plan.id,
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
    status: subscription.status,
    interval: item.plan.interval,
    quantity: item.quantity,
    startedAt: new Date(subscription.start_date * 1000),
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
