import { GitProfile } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { UpsertGitProfileInput } from "./git-profile.types";

export const upsertGitProfile = async (
  input: UpsertGitProfileInput
): Promise<GitProfile> => {
  const data = {
    ...input,
    avatar: input.avatar ?? undefined,
    bio: input.bio ?? undefined,
    location: input.location ?? undefined,
  };

  return getPrisma().gitProfile.upsert({
    where: {
      gitProvider_gitUserId: {
        gitUserId: input.gitUserId,
        gitProvider: input.gitProvider,
      },
    },
    create: data,
    update: data,
  });
};
