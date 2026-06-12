-- ============================================================
-- Security hardening (review 2026-06-12)
-- Closes balance/principal tampering, forge-able statuses, unauthorized
-- RPC execution. Server actions get their own admin checks in app code.
-- ============================================================

-- ─── 1. profiles: balance is NOT user-writable ───────────────────────────────
-- Column-only REVOKE is ignored while a table-level grant exists, so drop the
-- table grant and re-grant ONLY full_name. balance is mutated exclusively by
-- service-role server actions and the trade-settlement trigger.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT  UPDATE (full_name) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS users_update_own_profile ON public.profiles;
CREATE POLICY users_update_own_profile ON public.profiles
  FOR UPDATE TO authenticated
  USING      ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ─── 2. increment_balance(): not callable by users + fixed search_path ────────
ALTER FUNCTION public.increment_balance(uuid, numeric) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.increment_balance(uuid, numeric)
  FROM PUBLIC, anon, authenticated;

-- ─── 3. user_copy_trading: server authoritative for the financial baseline ────
-- Users may flip is_copying (start/stop) but never set original_deposit /
-- deposit_base / started_at. A BEFORE trigger derives them from approved
-- deposits (else current balance) on insert and freezes them on user updates.
-- INSERT is left granted so existing clients keep working — the trigger
-- overrides whatever values they send.
REVOKE UPDATE ON public.user_copy_trading FROM anon, authenticated;
GRANT  UPDATE (is_copying) ON public.user_copy_trading TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_copy_trading_baseline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base numeric;
  v_role text := coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '');
BEGIN
  -- Service-role (admin server actions) sets these columns directly.
  IF v_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_base
    FROM   deposits
    WHERE  user_id = NEW.user_id AND status = 'approved';

    IF v_base = 0 THEN
      SELECT COALESCE(balance, 0) INTO v_base FROM profiles WHERE id = NEW.user_id;
    END IF;

    NEW.started_at       := now();
    NEW.original_deposit := v_base;
    NEW.deposit_base     := v_base;
  ELSE  -- UPDATE: a user may not move the baseline
    NEW.started_at       := OLD.started_at;
    NEW.original_deposit := OLD.original_deposit;
    NEW.deposit_base     := OLD.deposit_base;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_copy_trading_baseline ON public.user_copy_trading;
CREATE TRIGGER enforce_copy_trading_baseline
  BEFORE INSERT OR UPDATE ON public.user_copy_trading
  FOR EACH ROW EXECUTE FUNCTION public.enforce_copy_trading_baseline();

-- ─── 4. Follower counts maintained server-side (replaces client RPCs) ─────────
CREATE OR REPLACE FUNCTION public.sync_trader_followers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_copying THEN
      UPDATE traders SET followers = followers + 1 WHERE name = NEW.trader_name;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_copying THEN
      UPDATE traders SET followers = GREATEST(followers - 1, 0) WHERE name = OLD.trader_name;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_copying AND NOT NEW.is_copying THEN
      UPDATE traders SET followers = GREATEST(followers - 1, 0) WHERE name = OLD.trader_name;
    ELSIF NOT OLD.is_copying AND NEW.is_copying THEN
      UPDATE traders SET followers = followers + 1 WHERE name = NEW.trader_name;
    ELSIF OLD.is_copying AND NEW.is_copying AND OLD.trader_name <> NEW.trader_name THEN
      UPDATE traders SET followers = GREATEST(followers - 1, 0) WHERE name = OLD.trader_name;
      UPDATE traders SET followers = followers + 1 WHERE name = NEW.trader_name;
    END IF;
  END IF;
  RETURN NULL;  -- AFTER trigger
END;
$$;

DROP TRIGGER IF EXISTS sync_trader_followers ON public.user_copy_trading;
CREATE TRIGGER sync_trader_followers
  AFTER INSERT OR UPDATE OR DELETE ON public.user_copy_trading
  FOR EACH ROW EXECUTE FUNCTION public.sync_trader_followers();

REVOKE EXECUTE ON FUNCTION public.increment_followers(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_followers(text) FROM PUBLIC, anon, authenticated;

-- ─── 5. Users cannot forge deposit / withdrawal status ────────────────────────
-- deposits: single INSERT policy (>= $300, pending only) + own-row SELECT.
DROP POLICY IF EXISTS "Users can insert own deposits" ON public.deposits;
DROP POLICY IF EXISTS users_insert_own_deposits        ON public.deposits;
DROP POLICY IF EXISTS "Users can view own deposits"     ON public.deposits;
DROP POLICY IF EXISTS users_read_own_deposits           ON public.deposits;

CREATE POLICY deposits_insert_own ON public.deposits
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id AND amount >= 300 AND status = 'pending');
CREATE POLICY deposits_select_own ON public.deposits
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- withdrawals: dedupe to one INSERT (pending only) + own-row SELECT.
-- (admin SELECT/UPDATE policies remain untouched.)
DROP POLICY IF EXISTS users_insert_own_withdrawals       ON public.withdrawals;
DROP POLICY IF EXISTS "users can insert own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS users_read_own_withdrawals         ON public.withdrawals;
DROP POLICY IF EXISTS "users can read own withdrawals"   ON public.withdrawals;

CREATE POLICY withdrawals_insert_own ON public.withdrawals
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id AND status = 'pending' AND amount > 0);
CREATE POLICY withdrawals_select_own ON public.withdrawals
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ─── 6. Trigger-only SECURITY DEFINER functions: not callable as RPC ──────────
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_account_created()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_copy_trading()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_deposit_status()            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_withdrawal_status()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_conversation_updated_at()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_balances_from_trades() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.block_withdrawal_when_trade_open() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_copy_trading_baseline()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_trader_followers()            FROM PUBLIC, anon, authenticated;
