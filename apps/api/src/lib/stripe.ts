import Stripe from "stripe";
import { env } from "../env";

let stripeClient: Stripe | null;

export const getStripeClient = (): Stripe => {
  if (!env.STRIPE_API_KEY) {
    throw new Error("STRIPE_API_KEY is not set");
  }

  if (stripeClient) return stripeClient;

  stripeClient = new Stripe(env.STRIPE_API_KEY);

  return stripeClient;
};
