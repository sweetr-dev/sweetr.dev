import { UserWorkspacesQuery } from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "../api/clients/query-client";
import { userWorkspacesQuery } from "../api/workspaces.api";
import { WorkspaceNotFound } from "../exceptions/workspace-not-found.exception";
import { WorkspaceData, useAppStore } from "./app.provider";

export const useWorkspace = (): { workspace: WorkspaceData } => {
  const { workspace } = useAppStore();

  if (!workspace) {
    throw new WorkspaceNotFound();
  }

  return { workspace };
};

export const loadUserWithWorkspaces = async () => {
  const query = userWorkspacesQuery({});

  const response =
    queryClient.getQueryData<UserWorkspacesQuery>(query.queryKey) ??
    (await queryClient.fetchQuery(query));

  const availableWorkspaces = response.userWorkspaces;
  useAppStore.setState({ availableWorkspaces });

  if (availableWorkspaces.length === 0) return;

  const activeWorkspace = getActiveWorkspace(availableWorkspaces);

  if (activeWorkspace?.me) {
    useAppStore.setState({
      workspace: activeWorkspace,
      authenticatedUser: activeWorkspace.me,
    });
  }
};

const getActiveWorkspace = <T extends { id: string }>(workspaces: T[]) => {
  const activeWorkspaceId = useAppStore.getState().workspace?.id;
  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ||
    workspaces.at(0);

  return activeWorkspace;
};
