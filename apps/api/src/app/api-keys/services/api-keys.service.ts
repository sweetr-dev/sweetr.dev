import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import { AuthorizationException } from "../../errors/exceptions/authorization.exception";
import { randomUUID } from "crypto";
import { hashWithSha256 } from "../../../lib/crypto";

export const findApiKeyByWorkspaceId = async (workspaceId: number) => {
  return getPrisma(workspaceId).apiKey.findFirst({
    where: { workspaceId },
  });
};

export const regenerateApiKey = async (
  workspaceId: number,
  creatorId: number
) => {
  const key = randomUUID();
  const hashedKey = hashWithSha256(key);

  const apiKey = await getPrisma(workspaceId).apiKey.findFirst({
    where: { workspaceId },
  });

  if (apiKey) {
    await getPrisma(workspaceId).apiKey.update({
      where: { id: apiKey.id },
      data: { key: hashedKey, lastUsedAt: null, creatorId },
    });

    return key;
  }

  await getPrisma(workspaceId).apiKey.create({
    data: {
      workspaceId,
      key: hashedKey,
      name: "Default",
      creatorId,
    },
  });

  return key;
};

export const findApiKeyOrThrow = async (key: string) => {
  if (!key) {
    throw new AuthorizationException("Invalid API key");
  }

  const hashedKey = hashWithSha256(key);

  const apiKey = await getBypassRlsPrisma().apiKey.findUnique({
    where: { key: hashedKey },
  });

  if (!apiKey) {
    throw new AuthorizationException("Invalid API key");
  }

  await getBypassRlsPrisma().apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey;
};
