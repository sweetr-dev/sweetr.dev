import { Subscription, Workspace } from "@prisma/client";
import { Billing } from "../../../../graphql-types";
import { isSubscriptionActive } from "../../services/billing.service";

export const transformBilling = (
  workspace: Workspace,
  subscription: Subscription | null
): Pick<Billing, "trial" | "subscription"> => {
  return {
    trial: workspace.trialEndAt
      ? {
          endAt: workspace.trialEndAt.toISOString(),
        }
      : null,
    subscription: subscription
      ? {
          isActive: isSubscriptionActive(subscription),
        }
      : null,
  };
};
