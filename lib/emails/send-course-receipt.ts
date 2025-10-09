import { getResendClient } from '@/lib/resend';
import { renderCourseReceiptHtml } from '@/lib/emails/render-course-receipt';

type ReceiptEmailItem = {
  name: string;
  accessUrl: string;
  description?: string;
  price: number;
};

type SendCourseReceiptOptions = {
  to: string;
  orderId: string;
  buyerName?: string | null;
  currency: { code: string; locale?: string };
  items: ReceiptEmailItem[];
  subtotal: number;
  discount?: number;
  total: number;
  supportEmail?: string | null;
  customMessage?: string | null;
};

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? 'J-W Fitness Coaching <no-reply@jwfitness.co>';

export async function sendCourseReceiptEmail(options: SendCourseReceiptOptions) {
  const resend = getResendClient();
  const html = renderCourseReceiptHtml({
    orderId: options.orderId,
    buyerName: options.buyerName,
    supportEmail: options.supportEmail,
    items: options.items,
    subtotal: options.subtotal,
    discount: options.discount,
    total: options.total,
    currency: options.currency,
    customMessage: options.customMessage,
  });

  await resend.emails.send({
    from: RESEND_FROM,
    to: options.to,
    subject: `Tu recibo #${options.orderId}`,
    html,
  });
}