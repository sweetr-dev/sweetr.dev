export default /* GraphQL */ `
  type Incident {
    id: SweetID!

    "The team responsible for handling the incident"
    team: Team!

    "The incident leader"
    leader: Person

    "The time the incident was detected"
    detectedAt: DateTime!

    "The time the incident was resolved"
    resolvedAt: DateTime

    "The deployment that caused the incident"
    causeDeployment: Deployment!

    "The deployment that fixed the incident"
    fixDeployment: Deployment

    "The url to the postmortem"
    postmortemUrl: String

    "The time the incident was archived"
    archivedAt: DateTime
  }

  input IncidentsQueryInput {
    "The time range the incident was detected in"
    detectedAt: DateTimeRange

    "The applications to filter by"
    applicationIds: [SweetID!]!

    "The environments to filter by"
    environmentIds: [SweetID!]!

    "The pagination cursor"
    cursor: SweetID

    "The pagination limit"
    limit: Int
  }

  extend type Workspace {
    incidents(input: IncidentsQueryInput!): [Incident!]!
  }
`;
