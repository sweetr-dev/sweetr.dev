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

  input SendTestMessageInput {
    workspaceId: SweetID!
    app: IntegrationApp!
    channel: String!
  }

  extend type Workspace {
    integrations: [Integration!]!
  }

  type Mutation {
    installIntegration(input: InstallIntegrationInput!): Void
    removeIntegration(input: RemoveIntegrationInput!): Void
    sendTestMessage(input: SendTestMessageInput!): Void
      @rateLimit(
        window: "60s"
        max: 5
        message: "You got rate limited. You can send 5 test messages per minute."
      )
  }
`;
