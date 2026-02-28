import { GitProfile, GitProvider } from "@prisma/client";
import { GitHubUser } from "./github-user.types";

export const gitHubUserToGitProfileData = (
  gitHubUser: GitHubUser
): Omit<GitProfile, "id" | "createdAt" | "updatedAt" | "userId"> => {
  return {
    gitProvider: GitProvider.GITHUB,
    gitUserId: gitHubUser.nodeId,
    handle: gitHubUser.login,
    name: gitHubUser.name || gitHubUser.login,
    avatar: gitHubUser.avatarUrl || null,
    bio: gitHubUser.bio || null,
    location: gitHubUser.location || null,
  };
};
