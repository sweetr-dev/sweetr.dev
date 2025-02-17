import { Workspace, Subscription } from "@prisma/client";
import { redisConnection } from "../bull-mq/redis-connection";
import { getRandomString } from "../lib/crypto";
import { isAppSelfHosted } from "../lib/self-host";
import { getPrisma } from "../prisma";
import {
  isSubscriptionActive,
  isTrialExpired,
} from "./billing/services/billing.service";
import { AuthorizationException } from "./errors/exceptions/authorization.exception";
import { BusinessRuleException } from "./errors/exceptions/business-rule.exception";

export const authorizeWorkspaceOrThrow = async ({
  workspaceId,
  gitProfileId,
}: {
  workspaceId: number;
  gitProfileId: number;
}) => {
  const membership = await getPrisma(workspaceId).workspaceMembership.findFirst(
    {
      where: {
        workspaceId,
        gitProfileId: gitProfileId,
      },
    }
  );

  if (!membership) {
    throw new AuthorizationException();
  }
};

export const isActiveCustomer = (
  workspace: Workspace & { subscription?: Subscription | null }
) => {
  if (isAppSelfHosted()) {
    return true;
  }

  if (workspace.subscription && isSubscriptionActive(workspace.subscription)) {
    return true;
  }

  if (isTrialExpired(workspace.trialEndAt)) {
    return false;
  }

  // No trial + no subscription = active
  // Allow us to give indefinite active accounts
  return true;
};

export const preventCSRFAttack = async (nonce: string) => {
  const keyValue = await redisConnection.get(`oauth:state:${nonce}`);

  if (!keyValue) {
    throw new BusinessRuleException("Could not validate state", {
      severity: "info",
    });
  }

  redisConnection.del(`oauth:state:${nonce}`);
};

export const getTemporaryNonce = () => {
  const nonce = getRandomString(16);

  redisConnection.setex(`oauth:state:${nonce}`, 60 * 5, nonce);

  return nonce;
};
