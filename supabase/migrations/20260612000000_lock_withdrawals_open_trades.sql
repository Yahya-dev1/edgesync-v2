-- ─── Lock withdrawals while a copied trade is still open ─────────────────────
-- Business rule: a user who is copy-trading may not request a withdrawal while
-- the trader they copy has an OPEN (is_active = true) position inside the user's
-- copy window (opened_at >= started_at). The balance is floating/unrealised
-- until that trade settles (closes), so withdrawals only unlock once no open
-- trade remains. This is enforced here at the database level as a backstop to
-- the client-side gate on the withdraw page.
--
-- Trades opened before the user began copying don't affect their balance, so
-- they don't block. A user who isn't copying is never blocked by this rule.

CREATE OR REPLACE FUNCTION public.block_withdrawal_when_trade_open()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM   user_copy_trading uct
    JOIN   master_trades     mt ON mt.trader_name = uct.trader_name
    WHERE  uct.user_id    = NEW.user_id
      AND  uct.is_copying = true
      AND  mt.is_active   = true
      AND  (uct.started_at IS NULL OR mt.opened_at >= uct.started_at)
  ) THEN
    RAISE EXCEPTION 'A trade is currently open. Withdrawals are available once your trade is settled.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS block_withdrawal_when_trade_open ON public.withdrawals;

CREATE TRIGGER block_withdrawal_when_trade_open
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.block_withdrawal_when_trade_open();
