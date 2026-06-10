-- ─── Reverse settled-trade profit on deletion ────────────────────────────────
-- Problem: when an admin deletes a trade whose profit was already settled into
-- original_deposit (closed → locked), the old trigger recomputed balance as
-- original_deposit × ∏(unsettled). The settled trade's profit lived inside
-- original_deposit and was therefore never reversed — the gain stuck around.
--
-- Fix: track each copy's TRUE deposit baseline (deposit_base = approved deposits
-- − approved withdrawals) and, on ANY trade deletion, fully rebuild from it:
--   balance          = deposit_base compounded through ALL remaining in-window
--                      trades (settled + unsettled) in opened_at order
--   original_deposit = deposit_base compounded through only the remaining
--                      SETTLED trades (what stays locked)
-- INSERT/UPDATE behaviour is unchanged.

ALTER TABLE public.user_copy_trading
  ADD COLUMN IF NOT EXISTS deposit_base numeric;

-- Backfill: true principal = approved deposits − approved withdrawals.
UPDATE public.user_copy_trading uct
SET deposit_base = GREATEST(
  COALESCE((SELECT SUM(d.amount) FROM public.deposits d
            WHERE d.user_id = uct.user_id AND d.status = 'approved'), 0)
  - COALESCE((SELECT SUM(w.amount) FROM public.withdrawals w
              WHERE w.user_id = uct.user_id AND w.status = 'approved'), 0),
  0
)
WHERE uct.deposit_base IS NULL;

-- Rows with no approved-deposit history fall back to their current baseline.
UPDATE public.user_copy_trading
SET deposit_base = original_deposit
WHERE (deposit_base IS NULL OR deposit_base = 0) AND original_deposit IS NOT NULL;

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
  v_locked      NUMERIC;
  v_trader_name TEXT;
  v_is_closing  BOOLEAN := false;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_trader_name := OLD.trader_name;
  ELSE
    v_trader_name := NEW.trader_name;
  END IF;

  -- ── DELETE: full rebuild from the true deposit baseline ──────────────────
  -- A deleted trade must vanish from history, including any profit it had
  -- locked into original_deposit. Recompound every remaining in-window trade
  -- from deposit_base in chronological order.
  IF TG_OP = 'DELETE' THEN
    FOR v_user IN
      SELECT uct.user_id,
             COALESCE(uct.deposit_base, uct.original_deposit) AS base,
             uct.started_at
      FROM   user_copy_trading uct
      WHERE  uct.is_copying  = true
        AND  uct.trader_name = v_trader_name
        AND  COALESCE(uct.deposit_base, uct.original_deposit) IS NOT NULL
    LOOP
      v_balance := v_user.base;
      v_locked  := v_user.base;

      FOR v_trade IN
        SELECT mt.id, mt.pnl_percentage
        FROM   master_trades mt
        WHERE  mt.trader_name = v_trader_name
          AND  (v_user.started_at IS NULL OR mt.opened_at >= v_user.started_at)
        ORDER BY mt.opened_at ASC
      LOOP
        v_balance := v_balance * (1 + v_trade.pnl_percentage / 100.0);
        IF EXISTS (
          SELECT 1 FROM user_trade_settlements uts
          WHERE  uts.user_id = v_user.user_id AND uts.trade_id = v_trade.id
        ) THEN
          v_locked := v_locked * (1 + v_trade.pnl_percentage / 100.0);
        END IF;
      END LOOP;

      UPDATE profiles
      SET    balance = v_balance
      WHERE  id = v_user.user_id;

      UPDATE user_copy_trading
      SET    original_deposit = v_locked
      WHERE  user_id = v_user.user_id AND is_copying = true;
    END LOOP;

    RETURN OLD;
  END IF;

  -- ── INSERT / UPDATE (unchanged) ─────────────────────────────────────────
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
      UPDATE user_copy_trading
      SET    original_deposit = v_user.original_deposit * (1 + NEW.pnl_percentage / 100.0)
      WHERE  user_id = v_user.user_id
        AND  is_copying = true;

      INSERT INTO user_trade_settlements (user_id, trade_id)
      VALUES (v_user.user_id, NEW.id)
      ON CONFLICT (user_id, trade_id) DO NOTHING;
    END LOOP;
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

  RETURN NEW;
END;
$$;
