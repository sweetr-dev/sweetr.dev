import { FastifyPluginAsync } from "fastify";
import { getStripeClient } from "../../lib/stripe";
import { env } from "../../env";
import {
  createStripeCheckoutSession,
  enqueueStripeWebhook,
} from "./services/stripe.service";
import { captureException } from "../../lib/sentry";
import { InputValidationException } from "../errors/exceptions/input-validation.exception";
import { z } from "zod";
import { decodeId } from "../../lib/hash-id";
import { IntegrationException } from "../errors/exceptions/integration.exception";

export const stripeRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/stripe/webhook",
    { config: { rawBody: true } },
    async (request, reply) => {
      if (!env.STRIPE_API_KEY) {
        throw new IntegrationException("STRIPE_API_KEY is not set");
      }

      if (!env.STRIPE_WEBHOOK_SECRET) {
        throw new IntegrationException("STRIPE_WEBHOOK_SECRET is not set");
      }

      const signature = request.headers["stripe-signature"] as string;

      try {
        const event = getStripeClient().webhooks.constructEvent(
          request.rawBody as string,
          signature,
          env.STRIPE_WEBHOOK_SECRET
        );

        await enqueueStripeWebhook(event);

        return reply.send({ received: true });
      } catch (error) {
        captureException(error);

        return reply.code(400).send("Webhook Error");
      }
    }
  );

  fastify.post("/stripe/checkout", async (request, reply) => {
    if (!env.STRIPE_API_KEY) {
      throw new IntegrationException("STRIPE_API_KEY is not set");
    }

    const schema = z.object({
      key: z.string(),
      quantity: z.string(),
      workspaceId: z.string(),
    });

    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      throw new InputValidationException();
    }

    const { key, quantity, workspaceId } = parsed.data;

    const session = await createStripeCheckoutSession({
      key,
      quantity: parseInt(quantity),
      workspaceId: decodeId(workspaceId),
    });

    return reply.code(303).redirect(session.url!);
  });
};
