-- Allow anonymous users to insert consultations
CREATE POLICY "Anyone can submit consultations"
ON public.consultations
FOR INSERT
TO public
WITH CHECK (true);

-- Create or replace the validation trigger
CREATE OR REPLACE FUNCTION public.validate_consultation_input()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Length validation
  IF length(NEW.client_name) > 100 THEN
    RAISE EXCEPTION 'client_name must be 100 characters or less';
  END IF;
  IF length(NEW.client_phone) > 20 THEN
    RAISE EXCEPTION 'client_phone must be 20 characters or less';
  END IF;
  IF NEW.client_email IS NOT NULL AND length(NEW.client_email) > 255 THEN
    RAISE EXCEPTION 'client_email must be 255 characters or less';
  END IF;
  IF length(NEW.expert_name) > 100 THEN
    RAISE EXCEPTION 'expert_name must be 100 characters or less';
  END IF;
  IF length(NEW.expert_expertise) > 100 THEN
    RAISE EXCEPTION 'expert_expertise must be 100 characters or less';
  END IF;
  IF NEW.memo IS NOT NULL AND length(NEW.memo) > 1000 THEN
    RAISE EXCEPTION 'memo must be 1000 characters or less';
  END IF;

  -- Sanitize: strip HTML tags
  NEW.client_name := regexp_replace(NEW.client_name, '<[^>]*>', '', 'g');
  NEW.client_phone := regexp_replace(NEW.client_phone, '<[^>]*>', '', 'g');
  IF NEW.client_email IS NOT NULL THEN
    NEW.client_email := regexp_replace(NEW.client_email, '<[^>]*>', '', 'g');
  END IF;
  NEW.expert_name := regexp_replace(NEW.expert_name, '<[^>]*>', '', 'g');
  NEW.expert_expertise := regexp_replace(NEW.expert_expertise, '<[^>]*>', '', 'g');
  IF NEW.memo IS NOT NULL THEN
    NEW.memo := regexp_replace(NEW.memo, '<[^>]*>', '', 'g');
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trg_validate_consultation ON public.consultations;
CREATE TRIGGER trg_validate_consultation
BEFORE INSERT OR UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.validate_consultation_input();
