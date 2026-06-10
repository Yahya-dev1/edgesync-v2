-- ─── P&L: settle trades on close, inside the balance trigger ──────────────────
-- New model:
--   • profiles.balance = original_deposit compounded by EVERY unsettled trade
--     (open OR closed) in the user's copy window.
--   • P&L (UI) = balance − original_deposit, so any unsettled trade — including
--     one inserted already-closed — shows as floating profit and STAYS visible.
--   • Settlement (locking profit into original_deposit) happens ONLY when an OPEN
--     trade transitions to closed, on withdrawal approval, or an admin balance
--     edit. Inserting a trade — open or closed — never settles.
--
-- This replaces the previous "filter is_active = true" behaviour, where closed
-- trades were excluded from compounding and an already-closed insert was settled
-- immediately by the application layer (so its profit never showed — P&L jumped
-- straight to $0). The open→closed settlement now lives in the trigger.

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
  v_is_closing  BOOLEAN := false;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_trader_name := OLD.trader_name;
  ELSE
    v_trader_name := NEW.trader_name;
  END IF;

  -- An OPEN→closed transition is the settlement event: lock the trade's profit
  -- into each eligible user's original_deposit and record a per-user settlement
  -- so it stops floating. Inserting a row that is already closed is NOT a
  -- transition, so it does not settle.
  IF TG_OP = 'UPDATE'
     AND OLD.is_active = true
     AND NEW.is_active = false THEN
    v_is_closing := true;
  END IF;

  IF v_is_closing THEN
    FOR v_user IN
      SELECT uct.user_id, uct.original_deposit
      FROM   user_copy_trading uct
      WHERE  uct.is_copying       = true
        AND  uct.trader_name      = v_trader_name
        AND  uct.original_deposit IS NOT NULL
        AND  (uct.started_at IS NULL OR NEW.opened_at >= uct.started_at)
        AND  NOT EXISTS (
               SELECT 1
               FROM   user_trade_settlements uts
               WHERE  uts.user_id  = uct.user_id
                 AND  uts.trade_id = NEW.id
             )
    LOOP
      -- Bump the baseline by exactly this trade's factor; because compounding is
      -- multiplicative this leaves balance unchanged while moving the trade's
      -- profit from "floating" into the locked baseline.
      UPDATE user_copy_trading
      SET    original_deposit = v_user.original_deposit * (1 + NEW.pnl_percentage / 100.0)
      WHERE  user_id = v_user.user_id
        AND  is_copying = true;

      INSERT INTO user_trade_settlements (user_id, trade_id)
      VALUES (v_user.user_id, NEW.id)
      ON CONFLICT (user_id, trade_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Recompute every copying user's balance from their (possibly just-bumped)
  -- original_deposit, compounding ALL unsettled trades — open or closed. A
  -- deleted trade is simply gone from this set, so balance falls back to the
  -- product of the remaining unsettled trades.
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

-- Publish original_deposit changes so the dashboard P&L resets the instant a
-- trade is settled (close / withdrawal / admin edit), not only on refresh.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE  pubname = 'supabase_realtime'
      AND  schemaname = 'public'
      AND  tablename = 'user_copy_trading'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_copy_trading;
  END IF;
END $$;
