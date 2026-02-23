import { FastifyPluginAsync } from "fastify";

export const healthRouter: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async (_request, reply) => {
    return reply.send({ status: "ok" });
  });
};
