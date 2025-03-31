import { findGitProfileById } from "../../../people/services/people.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { createFieldResolver } from "../../../../lib/graphql";
import { transformPerson } from "../../../people/resolvers/transformers/people.transformer";

export const apiKeyCreatorQuery = createFieldResolver("ApiKey", {
  creator: async (apiKey, _, context) => {
    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const gitProfile = await findGitProfileById({
      workspaceId: context.workspaceId,
      gitProfileId: apiKey["creatorId"],
    });

    if (!gitProfile) {
      throw new ResourceNotFoundException("Git Profile not found");
    }

    return transformPerson(gitProfile);
  },
});
