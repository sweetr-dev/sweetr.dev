export default /* GraphQL */ `
  type ApiKey {
    id: SweetID!
    name: String!
    createdAt: DateTime!
    lastUsedAt: DateTime
    creator: Person!
  }

  input RegenerateApiKeyInput {
    workspaceId: SweetID!
  }

  type Mutation {
    regenerateApiKey(input: RegenerateApiKeyInput!): String!
  }

  extend type Workspace {
    apiKey: ApiKey
  }
`;
