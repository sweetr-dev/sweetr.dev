export default /* GraphQL */ `
  enum AutomationSlug {
    LABEL_PR_SIZE
  }

  enum AutomationScope {
    WORKSPACE
    TEAM
    REPOSITORY
  }

  type Automation {
    slug: AutomationSlug!
    scope: AutomationScope!
    enabled: Boolean!
    title: String!
    description: String!
    shortDescription: String!
    demoUrl: String!
    color: String!
    icon: String!
    benefits: AutomationBenefits
    docsUrl: String

    # TO-DO: Support overrides once repository settings is launched
    overrides: [Automation!]!
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
    slug: AutomationSlug!
  }

  input UpdateAutomationInput {
    workspaceId: SweetID!
    slug: AutomationSlug!
    enabled: Boolean!
  }
`;
