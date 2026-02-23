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

  fastify.register(
    async (scope) => {
      await scope.register(rateLimit, {
        max: 200,
        timeWindow: "15 minutes",
      });

      scope.addHook("onRequest", async (request, reply) => {
        const user = auth(request.raw);

        if (
          !user ||
          user.name !== env.BULLBOARD_USERNAME ||
          user.pass !== env.BULLBOARD_PASSWORD
        ) {
          reply.header("WWW-Authenticate", 'Basic realm="BullBoard"');
          return reply.code(401).send("Authentication required.");
        }
      });

      await scope.register(serverAdapter.registerPlugin());
    },
    { prefix: env.BULLBOARD_PATH }
  );
};
