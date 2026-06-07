-- ─── 1. Create user_trade_settlements table ──────────────────────────────────
-- Tracks which trades have already been "locked in" for a specific user.
-- Used to exclude those trades from future P&L compounding for that user,
-- e.g. after a withdrawal freezes their current open trades as the new base.
CREATE TABLE IF NOT EXISTS public.user_trade_settlements (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  trade_id   uuid        NOT NULL REFERENCES public.master_trades(id) ON DELETE CASCADE,
  settled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, trade_id)
);

ALTER TABLE public.user_trade_settlements ENABLE ROW LEVEL SECURITY;

-- ─── 2. Update trigger BEFORE any DML that fires it ──────────────────────────
-- Adds a per-user exclusion: skip any trade_id that appears in
-- user_trade_settlements for the current user, on top of the existing
-- global is_settled = false filter.
CREATE OR REPLACE FUNCTION public.update_user_balances_from_trades()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user        RECORD;
  v_trade       RECORD;
  v_balance     NUMERIC;
  v_trader_name TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_trader_name := OLD.trader_name;
  ELSE
    v_trader_name := NEW.trader_name;
  END IF;

  FOR v_user IN
    SELECT uct.user_id, uct.original_deposit, uct.started_at
    FROM   user_copy_trading uct
    WHERE  uct.is_copying       = true
      AND  uct.trader_name      = v_trader_name
      AND  uct.original_deposit IS NOT NULL
  LOOP
    v_balance := v_user.original_deposit;

    FOR v_trade IN
      SELECT mt.pnl_percentage
      FROM   master_trades mt
      WHERE  mt.trader_name = v_trader_name
        AND  mt.is_settled  = false
        AND  (v_user.started_at IS NULL OR mt.opened_at >= v_user.started_at)
        AND  NOT EXISTS (
               SELECT 1
               FROM   user_trade_settlements uts
               WHERE  uts.user_id  = v_user.user_id
                 AND  uts.trade_id = mt.id
             )
      ORDER BY mt.opened_at ASC
    LOOP
      v_balance := v_balance * (1 + v_trade.pnl_percentage / 100.0);
    END LOOP;

    UPDATE profiles
    SET    balance = v_balance
    WHERE  id = v_user.user_id;
  END LOOP;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
