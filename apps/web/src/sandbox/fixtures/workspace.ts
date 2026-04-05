import type {
  UserWorkspacesQuery,
  WorkspaceSyncProgressQuery,
} from "@sweetr/graphql-types/frontend/graphql";

export const userWorkspacesFixture = {
  userWorkspaces: [
    {
      __typename: "Workspace" as const,
      id: "1",
      name: "Sweetr",
      handle: "sweetr-dev",
      avatar: "https://avatars.githubusercontent.com/u/133215400?v=4",
      gitUninstallUrl:
        "https://github.com/settings/installations/1",
      isActiveCustomer: true,
      me: {
        __typename: "Person" as const,
        id: "1",
        handle: "guest",
        name: "Guest User",
        avatar: "https://ui-avatars.com/api/?name=Guest+User&background=845ef7&color=fff",
        email: "guest@example.com",
      },
      featureAdoption: {
        __typename: "WorkspaceFeatureAdoption" as const,
        lastDeploymentCreatedAt: null,
      },
      billing: {
        __typename: "Billing" as const,
        trial: null,
        subscription: null,
      },
    },
  ],
} satisfies UserWorkspacesQuery;

export const syncProgressFixture = {
  workspace: {
    __typename: "Workspace" as const,
    initialSyncProgress: 100,
  },
} satisfies WorkspaceSyncProgressQuery;
