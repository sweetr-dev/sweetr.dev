import { createFieldResolver } from "../../../../lib/graphql";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findGitProfileById } from "../../../people/services/people.service";
import { transformPerson } from "../../../people/resolvers/transformers/people.transformer";

export const pullRequestAuthorQuery = createFieldResolver("PullRequest", {
  author: async (pullRequest, _, context) => {
    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const gitProfile = await findGitProfileById({
      workspaceId: context.workspaceId,
      gitProfileId: pullRequest["authorId"],
    });

    if (!gitProfile) {
      throw new ResourceNotFoundException("Git Profile not found", {
        extra: {
          workspaceId: context.workspaceId,
          gitProfileId: pullRequest["authorId"],
        },
      });
    }

    return transformPerson(gitProfile);
  },
});
