import { addJob, SweetQueue } from "../../../bull-mq/queues";
import { env } from "process";
import { isProduction } from "../../../env";
import { logger } from "../../../lib/logger";
import { captureException } from "../../../lib/sentry";
import { EmailPayload, EmailOptions, getEmailClient } from "../../../lib/email";
import { InitialSyncCompleteEmail } from "@sweetr/email-templates";
import { BuildEmailTemplate } from "./email-template.service";
import { redisConnection } from "../../../bull-mq/redis-connection";

const emailTemplates = {
  initialSyncComplete: InitialSyncCompleteEmail,
};

export type EmailType = keyof typeof emailTemplates;
export type SendEmailPayload = Omit<EmailPayload, "from">;

export const enqueueEmail = (
  data: SendEmailPayload & { template: BuildEmailTemplate }
) => {
  const { template, ...payload } = data;

  return addJob(SweetQueue.SEND_EMAIL, { template, payload });
};

export const sendEmail = async (
  payload: SendEmailPayload,
  options?: EmailOptions
) => {
  if (!env.EMAIL_ENABLED) {
    logger.debug("Skipping email due to falsy EMAIL_ENABLED");
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
