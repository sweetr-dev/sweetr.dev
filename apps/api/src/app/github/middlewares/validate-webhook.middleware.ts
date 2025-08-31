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
  if (!req.rawBody) {
    return next("Request body empty");
  }

  // Skip validation when in dev environment
  if (!isLive && 0) return next();

  const signature = req.get(signatureHeader) || "";
  const calculatedSignature =
    `${hashAlgorithm}=` +
    crypto
      .createHmac(hashAlgorithm, env.GITHUB_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

  if (
    signature.length !== calculatedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(calculatedSignature),
      Buffer.from(signature)
    )
  ) {
    return next("GitHub webhook signature mismatch.");
  }

  return next();
};
