export default /* GraphQL */ `
  enum AlertType {
    SLOW_REVIEW
    SLOW_MERGE
    MERGED_WITHOUT_APPROVAL
    HOT_PR
    UNRELEASED_CHANGES
  }

  type Alert {
    type: AlertType!
    enabled: Boolean!
    channel: String!
    settings: JSONObject!
  }

  extend type Team {
    alerts: [Alert!]!
    alert(input: AlertQueryInput!): Alert
  }

  type Mutation {
    updateAlert(input: UpdateAlertInput!): Alert!
  }

  input AlertQueryInput {
    type: AlertType!
  }

  input UpdateAlertInput {
    workspaceId: SweetID!
    teamId: SweetID!
    type: AlertType!
    enabled: Boolean!
    channel: String!
    settings: JSONObject!
  }
`;
