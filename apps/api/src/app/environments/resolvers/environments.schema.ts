export default /* GraphQL */ `
  type Environment {
    id: SweetID!

    "The name of the environment"
    name: String!

    "Whether the environment is production"
    isProduction: Boolean!

    "The time the environment was archived"
    archivedAt: DateTime
  }

  input EnvironmentsQueryInput {
    "The ids to filter by"
    ids: [SweetID!]

    "The query to search by. Looks up by name."
    query: String

    "The amount of records to return."
    limit: Int

    "The pagination cursor"
    cursor: SweetID
  }

  extend type Workspace {
    environments(input: EnvironmentsQueryInput!): [Environment!]!
  }
`;
