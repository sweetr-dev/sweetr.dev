export default /* GraphQL */ `
  extend type Workspace {
    settings: WorkspaceSettings!
  }

  type WorkspaceSettings {
    pullRequest: WorkspaceSettingsPullRequest!
    auth: WorkspaceSettingsAuth!
  }

  type WorkspaceSettingsAuth {
    loginPolicy: LoginPolicy!
  }

  enum LoginPolicy {
    WHOLE_ORG
    ONLY_ADMINS
  }

  type WorkspaceSettingsPullRequest {
    size: WorkspaceSettingsPullRequestSize!
  }

  type WorkspaceSettingsPullRequestSize {
    tiny: Int!
    small: Int!
    medium: Int!
    large: Int!
    ignorePatterns: [String!]!
  }

  type Mutation {
    updateWorkspaceSettings(input: UpdateWorkspaceSettingsInput!): Workspace!
  }

  input UpdateWorkspaceSettingsInput {
    workspaceId: SweetID!
    settings: WorkspaceSettingsInput!
  }

  input WorkspaceSettingsInput {
    pullRequest: WorkspaceSettingsPullRequestInput
    auth: WorkspaceSettingsAuthInput
  }

  input WorkspaceSettingsAuthInput {
    loginPolicy: LoginPolicy
  }

  input WorkspaceSettingsPullRequestInput {
    size: WorkspaceSettingsPullRequestSizeInput
  }

  input WorkspaceSettingsPullRequestSizeInput {
    tiny: Int
    small: Int
    medium: Int
    large: Int
    ignorePatterns: [String!]
  }
`;
