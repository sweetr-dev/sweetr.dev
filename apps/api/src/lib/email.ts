import { CreateEmailOptions, CreateEmailRequestOptions, Resend } from "resend";
import { DataAccessException } from "../app/errors/exceptions/data-access.exception";
import { env } from "../env";

let resendClient: Resend | null;

export type EmailPayload = CreateEmailOptions;
export type EmailOptions = CreateEmailRequestOptions;

export const getEmailClient = (): Resend => {
  if (!env.RESEND_API_KEY) {
    throw new DataAccessException("RESEND_API_KEY is not available");
  }

  if (resendClient) return resendClient;

  resendClient = new Resend(env.RESEND_API_KEY);

  return resendClient;
};
