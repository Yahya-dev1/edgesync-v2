-- ─── 1. Add is_settled column to master_trades ───────────────────────────────
ALTER TABLE public.master_trades
  ADD COLUMN IF NOT EXISTS is_settled BOOLEAN NOT NULL DEFAULT false;

-- ─── 2. Replace trigger function FIRST so that when step 4 fires it, ─────────
--        the new is_settled = false filter is already in place.
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
      SELECT pnl_percentage
      FROM   master_trades
      WHERE  trader_name = v_trader_name
        AND  is_settled  = false        -- only open / unsettled trades
        AND  (v_user.started_at IS NULL OR opened_at >= v_user.started_at)
      ORDER BY opened_at ASC
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

-- ─── 3. Backfill original_deposit for each active copying user ────────────────
--   Advances original_deposit by the compounded P&L of every already-closed
--   trade that was in scope for that user (opened_at >= started_at).
--   This preserves current balances exactly while switching the trigger
--   to only compound is_settled = false trades going forward.
DO $$
DECLARE
  v_user  RECORD;
  v_trade RECORD;
  v_base  NUMERIC;
BEGIN
  FOR v_user IN
    SELECT user_id, original_deposit, started_at, trader_name
    FROM   public.user_copy_trading
    WHERE  is_copying       = true
      AND  original_deposit IS NOT NULL
  LOOP
    v_base := v_user.original_deposit;

    FOR v_trade IN
      SELECT pnl_percentage
      FROM   public.master_trades
      WHERE  trader_name = v_user.trader_name
        AND  is_active   = false
        AND  (v_user.started_at IS NULL OR opened_at >= v_user.started_at)
      ORDER BY opened_at ASC
    LOOP
      v_base := v_base * (1 + v_trade.pnl_percentage / 100.0);
    END LOOP;

    UPDATE public.user_copy_trading
    SET    original_deposit = v_base
    WHERE  user_id   = v_user.user_id
      AND  is_copying = true;
  END LOOP;
END $$;

-- ─── 4. Mark all existing closed trades as settled ────────────────────────────
--   Trigger fires here. With the new function (step 2) already in place and
--   original_deposit backfilled (step 3), balances are computed correctly.
UPDATE public.master_trades
SET    is_settled = true
WHERE  is_active  = false;
