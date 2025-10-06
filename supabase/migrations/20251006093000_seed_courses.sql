INSERT INTO public.courses (slug, name, description, price_cents, currency, delivery_html_url, thumbnail_url, stripe_product_id, stripe_price_id)
VALUES
  ('starter-strong', 'Starter Strong', 'Plan de 4 semanas para retomar habitos con enfoque en fuerza basica y movilidad.', 12900, 'USD', '/courses/starter-strong', 'https://images.unsplash.com/photo-1571019613530-d20e68194d60?auto=format&fit=crop&w=800&q=80', NULL, NULL),
  ('elite-pro', 'Elite Pro', 'Coaching premium con chequeos semanales, ajustes personalizados y seguimiento biometrico.', 24900, 'USD', '/courses/elite-pro', 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=800&q=80', NULL, NULL),
  ('team-power', 'Team Power', 'Programa colaborativo para grupos o parejas con retos mensuales y sesiones en vivo.', 39900, 'USD', '/courses/team-power', 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=800&q=80', NULL, NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  currency = EXCLUDED.currency,
  delivery_html_url = EXCLUDED.delivery_html_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  stripe_product_id = EXCLUDED.stripe_product_id,
  stripe_price_id = EXCLUDED.stripe_price_id,
  updated_at = now();