-- === Fase 2: catalogo de cursos y carrito ===
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.handle_timestamp_updated()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'cart_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.cart_status AS ENUM ('active', 'locked', 'converted', 'abandoned');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'order_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.order_status AS ENUM ('pending', 'requires_payment', 'paid', 'fulfilled', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (char_length(currency) = 3),
  delivery_html_url text,
  thumbnail_url text,
  stripe_product_id text,
  stripe_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.courses IS 'Catalogo de cursos disponibles para la compra.';

DROP TRIGGER IF EXISTS on_course_updated ON public.courses;
CREATE TRIGGER on_course_updated
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_timestamp_updated();

CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.cart_status NOT NULL DEFAULT 'active',
  stripe_checkout_session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.carts IS 'Carritos activos por usuario antes de iniciar el checkout.';

CREATE UNIQUE INDEX IF NOT EXISTS carts_active_user_idx ON public.carts(user_id) WHERE status = 'active';

DROP TRIGGER IF EXISTS on_cart_updated ON public.carts;
CREATE TRIGGER on_cart_updated
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.handle_timestamp_updated();

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents integer,
  unit_currency text CHECK (char_length(unit_currency) = 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cart_id, course_id)
);

COMMENT ON TABLE public.cart_items IS 'Lineas de cursos agregadas a un carrito.';

DROP TRIGGER IF EXISTS on_cart_item_updated ON public.cart_items;
CREATE TRIGGER on_cart_item_updated
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_timestamp_updated();

CREATE OR REPLACE FUNCTION public.handle_cart_item_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
  course_record record;
BEGIN
  SELECT price_cents, currency INTO course_record FROM public.courses WHERE id = NEW.course_id;

  IF course_record.price_cents IS NULL THEN
    RAISE EXCEPTION 'El curso % no existe o no tiene precio definido', NEW.course_id;
  END IF;

  IF NEW.unit_price_cents IS NULL THEN
    NEW.unit_price_cents := course_record.price_cents;
  END IF;

  IF NEW.unit_currency IS NULL THEN
    NEW.unit_currency := course_record.currency;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_cart_item_insert ON public.cart_items;
CREATE TRIGGER on_cart_item_insert
  BEFORE INSERT ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_cart_item_defaults();

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  total_cents integer NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (char_length(currency) = 3),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  receipt_url text,
  delivery_summary text,
  receipt_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.orders IS 'Ordenes confirmadas listas para integrarse con Stripe y envio de recibos.';

DROP TRIGGER IF EXISTS on_order_updated ON public.orders;
CREATE TRIGGER on_order_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_timestamp_updated();

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  unit_currency text NOT NULL CHECK (char_length(unit_currency) = 3),
  delivery_html_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_items IS 'Cursos incluidos dentro de una orden completada.';

DROP TRIGGER IF EXISTS on_order_item_updated ON public.order_items;
CREATE TRIGGER on_order_item_updated
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_timestamp_updated();

-- Politicas RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses public read" ON public.courses;
CREATE POLICY "courses public read" ON public.courses
  FOR SELECT
  USING (is_active AND (auth.role() = 'anon' OR auth.uid() IS NOT NULL));

DROP POLICY IF EXISTS "courses admin manage" ON public.courses;
CREATE POLICY "courses admin manage" ON public.courses
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "carts owner read" ON public.carts;
CREATE POLICY "carts owner read" ON public.carts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts owner manage" ON public.carts;
CREATE POLICY "carts owner manage" ON public.carts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart items owner read" ON public.cart_items;
CREATE POLICY "cart items owner read" ON public.cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cart items owner manage" ON public.cart_items;
CREATE POLICY "cart items owner manage" ON public.cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "orders owner read" ON public.orders;
CREATE POLICY "orders owner read" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders owner manage" ON public.orders;
CREATE POLICY "orders owner manage" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "order items owner read" ON public.order_items;
CREATE POLICY "order items owner read" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order items owner manage" ON public.order_items;
CREATE POLICY "order items owner manage" ON public.order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

