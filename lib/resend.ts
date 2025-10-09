import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  throw new Error('Falta RESEND_API_KEY en las variables de entorno del servidor.');
}

let client: Resend | null = null;

export function getResendClient() {
  if (!client) {
    client = new Resend(RESEND_API_KEY);
  }
  return client;
}