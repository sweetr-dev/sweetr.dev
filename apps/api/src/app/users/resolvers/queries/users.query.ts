import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { paginateWorkspaceUsers } from "../../services/users.service";
import { transformWorkspaceUser } from "../transformers/users.transformer";

export const usersQuery = createFieldResolver("Workspace", {
  users: async (workspace, { input }) => {
    logger.info("query.users", { workspace, input });

    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const gitProfiles = await paginateWorkspaceUsers(workspace.id, {
      cursor: input?.cursor || undefined,
      query: input?.query || undefined,
      limit: input?.limit || undefined,
    });

    return gitProfiles.map((gitProfile) => transformWorkspaceUser(gitProfile));
  },
});
