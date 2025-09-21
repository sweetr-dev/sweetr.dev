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
`;
