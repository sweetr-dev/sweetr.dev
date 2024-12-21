import { DelayedError, Job } from "bullmq";
import { logger } from "../../../lib/logger";
import { redisConnection } from "../../../bull-mq/redis-connection";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { addSeconds, getTime, isPast, fromUnixTime } from "date-fns";

const oneSecondInMs = 1000;

interface WithDelayedRetryOnRateLimitArgs {
  job: Job;
  installationId: number;
  jobToken?: string;
}
export const withDelayedRetryOnRateLimit = async (
  callback: () => Promise<void>,
  { job, jobToken, installationId }: WithDelayedRetryOnRateLimitArgs
) => {
  try {
    const rateLimitResetAtInMs =
      await getGitInstallationRateLimitEpochInMs(installationId);

    if (rateLimitResetAtInMs) {
      logger.info(
        `[🐈‍⬛ GitHub Rate Limit] 🕛 Re-scheduling delayed job to ${new Date(rateLimitResetAtInMs)}...`,
        {
          jobId: job.id,
          installationId,
          rateLimitResetAt: new Date(rateLimitResetAtInMs),
        }
      );

      await job.moveToDelayed(rateLimitResetAtInMs + oneSecondInMs, jobToken);
      throw new DelayedError();
    }

    await callback();
  } catch (error) {
    // Primary rate limit
    if ("headers" in error && error.headers["x-ratelimit-remaining"] === "0") {
      const rateLimitResetAt = fromUnixTime(
        parseInt(error.headers["x-ratelimit-reset"]) // GitHub returns *seconds* since Unix epoch.
      );

      if (!rateLimitResetAt) {
        throw new BusinessRuleException(
          "[🐈‍⬛ GitHub Rate Limit] Rate limit reset time not found.",
          { extra: { errorHeaders: error.headers }, originalError: error }
        );
      }

      if (isPast(rateLimitResetAt)) {
        logger.error(
          "[🐈‍⬛ GitHub Rate Limit] Rate limit reset time is in the past."
        );
        throw error;
      }

      logger.info(
        `[🐈‍⬛ GitHub Rate Limit] Rate limit reached. Delaying job to ${rateLimitResetAt}...`,
        { jobId: job.id }
      );

      setGitInstallationRateLimitEpochInMs(
        installationId,
        getTime(rateLimitResetAt)
      );

      await job.moveToDelayed(
        getTime(rateLimitResetAt) + oneSecondInMs,
        jobToken
      );
      throw new DelayedError();
    }

    // Secondary rate limit (Concurrency)
    if ("headers" in error && error.headers["retry-after"]) {
      const retryAfterSeconds = parseInt(error.headers["retry-after"]) + 5; // 5 seconds buffer
      const canRetryAt = addSeconds(new Date(), retryAfterSeconds);

      logger.info(
        `[🐈‍⬛ GitHub Rate Limit] Concurrency error. Delaying job to ${canRetryAt}...`,
        { jobId: job.id }
      );

      setGitInstallationRateLimitEpochInMs(installationId, getTime(canRetryAt));

      await job.moveToDelayed(getTime(canRetryAt) + oneSecondInMs, jobToken);
      throw new DelayedError();
    }

    throw error;
  }
};

export const getGitInstallationRateLimitEpochInMs = async (
  installationId: number
) => {
  const rateLimitResetString = await redisConnection.get(
    `github:rate-limit-reset:${installationId}`
  );

  const rateLimitResetAt = rateLimitResetString
    ? parseInt(rateLimitResetString)
    : 0;

  if (rateLimitResetAt < Date.now()) {
    return 0;
  }

  return rateLimitResetAt;
};

export const setGitInstallationRateLimitEpochInMs = async (
  installationId: number,
  rateLimitResetAtInMs: number
) => {
  await redisConnection.set(
    `github:rate-limit-reset:${installationId}`,
    rateLimitResetAtInMs,
    // Set key to expire
    "EX",
    rateLimitResetAtInMs
  );
};
