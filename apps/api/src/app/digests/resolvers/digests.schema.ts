export default /* GraphQL */ `
  enum DigestType {
    TEAM_METRICS
    TEAM_WIP
  }

  enum Frequency {
    WEEKLY
    MONTHLY
  }

  enum DayOfTheWeek {
    SUNDAY
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    SATURDAY
  }

  type Digest {
    type: DigestType!
    enabled: Boolean!
    channel: String!
    frequency: Frequency!
    dayOfTheWeek: [DayOfTheWeek!]!
    timeOfDay: String!
    timezone: TimeZone!
    settings: JSONObject!
  }

  extend type Team {
    digests: [Digest!]!
    digest(input: DigestQueryInput!): Digest
  }

  extend type Mutation {
    updateDigest(input: UpdateDigestInput!): Digest!
  }

  input DigestQueryInput {
    type: DigestType!
  }

  input UpdateDigestInput {
    workspaceId: SweetID!
    teamId: SweetID!
    type: DigestType!
    enabled: Boolean!
    channel: String!
    frequency: Frequency!
    dayOfTheWeek: [DayOfTheWeek!]!
    timeOfDay: String!
    timezone: TimeZone!
    settings: JSONObject!
  }
`;
