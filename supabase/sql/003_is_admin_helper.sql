-- FunciÃ³n helper para evaluar si el usuario autenticado es admin sin depender de RLS en profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Retorna true si el usuario autenticado pertenece al rol admin.';

-- Actualizamos las polÃ­ticas para evitar recursion
DROP POLICY IF EXISTS "admin read all" ON public.profiles;
CREATE POLICY "admin read all" ON public.profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin update all" ON public.profiles;
CREATE POLICY "admin update all" ON public.profiles
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "courses admin manage" ON public.courses;
CREATE POLICY "courses admin manage" ON public.courses
  USING (public.is_admin())
  WITH CHECK (public.is_admin());