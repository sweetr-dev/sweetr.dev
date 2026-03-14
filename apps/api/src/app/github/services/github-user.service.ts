import { GitProfile, GitProvider } from "@prisma/client";
import { GitHubUser } from "./github-user.types";
import { Optional } from "utility-types";

export const gitHubUserToGitProfileData = (
  gitHubUser: GitHubUser
): Optional<
  Omit<GitProfile, "id" | "createdAt" | "updatedAt" | "userId">,
  "bio" | "location"
> => {
  return {
    gitProvider: GitProvider.GITHUB,
    gitUserId: gitHubUser.nodeId,
    handle: gitHubUser.login,
    name: gitHubUser.name || gitHubUser.login,
    avatar: gitHubUser.avatarUrl || null,
    bio: gitHubUser.bio,
    location: gitHubUser.location,
  };
};
