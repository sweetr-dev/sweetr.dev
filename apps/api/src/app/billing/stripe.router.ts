import { Router } from "express";
import { catchErrors } from "../../lib/express-helpers";
import { getStripeClient } from "../../lib/stripe";
import { env } from "../../env";
import { enqueueStripeWebhook } from "./services/stripe-webhook.service";
import { captureException } from "../../lib/sentry";

export const githubRouter = Router();

githubRouter.post(
  "/stripe",
  catchErrors(async (req, res) => {
    const signature = req.get("Stripe-Signature");

    try {
      const event = getStripeClient().webhooks.constructEvent(
        req.body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );

      await enqueueStripeWebhook(event);

      return res.status(200).send({ received: true });
    } catch (error) {
      captureException(error);

      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  })
);
