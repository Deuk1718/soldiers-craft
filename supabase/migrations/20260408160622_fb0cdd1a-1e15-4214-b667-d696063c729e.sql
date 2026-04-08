
-- Waiting users table
CREATE TABLE public.buddy_waiting_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  service_year TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  is_matched BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.buddy_waiting_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register as waiting user"
ON public.buddy_waiting_users FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Anyone can search waiting users"
ON public.buddy_waiting_users FOR SELECT TO public
USING (true);

CREATE POLICY "Admins can update waiting users"
ON public.buddy_waiting_users FOR UPDATE TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete waiting users"
ON public.buddy_waiting_users FOR DELETE TO authenticated
USING (is_admin(auth.uid()));

-- Matches table
CREATE TABLE public.buddy_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id UUID NOT NULL REFERENCES public.buddy_waiting_users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES public.buddy_waiting_users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.buddy_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage matches"
ON public.buddy_matches FOR ALL TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view matches"
ON public.buddy_matches FOR SELECT TO public
USING (true);

-- Trigger: notify admin on new match
CREATE OR REPLACE FUNCTION public.on_new_buddy_match()
RETURNS TRIGGER AS $$
DECLARE
  _user_a TEXT;
  _user_b TEXT;
BEGIN
  SELECT name INTO _user_a FROM public.buddy_waiting_users WHERE id = NEW.user_a_id;
  SELECT name INTO _user_b FROM public.buddy_waiting_users WHERE id = NEW.user_b_id;
  
  INSERT INTO public.notifications (title, message, type)
  VALUES (
    '전우 매칭 성공',
    _user_a || ' ↔ ' || _user_b || ' 매칭이 완료되었습니다.',
    'matching'
  );
  
  UPDATE public.buddy_waiting_users SET is_matched = true WHERE id IN (NEW.user_a_id, NEW.user_b_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_buddy_match_created
AFTER INSERT ON public.buddy_matches
FOR EACH ROW
EXECUTE FUNCTION public.on_new_buddy_match();
