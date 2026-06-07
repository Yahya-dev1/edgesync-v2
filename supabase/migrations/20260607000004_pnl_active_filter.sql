-- ─── 1. Update trigger: filter is_active = true instead of is_settled = false ──
-- Open (active) trades compound against original_deposit. Closed trades are
-- permanently excluded. Per-user withdrawal settlements (user_trade_settlements)
-- are still respected as a secondary filter.
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
        AND  mt.is_active   = true
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

-- ─── 2. One-time state fix ────────────────────────────────────────────────────
-- Snap original_deposit = profiles.balance for all active copying users, so
-- every account starts from a clean baseline.
UPDATE public.user_copy_trading uct
SET    original_deposit = (
         SELECT p.balance
         FROM   public.profiles p
         WHERE  p.id = uct.user_id
       )
WHERE  uct.is_copying = true;

-- Settle any currently active trades per-user so the trigger doesn't
-- double-count them against the freshly snapped original_deposit.
INSERT INTO public.user_trade_settlements (user_id, trade_id)
SELECT uct.user_id, mt.id
FROM   public.user_copy_trading uct
CROSS  JOIN public.master_trades mt
WHERE  uct.is_copying = true
  AND  mt.is_active   = true
ON CONFLICT (user_id, trade_id) DO NOTHING;
