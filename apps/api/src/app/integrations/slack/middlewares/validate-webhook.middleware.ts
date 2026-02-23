import * as crypto from "crypto";
import { FastifyRequest, FastifyReply } from "fastify";
import { isLive } from "../../../../env";
import { config } from "../../../../config";

export const validateWebhook = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!req.rawBody) {
    return reply.code(400).send("Request is empty");
  }

  // Skip validation when in dev environment
  if (!isLive) return;

  const signature = (req.headers["x-slack-signature"] as string) || "";
  const timestamp = (req.headers["x-slack-request-timestamp"] as string) || "";

  if (!signature || !timestamp || Number.isNaN(Number(timestamp))) {
    return reply.code(400).send("Missing or invalid Slack headers.");
  }

  const time = Math.floor(Date.now() / 1000);

  if (Math.abs(time - Number(timestamp)) > 300) {
    return reply.code(400).send("Slack request timestamp is too old.");
  }

  const baseString = `v0:${timestamp}:${req.rawBody}`;
  const hmac = crypto.createHmac("sha256", config.slack.webhookSecret);
  const calculatedSignature = `v0=${hmac.update(baseString).digest("hex")}`;

  if (
    !crypto.timingSafeEqual(
      Buffer.from(calculatedSignature),
      Buffer.from(signature)
    )
  ) {
    return reply.code(401).send("Slack webhook signature mismatch.");
  }
};
