export default /* GraphQL */ `
  extend type Workspace {
    settings: WorkspaceSettings!
  }

  type WorkspaceSettings {
    pullRequest: WorkspaceSettingsPullRequest!
  }

  type WorkspaceSettingsPullRequest {
    size: WorkspaceSettingsPullRequestSize!
  }

  type WorkspaceSettingsPullRequestSize {
    tiny: Int
    small: Int
    medium: Int
    large: Int
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
  }

  input WorkspaceSettingsPullRequestInput {
    size: WorkspaceSettingsPullRequestSizeInput
  }

  input WorkspaceSettingsPullRequestSizeInput {
    tiny: Int
    small: Int
    medium: Int
    large: Int
  }
`;
