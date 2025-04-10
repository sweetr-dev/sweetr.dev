import { BulkJobOptions, JobsOptions, Queue } from "bullmq";
import { redisConnection } from "./redis-connection";
import { logger } from "../lib/logger";
import { bullMQErrorHandler } from "./error-handler";

export enum SweetQueue {
  // System
  SEND_EMAIL = "{system.send_email}",

  // Crons - https://docs.bullmq.io/guide/jobs/repeatable
  CRON_GITHUB_RETRY_FAILED_WEBHOOKS = "{cron.github.retry_failed_webhooks}",
  CRON_STRIPE_UPDATE_SEATS = "{cron.stripe.update_seats}",
  CRON_SCHEDULE_DIGESTS = "{cron.schedule_digests}",
  CRON_SCHEDULE_ALERTS = "{cron.schedule_alerts}",

  // GitHub
  GITHUB_INSTALLATION_SYNC = "{github.installation.sync}",
  GITHUB_INSTALLATION_CONFIG_SYNC = "{github.installation.config.sync}",
  GITHUB_MEMBERS_SYNC = "{github.members.sync}",
  GITHUB_REPOSITORIES_SYNC = "{github.repositories.sync}",
  GITHUB_OAUTH_REVOKED = "{github.oauth.revoked}",
  GITHUB_INSTALLATION_DELETED = "{github.installation.deleted}",
  GITHUB_SYNC_PULL_REQUEST = "{github.sync.pull_request}",
  GITHUB_SYNC_CODE_REVIEW = "{github.sync.code_review}",
  GITHUB_SYNC_REPOSITORY_PULL_REQUESTS = "{github.sync.repository.pull_requests}",

  // Sync Batch
  SYNC_BATCH = "{sync.batch}",

  // Stripe
  STRIPE_SUBSCRIPTION_UPDATED = "{stripe.subscription.updated}",

  // Slack
  SLACK_APP_UNINSTALLED = "{slack.app.uninstalled}",

  // Automations
  AUTOMATION_PR_TITLE_CHECK = "{automation.pr_title_check}",
  AUTOMATION_PR_SIZE_LABELER = "{automation.pr_size_labeler}",

  // Alerts
  ALERT_MERGED_WITHOUT_APPROVAL = "{alert.merged_without_approval}",
  ALERT_SLOW_MERGE = "{alert.slow_merge}",
  ALERT_SLOW_REVIEW = "{alert.slow_review}",

  // Digests
  DIGEST_SEND = "{digest.send}",

  // SaaS - Internal to Sweetr team
  SAAS_NOTIFY_NEW_INSTALLATION = "{saas.notify_new_installation}",
}

export enum JobPriority {
  LOW = 50,
  NORMAL = 25,
  HIGH = 1,
}

// Initialize Queues
export const queues: Record<SweetQueue, Queue> = (() => {
  const queues = {};

  for (const queueName of Object.values(SweetQueue)) {
    const queue = new Queue(queueName, {
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

    queues[queueName] = queue;

    logger.info(`🐂🧵 BullMQ: Queue ${queueName} initialized.`);
  }

  return queues as Record<SweetQueue, Queue>;
})();

export const addJob = async <T>(
  queueName: SweetQueue,
  data: T,
  options?: JobsOptions
) => {
  logger.info(`🐂✉️ BullMQ: Adding job to ${queueName}`);

  const queue = queues[queueName];

  return queue.add(`${queue.name}-job`, data, options);
};

export const addDelayedJob = async <T>(
  date: Date,
  queueName: SweetQueue,
  data: T,
  options?: JobsOptions
) => {
  logger.info(`🐂📅 BullMQ: Adding delayed job to ${queueName}`);

  const queue = queues[queueName];

  return queue.add(`${queue.name}-job`, data, {
    delay: date.getTime() - Date.now(),
    ...options,
  });
};

export const addJobs = async <T>(
  queueName: SweetQueue,
  data: T[],
  options?: BulkJobOptions
) => {
  logger.info(`🐂✉️ BullMQ: Adding ${data.length} job to ${queueName}`);

  const queue = queues[queueName];

  return queue.addBulk(
    data.map((d) => ({ name: `${queue.name}-job`, data: d, opts: options }))
  );
};
