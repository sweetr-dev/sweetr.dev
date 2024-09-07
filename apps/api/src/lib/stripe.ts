import Stripe from "stripe";
import { env } from "../env";

let stripeClient: Stripe | null;

export const getStripeClient = (): Stripe => {
  if (stripeClient) return stripeClient;

  stripeClient = new Stripe(env.STRIPE_API_KEY);

  return stripeClient;
};
