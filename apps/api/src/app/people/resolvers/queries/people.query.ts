import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  findGitProfileByHandle,
  findGitProfileById,
  paginateGitProfiles,
} from "../../services/people.service";
import { transformPerson } from "../transformers/people.transformer";

export const peopleQuery = createFieldResolver("Workspace", {
  people: async (workspace, { input }) => {
    logger.info("query.people", { workspace, input });

    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const gitProfiles = await paginateGitProfiles(workspace.id, {
      gitProfileIds: input?.ids || undefined,
      cursor: input?.cursor || undefined,
      query: input?.query || undefined,
      limit: input?.limit || undefined,
    });

    return gitProfiles.map((gitProfile) => transformPerson(gitProfile));
  },
  person: async (workspace, { handle }) => {
    logger.info("query.person", { workspace, handle });

    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const gitProfile = await findGitProfileByHandle({
      workspaceId: workspace.id,
      handle,
    });

    if (!gitProfile) return null;

    return transformPerson(gitProfile);
  },
  me: async (workspace, _, context) => {
    logger.info("query.me", { workspace }, context);

    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const gitProfile = await findGitProfileById({
      workspaceId: workspace.id,
      gitProfileId: context.currentToken.gitProfileId,
    });

    if (!gitProfile) return null;

    return transformPerson(gitProfile);
  },
});
