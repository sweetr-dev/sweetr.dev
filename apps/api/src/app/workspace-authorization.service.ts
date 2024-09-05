import { redisConnection } from "../bull-mq/redis-connection";
import { getRandomString } from "../lib/crypto";
import { getPrisma } from "../prisma";
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
