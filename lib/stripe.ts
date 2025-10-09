import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error('Falta STRIPE_SECRET_KEY en las variables de entorno.');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY);
