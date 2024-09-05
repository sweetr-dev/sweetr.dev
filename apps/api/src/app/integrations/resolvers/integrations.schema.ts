export default /* GraphQL */ `
  enum IntegrationApp {
    SLACK
  }

  type Integration {
    app: IntegrationApp!
    isEnabled: Boolean!
    installUrl: String
    enabledAt: DateTime
    target: String
  }

  input InstallIntegrationInput {
    workspaceId: SweetID!
    app: IntegrationApp!
    code: String!
    state: String!
  }

  input RemoveIntegrationInput {
    workspaceId: SweetID!
    app: IntegrationApp!
  }

  extend type Workspace {
    integrations: [Integration!]!
  }

  type Mutation {
    installIntegration(input: InstallIntegrationInput!): Void
    removeIntegration(input: RemoveIntegrationInput!): Void
  }
`;
