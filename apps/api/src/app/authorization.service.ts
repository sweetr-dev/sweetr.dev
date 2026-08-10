import { Workspace, WorkspaceMembership, Subscription } from "@prisma/client";
import { getRedisConnection } from "../bull-mq/redis-connection";
import { getRandomString } from "../lib/crypto";
import { isAppSelfHosted } from "../lib/self-host";
import { getPrisma } from "../prisma";
import {
  isSubscriptionActive,
  isTrialExpired,
} from "./billing/services/billing.service";
import { AuthorizationException } from "./errors/exceptions/authorization.exception";
import { BusinessRuleException } from "./errors/exceptions/business-rule.exception";
import { getWorkspaceSettings } from "./workspaces/services/workspace-settings.service";

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
  const keyValue = await getRedisConnection().get(`oauth:state:${nonce}`);

  if (!keyValue) {
    throw new BusinessRuleException("Could not validate state", {
      severity: "info",
    });
  }

  getRedisConnection().del(`oauth:state:${nonce}`);
};

export const getTemporaryNonce = () => {
  const nonce = getRandomString(16);

  getRedisConnection().setex(`oauth:state:${nonce}`, 60 * 5, nonce);

  return nonce;
};

export const authorizeWorkspaceMemberOrThrow = async ({
  workspaceId,
  gitProfileId,
}: {
  workspaceId: number;
  gitProfileId: number;
}) => {
  const membership = await getPrisma(
    workspaceId
  ).workspaceMembership.findUnique({
    where: {
      gitProfileId_workspaceId: {
        gitProfileId,
        workspaceId,
      },
    },
  });

  if (!membership) {
    throw new AuthorizationException();
  }
};

export const authorizeWorkspaceAdminOrThrow = async ({
  workspaceId,
  gitProfileId,
}: {
  workspaceId: number;
  gitProfileId: number;
}) => {
  const membership = await getPrisma(
    workspaceId
  ).workspaceMembership.findUnique({
    where: {
      gitProfileId_workspaceId: {
        gitProfileId,
        workspaceId,
      },
    },
  });

  if (!membership) {
    throw new AuthorizationException();
  }

  if (membership.role !== "ADMIN") {
    throw new AuthorizationException();
  }
};

export const authorizeTeamMembersOrThrow = async ({
  workspaceId,
  members,
}: {
  workspaceId: number;
  members: {
    personId: number;
  }[];
}) => {
  // Make sure all members belong to the workspace
  const peopleCount = await getPrisma(workspaceId).workspaceMembership.count({
    where: {
      workspaceId: workspaceId,
      gitProfileId: { in: members.map((member) => member.personId) },
    },
  });

  if (peopleCount !== members.length) {
    throw new AuthorizationException(
      "Some members do not belong to this workspace."
    );
  }
};

export const isAllowedByLoginPolicy = (
  workspace: Pick<Workspace, "settings">,
  membership: Pick<WorkspaceMembership, "role">
): boolean => {
  const settings = getWorkspaceSettings(workspace);

  if (settings.auth.loginPolicy === "ONLY_ADMINS") {
    return membership.role === "ADMIN";
  }

  return true;
};

export const throwWhenLoginPolicyRestrictsAccess = (
  workspace: Pick<Workspace, "settings">,
  membership: Pick<WorkspaceMembership, "role">
) => {
  if (!isAllowedByLoginPolicy(workspace, membership)) {
    throw new AuthorizationException(
      "Your organization administrator has restricted access to this workspace.",
      {
        userFacingMessage:
          "Your organization administrator has restricted access to this workspace.",
      }
    );
  }
};
