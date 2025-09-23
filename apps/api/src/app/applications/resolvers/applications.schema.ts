export default /* GraphQL */ `
  type DeploymentSettings {
    "The trigger for the deployment"
    trigger: DeploymentSettingsTrigger!

    "The subdirectory of the application. Useful for monorepos."
    subdirectory: String
  }

  "The trigger for the deployment."
  enum DeploymentSettingsTrigger {
    WEBHOOK
    MERGE
    GIT_DEPLOYMENT
  }

  type Application {
    "The id of the application"
    id: SweetID!

    "The name of the application"
    name: String!

    "The description of the application"
    description: String

    "The repository that the application is in"
    repository: Repository!

    "The deployment settings for the application"
    deploymentSettings: DeploymentSettings!

    "The time the application was archived"
    archivedAt: DateTime
  }

  input ApplicationsQueryInput {
    "The ids to filter by"
    ids: [SweetID!]

    "The query to search by. Looks up by name."
    query: String

    "The pagination cursor"
    cursor: SweetID

    "The teams to filter by"
    teamIds: [SweetID!]

    "The amount of records to return."
    limit: Int
  }

  input DeploymentSettingsInput {
    "The trigger for the deployment"
    trigger: DeploymentSettingsTrigger!

    "The subdirectory of the application. Useful for monorepos."
    subdirectory: String
  }

  input UpsertApplicationInput {
    "The application id, specify when updating an existing application."
    applicationId: SweetID

    "The team id, specify when updating an existing team."
    teamId: SweetID

    "The workspace id"
    workspaceId: SweetID!

    "The name of the application"
    name: String!

    "The description of the application"
    description: String

    "The repository id"
    repositoryId: SweetID!

    "The deployment settings for the application"
    deploymentSettings: DeploymentSettingsInput!
  }

  extend type Deployment {
    application: Application!
  }

  extend type Workspace {
    application(applicationId: SweetID!): Application
    applications(input: ApplicationsQueryInput!): [Application!]!
  }

  type Mutation {
    upsertApplication(input: UpsertApplicationInput!): Application!
  }
`;
