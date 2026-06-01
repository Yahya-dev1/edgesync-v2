-- ============================================================
-- EdgeSync Markets — Withdrawals Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount         NUMERIC NOT NULL,
  wallet_address TEXT NOT NULL,
  status         TEXT DEFAULT 'pending' NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can read their own withdrawals
CREATE POLICY "users_read_own_withdrawals"
  ON public.withdrawals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own withdrawals
CREATE POLICY "users_insert_own_withdrawals"
  ON public.withdrawals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
