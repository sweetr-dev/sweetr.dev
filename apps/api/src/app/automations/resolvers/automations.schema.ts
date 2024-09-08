export default /* GraphQL */ `
  enum AutomationType {
    PR_TITLE_CHECK
  }

  type Automation {
    type: AutomationType!
    enabled: Boolean!
    settings: JSONObject
  }

  type AutomationBenefits {
    techDebt: String
    failureRate: String
    security: String
    cycleTime: String
    compliance: String
  }

  extend type Mutation {
    updateAutomation(input: UpdateAutomationInput!): Automation!
  }

  extend type Workspace {
    automations: [Automation!]!
    automation(input: AutomationQueryInput!): Automation
  }

  input AutomationQueryInput {
    type: AutomationType!
  }

  input UpdateAutomationInput {
    workspaceId: SweetID!
    type: AutomationType!
    enabled: Boolean!
    settings: JSONObject
  }
`;
