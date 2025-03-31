import { randomBytes } from "crypto";
import { getPrisma } from "../../../prisma";
import { bcryptHash } from "../../../lib/bcrypt";

export const findApiKeyByWorkspaceId = async (workspaceId: number) => {
  return getPrisma(workspaceId).apiKey.findFirst({
    where: { workspaceId },
  });
};

export const regenerateApiKey = async (
  workspaceId: number,
  creatorId: number
) => {
  const key = randomBytes(40).toString("hex");
  const hashedKey = await bcryptHash(key);

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
