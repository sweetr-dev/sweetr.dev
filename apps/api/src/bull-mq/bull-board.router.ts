import { FastifyPluginAsync } from "fastify";
import { FastifyAdapter } from "@bull-board/fastify";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { queues } from "./queues";
import auth from "basic-auth";
import { env } from "../env";
import rateLimit from "@fastify/rate-limit";

export const bullBoardRouter: FastifyPluginAsync = async (fastify) => {
  if (!env.BULLBOARD_PATH || !env.BULLBOARD_USERNAME || !env.BULLBOARD_PASSWORD)
    return;

  const serverAdapter = new FastifyAdapter();
  serverAdapter.setBasePath(env.BULLBOARD_PATH);

  createBullBoard({
    queues: Object.values(queues).map((queue) => new BullMQAdapter(queue)),
    serverAdapter: serverAdapter,
  });

  await fastify.register(rateLimit, {
    max: 200,
    timeWindow: "15 minutes",
  });

  fastify.addHook("onRequest", async (request, reply) => {
    if (!request.url.startsWith(env.BULLBOARD_PATH)) return;

    const user = auth(request.raw);
    const username = env.BULLBOARD_USERNAME;
    const password = env.BULLBOARD_PASSWORD;

    if (!user || user.name !== username || user.pass !== password) {
      reply.header("WWW-Authenticate", 'Basic realm="BullBoard"');
      return reply.code(401).send("Authentication required.");
    }
  });

  await fastify.register(serverAdapter.registerPlugin(), {
    prefix: env.BULLBOARD_PATH,
  });
};
