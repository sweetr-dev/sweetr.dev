import { createFieldResolver } from "../../../../lib/graphql";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findGitProfileById } from "../../../people/services/people.service";
import { transformPerson } from "../../../people/resolvers/transformers/people.transformer";

export const codeReviewAuthorQuery = createFieldResolver("CodeReview", {
  author: async (codeReview, _, context) => {
    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const gitProfile = await findGitProfileById({
      workspaceId: context.workspaceId,
      gitProfileId: codeReview["authorId"],
    });

    if (!gitProfile) {
      throw new ResourceNotFoundException("Git Profile not found");
    }

    return transformPerson(gitProfile);
  },
});
