
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'consultation',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read notifications" ON public.notifications FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update notifications" ON public.notifications FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete notifications" ON public.notifications FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO public WITH CHECK (true);

CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Trigger to auto-create notification on new consultation
CREATE OR REPLACE FUNCTION public.notify_new_consultation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, consultation_id)
  VALUES (
    'consultation',
    '새 상담 예약',
    NEW.client_name || '님이 ' || NEW.expert_name || ' 전문가에게 ' || NEW.consultation_date || ' ' || NEW.consultation_time || ' 상담을 예약했습니다.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_consultation
AFTER INSERT ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_consultation();
