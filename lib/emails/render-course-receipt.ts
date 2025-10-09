import { formatCurrency } from '@/lib/format-currency';

type Currency = {
  code: string;
  locale?: string;
};

type ReceiptItem = {
  name: string;
  description?: string;
  accessUrl: string;
  price: number;
};

type ReceiptContext = {
  orderId: string;
  buyerName?: string | null;
  supportEmail?: string | null;
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  total: number;
  currency: Currency;
  customMessage?: string | null;
};

export function renderCourseReceiptHtml(context: ReceiptContext) {
  const { orderId, buyerName, supportEmail, items, subtotal, discount = 0, total, currency, customMessage } = context;
  const locale = currency.locale ?? (currency.code === 'USD' ? 'en-US' : 'es-ES');

  const safeFormat = (value: number) => formatCurrency({ value, currency: currency.code, locale });

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; vertical-align: top;">
            <strong style="font-size: 15px; color: #0f172a;">${item.name}</strong>
            ${item.description ? `<p style="margin: 4px 0 0; color: #475569; font-size: 13px;">${item.description}</p>` : ''}
            <p style="margin: 12px 0 0;">
              <a href="${item.accessUrl}" style="color: #6366f1; text-decoration: none;">
                Acceder al curso →
              </a>
            </p>
          </td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #0f172a; font-size: 14px;">
            ${safeFormat(item.price)}
          </td>
        </tr>
      `
    )
    .join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; margin: 0 auto; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <tbody>
        <tr>
          <td style="padding: 32px 24px; background: #0f172a; color: #f8fafc; text-align: center; border-top-left-radius: 16px; border-top-right-radius: 16px;">
            <p style="margin: 0; font-size: 14px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(248, 250, 252, 0.6);">J-W Fitness Coaching</p>
            <h1 style="margin: 12px 0 0; font-size: 24px;">Resumen de tu compra</h1>
          </td>
        </tr>
        <tr>
          <td style="background: #ffffff; padding: 28px 24px;">
            <p style="margin: 0 0 12px; color: #475569; font-size: 14px;">${buyerName ? `Hola ${buyerName},` : 'Hola,'}</p>
            <p style="margin: 0 0 18px; color: #475569; font-size: 14px;">
              Gracias por confiar en nuestro programa. Aquí tienes los enlaces para comenzar con tus cursos.
            </p>
            <p style="margin: 0 0 6px; color: #0f172a; font-weight: 600; font-size: 14px;">Orden #${orderId}</p>
            <table width="100%" style="border-collapse: collapse; margin-top: 12px;">
              <tbody>
                ${rows}
              </tbody>
            </table>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 22px 0" />
            <table width="100%" style="color: #0f172a; font-size: 14px;">
              <tbody>
                <tr>
                  <td style="padding: 4px 0; color: #475569;">Subtotal</td>
                  <td style="padding: 4px 0; text-align: right;">${safeFormat(subtotal)}</td>
                </tr>
                ${discount > 0 ? `<tr><td style="padding: 4px 0; color: #475569;">Descuento</td><td style="padding: 4px 0; text-align: right; color: #16a34a;">- ${safeFormat(discount)}</td></tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: 700;">Total</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 700;">${safeFormat(total)}</td>
                </tr>
              </tbody>
            </table>
            ${customMessage ? `<p style="margin: 24px 0 0; color: #475569; font-size: 14px;">${customMessage}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 24px; background: #f8fafc; color: #475569; font-size: 12px; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
            <p style="margin: 0 0 8px;">Si necesitas ayuda o tienes alguna duda, responde este correo o escribe a ${supportEmail ?? 'support@jwfitness.co'}.</p>
            <p style="margin: 0;">Entrena como atleta. Vive como líder.</p>
          </td>
        </tr>
      </tbody>
    </table>
  `;
}
