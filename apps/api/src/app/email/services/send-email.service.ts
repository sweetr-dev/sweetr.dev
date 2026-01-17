import { InitialSyncCompleteEmail } from "@sweetr/email-templates";
import { addJob } from "../../../bull-mq/queues";
import { redisConnection } from "../../../bull-mq/redis-connection";
import { env, isProduction } from "../../../env";
import { EmailOptions, EmailPayload, getEmailClient } from "../../../lib/email";
import { logger } from "../../../lib/logger";
import { captureException } from "../../../lib/sentry";
import { BuildEmailTemplate } from "./email-template.service";

const emailTemplates = { initialSyncComplete: InitialSyncCompleteEmail };

export type EmailType = keyof typeof emailTemplates;
export type SendEmailPayload = Omit<EmailPayload, "from">;

export const enqueueEmail = (
  data: SendEmailPayload & { template: BuildEmailTemplate }
) => {
  if (!env.EMAIL_ENABLED) {
    logger.info("Skipping email due to falsy EMAIL_ENABLED");
    return;
  }

  const { template, ...payload } = data;

  return addJob("SEND_EMAIL", { template, payload });
};

export const sendEmail = async (
  payload: SendEmailPayload,
  options?: EmailOptions
) => {
  if (!env.EMAIL_ENABLED) {
    logger.info("Skipping email due to falsy EMAIL_ENABLED");
    return;
  }

  const client = getEmailClient();
  const to = isProduction ? payload.to : "delivered@resend.dev";

  const { data, error } = await client.emails.send(
    {
      from: "Walter from sweetr.dev <walter@sweetr.dev>",
      ...payload,
      to,
    } as EmailPayload,
    options
  );

  if (error) {
    captureException(error);
  }

  return data;
};

export const markEmailAsSent = (key: string, expireInSeconds: number) => {
  return redisConnection.setex(key, expireInSeconds, 1);
};

export const hasSentEmail = (key: string) => {
  return redisConnection.exists(key);
};
