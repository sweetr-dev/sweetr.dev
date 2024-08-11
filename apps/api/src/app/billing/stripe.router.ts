import { Router, urlencoded } from "express";
import { catchErrors } from "../../lib/express-helpers";
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

export const stripeRouter = Router();

stripeRouter.post(
  "/stripe/webhook",
  catchErrors(async (req, res) => {
    const signature = req.get("Stripe-Signature");

    try {
      const event = getStripeClient().webhooks.constructEvent(
        req.rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );

      await enqueueStripeWebhook(event);

      return res.status(200).send({ received: true });
    } catch (error) {
      captureException(error);

      return res.status(400).send("Webhook Error");
    }
  })
);

stripeRouter.post(
  "/stripe/checkout",
  urlencoded({ extended: true }),
  catchErrors(async (req, res) => {
    const schema = z.object({
      key: z.string(),
      quantity: z.string(),
      workspaceId: z.string(),
    });

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      throw new InputValidationException();
    }

    const { key, quantity, workspaceId } = parsed.data;

    const session = await createStripeCheckoutSession({
      key,
      quantity: parseInt(quantity),
      workspaceId: decodeId(workspaceId),
    });

    res.redirect(303, session.url);
  })
);
