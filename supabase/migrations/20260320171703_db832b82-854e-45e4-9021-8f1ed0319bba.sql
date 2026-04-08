
-- Remove the public INSERT policy and replace with a restricted one
DROP POLICY IF EXISTS "Anyone can create consultations" ON public.consultations;

-- Add column length constraints using validation trigger
CREATE OR REPLACE FUNCTION public.validate_consultation_input()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
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
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_consultation_before_insert
  BEFORE INSERT OR UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_consultation_input();
