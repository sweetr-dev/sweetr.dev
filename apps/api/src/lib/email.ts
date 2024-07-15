import { Resend } from "resend";
import { env } from "../env";

let resendClient: Resend | null;

export type EmailPayload = Parameters<Resend["emails"]["send"]>[0];
export type EmailOptions = Parameters<Resend["emails"]["send"]>[1];

export const getEmailClient = (): Resend => {
  if (resendClient) return resendClient;

  return new Resend(env.RESEND_API_KEY);
};
