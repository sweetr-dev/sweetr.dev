export default /* GraphQL */ `
  enum DigestType {
    TEAM_METRICS
    TEAM_WIP
  }

  enum Frequency {
    WEEKLY
    MONTHLY
  }

  type Digest {
    type: DigestType!
    enabled: Boolean!
    frequency: Frequency!
    dayOfTheWeek: Int!
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
    frequency: Frequency!
    dayOfTheWeek: Int!
    timezone: TimeZone!
    settings: JSONObject!
  }
`;
