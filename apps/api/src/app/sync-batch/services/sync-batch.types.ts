import { Prisma, SyncBatch as DbSyncBatch, GitProvider } from "@prisma/client";

export type SyncBatchMetadata = {
  repositories: string[];
  isOnboarding: boolean;
  gitProvider: GitProvider;
};

export interface CreateSyncBatchArgs {
  workspaceId: number;
  scheduledAt: Date;
  metadata: Prisma.InputJsonValue;
}
