export default /* GraphQL */ `
  type Trial {
    endAt: DateTime!
  }

  type Subscription {
    isActive: Boolean!
  }

  type PlanKeys {
    monthly: String!
    yearly: String!
  }

  type PurchasablePlans {
    cloud: PlanKeys!
  }

  type Billing {
    trial: Trial
    subscription: Subscription
    purchasablePlans: PurchasablePlans
    "The number of contributors the workspace had in the last 30 days"
    estimatedSeats: Int!
  }

  extend type Workspace {
    billing: Billing

    "Whether the workspace should have access to the dashboard"
    isActiveCustomer: Boolean!
  }

  input LoginToStripeInput {
    workspaceId: SweetID!
  }

  type Mutation {
    loginToStripe(input: LoginToStripeInput!): String
  }
`;
