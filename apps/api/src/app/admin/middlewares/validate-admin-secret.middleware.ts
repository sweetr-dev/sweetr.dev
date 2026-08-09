import * as crypto from "crypto";
import { FastifyRequest, FastifyReply } from "fastify";
import { env } from "../../../env";

export const validateAdminSecret = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!env.ADMIN_API_SECRET) {
    return reply.code(501).send({ error: "Admin API not configured" });
  }

  const secret = req.headers["x-admin-secret"] as string;

  if (!secret) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const secretBuffer = Buffer.from(secret);
  const expectedBuffer = Buffer.from(env.ADMIN_API_SECRET);

  if (
    secretBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(secretBuffer, expectedBuffer)
  ) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
};
