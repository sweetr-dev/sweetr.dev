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
  }

  extend type Workspace {
    billing: Billing
  }

  input LoginToStripeInput {
    workspaceId: SweetID!
  }

  type Mutation {
    loginToStripe(input: LoginToStripeInput!): String
  }
`;
