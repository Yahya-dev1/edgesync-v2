CREATE TABLE public.marketing_accounts (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name    text NOT NULL,
  initials     text NOT NULL,
  avatar_color text NOT NULL,
  trades       jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_pnl    numeric NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- RLS enabled so anon/authenticated can never read via Data API;
-- all access goes through the service-role key in server actions.
ALTER TABLE public.marketing_accounts ENABLE ROW LEVEL SECURITY;
