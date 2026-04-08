
ALTER TABLE public.buddy_waiting_users
ADD COLUMN match_fee_type text NOT NULL DEFAULT 'free',
ADD COLUMN match_fee integer NOT NULL DEFAULT 0;
