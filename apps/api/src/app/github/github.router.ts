import { FastifyPluginAsync } from "fastify";
import { validateWebhook } from "./middlewares/validate-webhook.middleware";
import { enqueueGithubWebhook } from "./services/github-webhook.service";

export const githubRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/github/webhook",
    { preHandler: validateWebhook, config: { rawBody: true } },
    async (request, reply) => {
      await enqueueGithubWebhook(
        request.headers["x-github-event"] as string,
        request.body as never
      );

      return reply.code(200).send();
    }
  );
};
