import * as crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { isLive } from "../../../../env";
import { config } from "../../../../config";

export const validateWebhook = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.rawBody) {
    return next("Request is empty");
  }

  // Skip validation when in dev environment
  if (!isLive) return next();

  const signature = req.headers["x-slack-signature"] as string;
  const timestamp = req.headers["x-slack-request-timestamp"] as string;
  const time = Math.floor(new Date().getTime() / 1000);

  if (Math.abs(time - Number(timestamp)) > 300) {
    return next(`Slack request timestamp is too old.`);
  }

  const baseString = `v0:${timestamp}:${req.rawBody.toString("utf8")}`;
  const hmac = crypto.createHmac("sha256", config.slack.webhookSecret);
  const calculatedSignature = `v0=${hmac.update(baseString).digest("hex")}`;

  if (
    !crypto.timingSafeEqual(
      Buffer.from(calculatedSignature),
      Buffer.from(signature)
    )
  ) {
    return next(`Slack webhook signature mismatch.`);
  }

  return next();
};
