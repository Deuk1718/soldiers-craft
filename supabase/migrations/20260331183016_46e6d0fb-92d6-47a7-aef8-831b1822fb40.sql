
-- 1. Create admin_users table
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin_users
CREATE POLICY "Admins can read admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = _user_id
  )
$$;

-- 3. Seed existing authenticated users as admins
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. Drop old overly permissive consultations policies
DROP POLICY IF EXISTS "Authenticated users can read consultations" ON public.consultations;
DROP POLICY IF EXISTS "Authenticated users can update consultations" ON public.consultations;
DROP POLICY IF EXISTS "Authenticated users can delete consultations" ON public.consultations;

-- 5. Create new admin-only policies for consultations
CREATE POLICY "Admins can read consultations"
  ON public.consultations FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update consultations"
  ON public.consultations FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete consultations"
  ON public.consultations FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 6. Tighten experts write policies similarly
DROP POLICY IF EXISTS "Authenticated users can insert experts" ON public.experts;
DROP POLICY IF EXISTS "Authenticated users can update experts" ON public.experts;
DROP POLICY IF EXISTS "Authenticated users can delete experts" ON public.experts;

CREATE POLICY "Admins can insert experts"
  ON public.experts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update experts"
  ON public.experts FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete experts"
  ON public.experts FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 7. Tighten site_settings update policy
DROP POLICY IF EXISTS "Authenticated users can update site_settings" ON public.site_settings;

CREATE POLICY "Admins can update site_settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
