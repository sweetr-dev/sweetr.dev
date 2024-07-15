import { Resend } from "resend";
import { env, isProduction } from "../env";
import { logger } from "./logger";
import { captureException } from "./sentry";

let resendClient: Resend | null;

const getEmailClient = (): Resend => {
  if (resendClient) return resendClient;

  return new Resend(env.RESEND_API_KEY);
};

type EmailPayload = Parameters<Resend["emails"]["send"]>[0];
type EmailOptions = Parameters<Resend["emails"]["send"]>[1];

export const sendEmail = async (
  payload: Omit<EmailPayload, "from">,
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
