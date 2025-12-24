export default /* GraphQL */ `
  extend type Workspace {
    lastSyncBatch: SyncBatch
  }

  type SyncBatch {
    "The id of the sync batch"
    id: SweetID!

    "The date and time the sync batch was scheduled for"
    scheduledAt: DateTime!

    "The date and time the sync batch was finished"
    finishedAt: DateTime

    "How far back to re-sync data from"
    sinceDaysAgo: Int!

    "A number between 0 and 100 representing the progress of the sync batch"
    progress: Int!
  }

  type Mutation {
    scheduleSyncBatch(input: ScheduleSyncBatchInput!): SyncBatch!
  }

  input ScheduleSyncBatchInput {
    "The workspace id"
    workspaceId: SweetID!

    "How far back to re-sync data from"
    sinceDaysAgo: Int!
  }
`;
