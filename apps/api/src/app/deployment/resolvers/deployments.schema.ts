export default /* GraphQL */ `
  type Deployment {
    id: SweetID!

    "The application that was deployed"
    application: Application!

    "The environment that the deployment was deployed to"
    environment: Environment!

    "The person who triggered the deployment"
    author: Person

    "The version of the deployment"
    version: String!

    "The description of the deployment"
    description: String

    "The time the deployment was triggered"
    deployedAt: DateTime!

    "The time the deployment was archived"
    archivedAt: DateTime
  }

  input DeploymentsQueryInput {
    "The ids to filter by"
    ids: [SweetID!]

    "The query to search by. Looks up by version and description."
    query: String

    "The pagination cursor"
    cursor: SweetID

    "The amount of records to return."
    limit: Int

    "The time range the deployment went live"
    deployedAt: DateTimeRange

    "The applications to filter by"
    applicationIds: [SweetID!]

    "The environments to filter by"
    environmentIds: [SweetID!]

    "Whether to only include archived deployments. Defaults to false."
    archivedOnly: Boolean
  }

  input ArchiveDeploymentInput {
    deploymentId: SweetID!
    workspaceId: SweetID!
  }

  input UnarchiveDeploymentInput {
    deploymentId: SweetID!
    workspaceId: SweetID!
  }

  extend type Application {
    "The last deployment of the application"
    lastProductionDeployment: Deployment
  }

  extend type Workspace {
    deployment(deploymentId: SweetID!): Deployment
    deployments(input: DeploymentsQueryInput!): [Deployment!]!
  }

  type Mutation {
    archiveDeployment(input: ArchiveDeploymentInput!): Deployment!
    unarchiveDeployment(input: UnarchiveDeploymentInput!): Deployment!
  }
`;
