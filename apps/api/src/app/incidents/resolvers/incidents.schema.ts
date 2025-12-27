export default /* GraphQL */ `
  type Incident {
    id: SweetID!

    "The team responsible for handling the incident"
    team: Team

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
    applicationIds: [SweetID!]

    "The environments to filter by"
    environmentIds: [SweetID!]

    "The pagination cursor"
    cursor: SweetID

    "The pagination limit"
    limit: Int

    "Whether to only include archived incidents. Defaults to false."
    archivedOnly: Boolean
  }

  input UpsertIncidentInput {
    "The workspace id"
    workspaceId: SweetID!

    "The incident id, specify when updating an existing incident."
    incidentId: SweetID

    "The team responsible for handling the incident"
    teamId: SweetID

    "The incident leader"
    leaderId: SweetID

    "The time the incident was detected"
    detectedAt: DateTime!

    "The time the incident was resolved"
    resolvedAt: DateTime

    "The deployment that caused the incident"
    causeDeploymentId: SweetID!

    "The deployment that fixed the incident"
    fixDeploymentId: SweetID

    "The url to the postmortem"
    postmortemUrl: String
  }

  input ArchiveIncidentInput {
    incidentId: SweetID!
    workspaceId: SweetID!
  }

  input UnarchiveIncidentInput {
    incidentId: SweetID!
    workspaceId: SweetID!
  }

  type Mutation {
    upsertIncident(input: UpsertIncidentInput!): Incident!
    archiveIncident(input: ArchiveIncidentInput!): Incident!
    unarchiveIncident(input: UnarchiveIncidentInput!): Incident!
  }

  extend type Workspace {
    incident(incidentId: SweetID!): Incident
    incidents(input: IncidentsQueryInput!): [Incident!]!
  }
`;
