import type { PullRequest } from "@prisma/client";
import { BulkJobOptions, JobsOptions, Queue } from "bullmq";
import type Stripe from "stripe";
import { z } from "zod";
import type { AlertWithRelations } from "../app/alerts/services/alert.types";
import type { DigestWithRelations } from "../app/digests/services/digest.types";
import type { BuildEmailTemplate } from "../app/email/services/email-template.service";
import type { SendEmailPayload } from "../app/email/services/send-email.service";
import { logger } from "../lib/logger";
import { bullMQErrorHandler } from "./error-handler";
import { redisConnection } from "./redis-connection";

// ============================================================================
// SweetQueues - Queue configuration with Zod schemas for type-safe job payloads
// ============================================================================

export const SweetQueues = {
  // System
  SEND_EMAIL: {
    name: "{system.send_email}",
    schema: z.object({
      template: z.custom<BuildEmailTemplate>(),
      payload: z.custom<SendEmailPayload>(),
    }),
  },

  // Crons
  CRON_GITHUB_RETRY_FAILED_WEBHOOKS: {
    name: "{cron.github.retry_failed_webhooks}",
    schema: z.null(),
  },
  CRON_STRIPE_UPDATE_SEATS: {
    name: "{cron.stripe.update_seats}",
    schema: z.null(),
  },
  CRON_SCHEDULE_DIGESTS: {
    name: "{cron.schedule_digests}",
    schema: z.null(),
  },
  CRON_SCHEDULE_ALERTS: {
    name: "{cron.schedule_alerts}",
    schema: z.null(),
  },

  // GitHub - Installation
  GITHUB_INSTALLATION_SYNC: {
    name: "{github.installation.sync}",
    schema: z.object({
      installation: z.object({ id: z.number() }),
      sender: z.object({
        id: z.number(),
        node_id: z.string(),
        login: z.string(),
        avatar_url: z.string(),
      }),
    }),
  },
  GITHUB_INSTALLATION_CONFIG_SYNC: {
    name: "{github.installation.config.sync}",
    schema: z.object({
      installation: z.object({ id: z.number() }),
    }),
  },
  GITHUB_MEMBERS_SYNC: {
    name: "{github.members.sync}",
    schema: z.object({
      installation: z.object({ id: z.number() }).optional(),
      organization: z.object({ login: z.string() }),
    }),
  },
  GITHUB_REPOSITORIES_SYNC: {
    name: "{github.repositories.sync}",
    schema: z.object({
      installation: z.object({ id: z.number() }).optional(),
      repositories_added: z.array(z.object({ name: z.string() })).optional(),
    }),
  },
  GITHUB_OAUTH_REVOKED: {
    name: "{github.oauth.revoked}",
    schema: z.object({
      sender: z.object({ node_id: z.string() }),
    }),
  },
  GITHUB_INSTALLATION_DELETED: {
    name: "{github.installation.deleted}",
    schema: z.object({
      installation: z.object({ id: z.number() }),
    }),
  },

  // GitHub - Sync
  GITHUB_SYNC_PULL_REQUEST: {
    name: "{github.sync.pull_request}",
    schema: z.object({
      installation: z.object({ id: z.number() }).optional(),
      pull_request: z.object({
        node_id: z.string(),
        number: z.number(),
        title: z.string(),
        merge_commit_sha: z.string().nullable(),
        labels: z.array(z.object({ name: z.string() })),
        head: z.object({ sha: z.string() }),
        base: z.object({
          repo: z.object({
            node_id: z.string(),
            name: z.string(),
            owner: z.object({ login: z.string() }),
          }),
        }),
      }),
      syncReviews: z.boolean().optional(),
      syncBatchId: z.number().optional(),
    }),
  },
  GITHUB_SYNC_CODE_REVIEW: {
    name: "{github.sync.code_review}",
    schema: z.object({
      installation: z.object({ id: z.number() }).optional(),
      pull_request: z.object({ node_id: z.string() }),
    }),
  },
  GITHUB_SYNC_REPOSITORY_PULL_REQUESTS: {
    name: "{github.sync.repository.pull_requests}",
    schema: z.object({
      gitInstallationId: z.number(),
      repositoryName: z.string(),
      sinceDaysAgo: z.number(),
      syncBatchId: z.number(),
      isOnboarding: z.boolean(),
    }),
  },

  // Sync Batch
  SYNC_BATCH: {
    name: "{sync.batch}",
    schema: z.object({
      syncBatchId: z.number(),
    }),
  },

  // Stripe
  STRIPE_SUBSCRIPTION_UPDATED: {
    name: "{stripe.subscription.updated}",
    schema: z.custom<
      | Stripe.CustomerSubscriptionCreatedEvent.Data
      | Stripe.CustomerSubscriptionUpdatedEvent.Data
      | Stripe.CustomerSubscriptionDeletedEvent.Data
    >(),
  },

  // Slack
  SLACK_APP_UNINSTALLED: {
    name: "{slack.app.uninstalled}",
    schema: z.object({
      team_id: z.string(),
    }),
  },

  // Automations
  AUTOMATION_PR_TITLE_CHECK: {
    name: "{automation.pr_title_check}",
    schema: z.object({
      installation: z.object({ id: z.number() }).optional(),
      pull_request: z.object({
        node_id: z.string(),
        number: z.number(),
        title: z.string(),
        merge_commit_sha: z.string().nullable(),
        labels: z.array(z.object({ name: z.string() })),
        head: z.object({ sha: z.string() }),
        base: z.object({
          repo: z.object({
            node_id: z.string(),
            name: z.string(),
            owner: z.object({ login: z.string() }),
          }),
        }),
      }),
    }),
  },
  AUTOMATION_PR_SIZE_LABELER: {
    name: "{automation.pr_size_labeler}",
    schema: z.object({
      installation: z.object({ id: z.number() }).optional(),
      pull_request: z.object({
        node_id: z.string(),
        number: z.number(),
        title: z.string(),
        merge_commit_sha: z.string().nullable(),
        labels: z.array(z.object({ name: z.string() })),
        head: z.object({ sha: z.string() }),
        base: z.object({
          repo: z.object({
            node_id: z.string(),
            name: z.string(),
            owner: z.object({ login: z.string() }),
          }),
        }),
      }),
    }),
  },

  // Alerts
  ALERT_MERGED_WITHOUT_APPROVAL: {
    name: "{alert.merged_without_approval}",
    schema: z.object({
      installation: z.object({ id: z.number() }).optional(),
      pull_request: z.object({ node_id: z.string() }),
    }),
  },
  ALERT_SLOW_MERGE: {
    name: "{alert.slow_merge}",
    schema: z.custom<AlertWithRelations<"SLOW_MERGE">>(),
  },
  ALERT_SLOW_REVIEW: {
    name: "{alert.slow_review}",
    schema: z.custom<AlertWithRelations<"SLOW_REVIEW">>(),
  },

  // Digests
  DIGEST_SEND: {
    name: "{digest.send}",
    schema: z.custom<DigestWithRelations>(),
  },

  // Deployments
  DEPLOYMENT_TRIGGERED_BY_API: {
    name: "{deployment.triggered_by.api}",
    schema: z.object({
      workspaceId: z.number(),
      deployedAt: z.coerce.date(),
      repositoryFullName: z.string(),
      environment: z.string(),
      app: z.string(),
      version: z.string(),
      commitHash: z.string(),
      description: z.string().optional(),
      author: z.string().optional(),
      monorepoPath: z.string().optional(),
    }),
  },
  DEPLOYMENT_TRIGGERED_BY_PULL_REQUEST_MERGE: {
    name: "{deployment.triggered_by.pull_request_merge}",
    schema: z.custom<{
      workspaceId: number;
      pullRequest: PullRequest;
      installationId: number;
    }>(),
  },
  DEPLOYMENT_AUTO_LINK_PULL_REQUESTS: {
    name: "{deployment.auto_link_pull_requests}",
    schema: z.object({
      deploymentId: z.number(),
      workspaceId: z.number(),
    }),
  },

  // SaaS
  SAAS_NOTIFY_NEW_INSTALLATION: {
    name: "{saas.notify_new_installation}",
    schema: z.object({
      installationId: z.number(),
    }),
  },
} as const;

