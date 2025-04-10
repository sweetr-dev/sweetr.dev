import { addDelayedJob, addJobs } from "../../../bull-mq/queues";
import { SweetQueue } from "../../../bull-mq/queues";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import { CreateSyncBatchArgs, SyncBatchMetadata } from "./sync-batch.types";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { captureException } from "@sentry/node";
import { EmailTemplate } from "../../email/services/email-template.service";
import {
  hasSentEmail,
  enqueueEmail,
  markEmailAsSent,
} from "../../email/services/send-email.service";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { findWorkspaceUsers } from "../../workspaces/services/workspace.service";
import { redisConnection } from "../../../bull-mq/redis-connection";
import { UnknownException } from "../../errors/exceptions/unknown.exception";

export const scheduleSyncBatch = async ({
  workspaceId,
  scheduledAt,
  metadata,
}: CreateSyncBatchArgs) => {
  const sinceDaysAgo = 365; // TO-DO: Should be a workspace setting

  const syncBatch = await getPrisma(workspaceId).syncBatch.create({
    data: {
      workspaceId,
      sinceDaysAgo,
      scheduledAt,
      metadata,
    },
  });

  await setSyncBatchProgress(syncBatch.id);

  await addDelayedJob(scheduledAt, SweetQueue.SYNC_BATCH, {
    syncBatchId: syncBatch.id,
  });

  return syncBatch;
};

export const setSyncBatchProgress = async (syncBatchId: number) => {
  const key = `sync-batch:${syncBatchId}:sync`;
  const sevenDaysInSeconds = 60 * 60 * 24 * 7;

  await redisConnection
    .multi()
    .hset(key, { waiting: 0, done: 0 })
    .expire(key, sevenDaysInSeconds)
    .exec();
};

export const incrementSyncBatchProgress = async (
  syncBatchId: number,
  field: "waiting" | "done",
  amount: number
) => {
  const key = `sync-batch:${syncBatchId}:sync`;

  await redisConnection.hincrby(key, field, amount);
};

export const getSyncBatchProgress = async (syncBatchId: number) => {
  try {
    const progress = await redisConnection.hgetall(
      `sync-batch:${syncBatchId}:sync`
    );

    if (!progress || !("waiting" in progress))
      return {
        progress: 100,
        done: 0,
        waiting: 0,
      };

    const done = Number(progress.done);
    const waiting = Number(progress.waiting);

    // Avoid division by zero
    if (waiting === 0) {
      return {
        progress: 100,
        done,
        waiting,
      };
    }

    return {
      progress: Math.min(Math.round((done * 100) / waiting), 100),
      done,
      waiting,
    };
  } catch (error) {
    captureException(
      new UnknownException("Redis: Could not get workspace sync progress.", {
        originalError: error,
        severity: "warning",
      })
    );

    return {
      progress: 100,
      done: 0,
      waiting: 0,
    };
  }
};

export const startSyncBatch = async (syncBatchId: number) => {
  const syncBatch = await getBypassRlsPrisma().syncBatch.findUnique({
    where: { id: syncBatchId },
    include: {
      workspace: {
        include: {
          installation: true,
        },
      },
    },
  });

  const installation = syncBatch?.workspace?.installation;

  if (!installation) {
    throw new ResourceNotFoundException("Sync batch installation not found", {
      extra: { syncBatch, syncBatchId },
    });
  }

  await getPrisma(syncBatch.workspaceId).syncBatch.update({
    where: { id: syncBatchId },
    data: { startedAt: new Date() },
  });

  const metadata = syncBatch.metadata as SyncBatchMetadata;

  return addJobs(
    SweetQueue.GITHUB_SYNC_REPOSITORY_PULL_REQUESTS,
    metadata.repositories.map((repositoryName) => ({
      gitInstallationId: installation.gitInstallationId,
      repositoryName,
      sinceDaysAgo: syncBatch.sinceDaysAgo,
      syncBatchId,
      isOnboarding: metadata.isOnboarding,
    }))
  );
};

export const updateSyncBatch = async (syncBatchId: number) => {
  const { progress, done } = await getSyncBatchProgress(syncBatchId);

  const isFinished = progress >= 100;

  if (!isFinished) return;

  const syncBatch = await getBypassRlsPrisma().syncBatch.findUnique({
    where: { id: syncBatchId },
    include: {
      workspace: {
        include: {
          installation: true,
        },
      },
    },
  });

  const installation = syncBatch?.workspace?.installation;

  if (!installation) {
    throw new ResourceNotFoundException("Sync batch installation not found", {
      extra: { syncBatch, syncBatchId },
    });
  }

  const metadata = syncBatch.metadata as SyncBatchMetadata;
  await getPrisma(syncBatch.workspaceId).syncBatch.update({
    where: { id: syncBatchId },
    data: {
      finishedAt: isFinished ? new Date() : null,
      metadata: {
        ...(syncBatch.metadata as SyncBatchMetadata),
        isOnboarding: false,
        pullRequestsSynced: done,
      },
    },
  });

  if (metadata.isOnboarding) {
    await sendSyncCompleteEmail(syncBatch.workspaceId);
  }
};

const sendSyncCompleteEmail = async (workspaceId: number) => {
  const emailTemplate: EmailTemplate = "InitialSyncCompleteEmail";
  const emailKey = `workspace:${workspaceId}:email:${emailTemplate}`;

  const isDuplicateEmail = await hasSentEmail(emailKey);
  if (isDuplicateEmail) return;

  const members = await findWorkspaceUsers(workspaceId);

  if (!members.length) {
    captureException(
      new BusinessRuleException(
        "Attempted to send sync complete email to workspace with no members.",
        {
          extra: {
            workspaceId,
          },
        }
      )
    );

    return;
  }

  for (const member of members) {
    if (!member.user) continue;

    await enqueueEmail({
      to: member.user.email,
      subject: "Sync complete.",
      template: {
        type: emailTemplate,
        props: {
          username: member.name,
        },
      },
    });
  }

  const oneDayInSeconds = 60 * 60 * 24;
  await markEmailAsSent(emailKey, oneDayInSeconds);
};

export const findOnboardingSyncBatch = async (workspaceId: number) => {
  const syncBatch = await getPrisma(workspaceId).syncBatch.findFirst({
    where: {
      workspaceId,
      metadata: {
        path: ["isOnboarding"],
        equals: true,
      },
    },
    orderBy: {
      scheduledAt: "desc",
    },
  });

  return syncBatch;
};
