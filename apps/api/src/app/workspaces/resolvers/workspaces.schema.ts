export default /* GraphQL */ `
  type Workspace {
    id: SweetID!
    name: String!
    handle: String!
    avatar: String

    "The git provider URL to uninstall the sweetr app"
    gitUninstallUrl: String!

    "A number between 0 and 100 representing the progress of the initial data synchronization with the git provider"
    initialSyncProgress: Int!
  }

  type Query {
    userWorkspaces: [Workspace!]!
    workspace(workspaceId: SweetID!): Workspace!
    workspaceByInstallationId(gitInstallationId: String!): Workspace
  }
`;
