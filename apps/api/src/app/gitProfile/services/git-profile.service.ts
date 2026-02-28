import { GitProfile, Prisma } from "@prisma/client";
import { getPrisma } from "../../../prisma";

export const upsertGitProfile = async (
  args: Prisma.GitProfileCreateInput
): Promise<GitProfile> => {
  const { gitProvider, gitUserId, handle, name, avatar, bio, location } = args;

  const data = {
    gitProvider,
    gitUserId,
    handle,
    name,
    avatar: avatar ?? null,
    bio: bio ?? null,
    location: location ?? null,
  };

  return getPrisma().gitProfile.upsert({
    where: {
      gitProvider_gitUserId: { gitUserId, gitProvider },
    },
    create: data,
    update: data,
  });
};
