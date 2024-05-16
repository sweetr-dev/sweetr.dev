export default /* GraphQL */ `
  enum TeamMemberRole {
    MANAGER
    ENGINEER
    DESIGNER
    PRODUCT
    QA
    LEADER
  }

  type Team {
    id: SweetID!
    name: String!
    description: String
    icon: String!
    startColor: String!
    endColor: String!
    members: [TeamMember!]!
    # The timestamp this team was archived
    archivedAt: DateTime
  }

  type TeamMember {
    id: SweetID!
    team: Team!
    person: Person!
    role: TeamMemberRole!
  }

  input UpsertTeamMemberInput {
    personId: SweetID!
    role: TeamMemberRole!
  }

  input UpsertTeamInput {
    "The team id, specify when updating an existing team."
    teamId: SweetID

    workspaceId: SweetID!
    name: String!
    description: String
    icon: String!
    startColor: String!
    endColor: String!
    members: [UpsertTeamMemberInput!]!
  }

  input ArchiveTeamInput {
    teamId: SweetID!
    workspaceId: SweetID!
  }

  input UnarchiveTeamInput {
    teamId: SweetID!
    workspaceId: SweetID!
  }

  input TeamsQueryInput {
    "The query to search by. Looks up by name."
    query: String

    "The amount of records to return."
    limit: Int
  }

  extend type Workspace {
    team(teamId: SweetID!): Team
    teams(input: TeamsQueryInput): [Team!]!
  }

  extend type Person {
    teamMemberships: [TeamMember!]!
    teammates: [TeamMember!]!
  }

  type Mutation {
    upsertTeam(input: UpsertTeamInput!): Team!
    archiveTeam(input: ArchiveTeamInput!): Team!
    unarchiveTeam(input: UnarchiveTeamInput!): Team!
  }
`;
