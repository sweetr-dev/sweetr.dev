import { getPrisma } from "../prisma";
import { AuthorizationException } from "./errors/exceptions/authorization.exception";

export const authorizeWorkspaceOrThrow = async ({
  workspaceId,
  gitProfileId,
}: {
  workspaceId: number;
  gitProfileId: number;
}) => {
  const membership = await getPrisma(workspaceId).workspaceMembership.findFirst(
    {
      where: {
        workspaceId,
        gitProfileId: gitProfileId,
      },
    }
  );

  if (!membership) {
    throw new AuthorizationException();
  }
};
