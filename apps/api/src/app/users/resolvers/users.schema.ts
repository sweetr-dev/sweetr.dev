export default /* GraphQL */ `
  type WorkspaceUser {
    id: SweetID!
    handle: String!
    name: String!
    avatar: String
    role: String
    lastLoginAt: DateTime
  }

  input WorkspaceUsersQueryInput {
    "The query to search by. Looks up by name and git handle."
    query: String

    "The pagination cursor."
    cursor: SweetID

    "The amount of records to return."
    limit: Int
  }

  extend type Workspace {
    users(input: WorkspaceUsersQueryInput): [WorkspaceUser!]!
  }
`;