// ============================================================================
// Type utilities
// ============================================================================

export type SweetQueueName = keyof typeof SweetQueues;
export type SweetQueueConfig = (typeof SweetQueues)[SweetQueueName];

/** Get the payload type for a specific queue */
export type QueuePayload<Q extends SweetQueueName> = z.infer<
  (typeof SweetQueues)[Q]["schema"]
>;

/** Get the queue name string for a specific queue */
export type QueueNameString<Q extends SweetQueueName> =
  (typeof SweetQueues)[Q]["name"];

// Helper to get all queue name strings for Queue initialization
type AllQueueNames = (typeof SweetQueues)[SweetQueueName]["name"];

// ============================================================================
// Job Priority
// ============================================================================

export enum JobPriority {
  LOW = 50,
  NORMAL = 25,
  HIGH = 1,
}

// ============================================================================
// Initialize Queues
// ============================================================================

export const queues: Record<AllQueueNames, Queue> = (() => {
  const queueMap: Record<string, Queue> = {};

  for (const queueConfig of Object.values(SweetQueues)) {
    const queue = new Queue(queueConfig.name, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 60000, // 60 seconds
        },
      },
    });

    queue.on("error", bullMQErrorHandler);

    queueMap[queueConfig.name] = queue;

    logger.info(`🐂🧵 BullMQ: Queue ${queueConfig.name} initialized.`);
  }

  return queueMap as Record<AllQueueNames, Queue>;
})();

// ============================================================================
// Job functions - Type-safe!
// ============================================================================

export const addJob = async <Q extends SweetQueueName>(
  queueName: Q,
  data: QueuePayload<Q>,
  options?: JobsOptions
) => {
  const queueConfig = SweetQueues[queueName];

  logger.info(`🐂✉️ BullMQ: Adding job to ${queueConfig.name}`);

  const queue = queues[queueConfig.name];

  return queue.add(`${queue.name}-job`, data, options);
};

export const addDelayedJob = async <Q extends SweetQueueName>(
  date: Date,
  queueName: Q,
  data: QueuePayload<Q>,
  options?: JobsOptions
) => {
  const queueConfig = SweetQueues[queueName];

  logger.info(`🐂📅 BullMQ: Adding delayed job to ${queueConfig.name}`);

  const queue = queues[queueConfig.name];

  return queue.add(`${queue.name}-job`, data, {
    delay: date.getTime() - Date.now(),
    ...options,
  });
};

export const addJobs = async <Q extends SweetQueueName>(
  queueName: Q,
  data: QueuePayload<Q>[],
  options?: BulkJobOptions
) => {
  const queueConfig = SweetQueues[queueName];

  logger.info(`🐂✉️ BullMQ: Adding ${data.length} jobs to ${queueConfig.name}`);

  const queue = queues[queueConfig.name];

  return queue.addBulk(
    data.map((d) => ({ name: `${queue.name}-job`, data: d, opts: options }))
  );
};
