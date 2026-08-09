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

  if (!secret || secret !== env.ADMIN_API_SECRET) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
};
