import Stripe from "stripe";
import { env } from "../env";
import { IntegrationException } from "../app/errors/exceptions/integration.exception";

let stripeClient: Stripe | null;

export const getStripeClient = (): Stripe => {
  if (!env.STRIPE_API_KEY) {
    throw new IntegrationException("STRIPE_API_KEY is not set");
  }

  if (stripeClient) return stripeClient;

  stripeClient = new Stripe(env.STRIPE_API_KEY);

  return stripeClient;
};
