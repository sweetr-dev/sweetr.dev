export default /* GraphQL */ `
  type Repository {
    id: SweetID!
    name: String!
    fullName: String!
  }

  input RepositoriesQueryInput {
    "The query to search by. Looks up by name."
    query: String

    "The pagination cursor."
    cursor: SweetID

    "The amount of records to return."
    limit: Int
  }

  extend type Workspace {
    repositories(input: RepositoriesQueryInput): [Repository!]!
  }
`;
