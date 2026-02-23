import { FastifyPluginAsync } from "fastify";
import { validateWebhook } from "./middlewares/validate-webhook.middleware";
import { enqueueSlackWebhook } from "./services/slack-webhook.service";
import { escapeHtml } from "../../../lib/html";

export const slackRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/slack/webhook",
    { preHandler: validateWebhook, config: { rawBody: true } },
    async (request, reply) => {
      const body = request.body as Record<string, unknown>;

      if (body.type === "url_verification") {
        return reply.send(escapeHtml(body.challenge as string));
      }

      const event = body.event as Record<string, unknown> | undefined;

      if (event?.type) {
        await enqueueSlackWebhook(event.type as string, body);
      }

      return reply.code(200).send();
    }
  );

  fastify.post("/slack/interactive", async (_request, reply) => {
    return reply.code(200).send();
  });
};
