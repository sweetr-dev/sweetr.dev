import { GitProfile, User, WorkspaceMembership } from "@prisma/client";
import { WorkspaceUser } from "../../../../graphql-types";

export const transformWorkspaceUser = (
  person: GitProfile & {
    user?: User | null;
    workspaceMemberships: Pick<WorkspaceMembership, "role">[];
  }
): WorkspaceUser => {
  return {
    id: person.id,
    handle: person.handle,
    name: person.name,
    avatar: person.avatar,
    role: person.workspaceMemberships[0]?.role ?? null,
    lastLoginAt: person.user?.lastLoginAt?.toISOString() ?? null,
  };
};
