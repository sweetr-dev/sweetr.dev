export default /* GraphQL */ `
  type Workspace {
    id: SweetID!
    name: String!
    handle: String!
    avatar: String
    "The git provider URL to uninstall the sweetr app"
    gitUninstallUrl: String!
  }

  type Query {
    userWorkspaces: [Workspace!]!
    workspace(workspaceId: SweetID!): Workspace!
    workspaceByInstallationId(gitInstallationId: String!): Workspace
  }
`;
