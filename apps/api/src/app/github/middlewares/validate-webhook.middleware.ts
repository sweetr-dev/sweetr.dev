import * as crypto from "crypto";
import { FastifyRequest, FastifyReply } from "fastify";
import { env, isLive } from "../../../env";

const signatureHeader = "x-hub-signature-256";
const hashAlgorithm = "sha256";

export const validateWebhook = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!req.rawBody) {
    return reply.code(400).send("Request body empty");
  }

  // Skip validation when in dev environment
  if (!isLive) return;

  const signature = (req.headers[signatureHeader] as string) || "";
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
    return reply.code(401).send("GitHub webhook signature mismatch.");
  }
};
