import { createQueryResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { AuthorizationException } from "../../../errors/exceptions/authorization.exception";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  findUserWorkspaces,
  findWorkspaceByGitInstallationId,
  findWorkspaceById,
} from "../../services/workspace.service";
import { transformWorkspace } from "../transformers/workspace.transformer";

export const workspaceQuery = createQueryResolver({
  workspace: async (_, input, context) => {
    logger.info("query.workspace", { input });

    const workspace = await findWorkspaceById(input.workspaceId);

    if (!workspace) {
      throw new ResourceNotFoundException("Workspace not found", {
        extra: { input },
      });
    }

    const membership = workspace.memberships.find(
      (membership) =>
        membership.gitProfileId == context.currentToken.gitProfileId
    );

    if (!membership) {
      throw new AuthorizationException();
    }

    context.workspaceId = workspace.id;

    return transformWorkspace(workspace);
  },
  workspaceByInstallationId: async (_, input, context) => {
    logger.info("query.workspaceByInstallationId", { input });

    const workspace = await findWorkspaceByGitInstallationId(
      input.gitInstallationId,
      {
        repositories: true,
        memberships: true,
      }
    );

    if (!workspace) return null;

    const membership = workspace.memberships.find(
      (membership) =>
        membership.gitProfileId == context.currentToken.gitProfileId
    );

    if (!membership) {
      return null;
    }

    return workspace ? transformWorkspace(workspace) : null;
  },
  userWorkspaces: async (_, __, context) => {
    logger.info("query.userWorkspaces", {
      gitProfileId: context.currentToken.gitProfileId,
    });

    const workspaces = await findUserWorkspaces(
      context.currentToken.gitProfileId
    );

    return workspaces.map((workspace) => transformWorkspace(workspace));
  },
});
