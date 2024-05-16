import * as crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { env, isLive } from "../../../env";

const signatureHeader = "X-Hub-Signature-256";
const hashAlgorithm = "sha256";

export const validateWebhook = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.body) {
    return next("Request body empty");
  }

  // Skip validation when in dev environment
  if (!isLive) return next();

  const data = JSON.stringify(req.body);
  const signature = Buffer.from(req.get(signatureHeader) || "", "utf8");
  const hmac = crypto.createHmac(hashAlgorithm, env.GITHUB_WEBHOOK_SECRET);
  const digest = Buffer.from(
    `${hashAlgorithm}=${hmac.update(data).digest("hex")}`,
    "utf8"
  );

  if (
    signature.length !== digest.length ||
    !crypto.timingSafeEqual(digest, signature)
  ) {
    return next(`GitHub webhook signature mismatch.`);
  }

  return next();
};
