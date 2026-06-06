-- Fix P&L compounding trigger to only include trades on or after each user's
-- copy-trading start date. Previously all historical master_trades were
-- compounded for every user, inflating balances for new joiners.
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
    FROM user_copy_trading uct
    WHERE uct.is_copying = true
      AND uct.trader_name = v_trader_name
      AND uct.original_deposit IS NOT NULL
  LOOP
    v_balance := v_user.original_deposit;

    FOR v_trade IN
      SELECT pnl_percentage
      FROM master_trades
      WHERE trader_name = v_trader_name
        AND (v_user.started_at IS NULL OR opened_at >= v_user.started_at)
      ORDER BY opened_at ASC
    LOOP
      v_balance := v_balance * (1 + v_trade.pnl_percentage / 100.0);
    END LOOP;

    UPDATE profiles
    SET balance = v_balance
    WHERE id = v_user.user_id;
  END LOOP;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
