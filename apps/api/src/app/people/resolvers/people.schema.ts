export default /* GraphQL */ `
  type Person {
    id: SweetID!
    handle: String!
    name: String!
    avatar: String
    email: String
  }

  input PeopleQueryInput {
    "The ids to filter by."
    ids: [SweetID!]

    "The query to search by. Looks up by name, email and git handle."
    query: String

    "The pagination cursor."
    cursor: SweetID

    "The amount of records to return."
    limit: Int
  }

  extend type Workspace {
    me: Person
    person(handle: String!): Person
    people(input: PeopleQueryInput): [Person!]!
  }
`;
