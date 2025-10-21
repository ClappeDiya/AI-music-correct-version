import { loadStripe } from "@stripe/stripe-js";

// Replace with your Stripe publishable key from environment variables
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

export { stripePromise };
