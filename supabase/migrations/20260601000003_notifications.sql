-- Notifications table
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;

CREATE POLICY "users_select_own_notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_update_own_notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: account created
CREATE OR REPLACE FUNCTION public.notify_account_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, message)
  VALUES (NEW.id, 'account_created', 'Welcome to EdgeSync Markets! Your account has been created.');
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_account_created() FROM PUBLIC;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_account_created();

-- Trigger: deposit status
CREATE OR REPLACE FUNCTION public.notify_deposit_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (NEW.user_id, 'deposit_approved',
      'Your deposit of $' || TO_CHAR(NEW.amount, 'FM999,999,999.00') || ' has been approved.');
  ELSIF NEW.status = 'pending' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'pending') THEN
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (NEW.user_id, 'deposit_pending',
      'Your deposit of $' || TO_CHAR(NEW.amount, 'FM999,999,999.00') || ' is being processed.');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_deposit_status() FROM PUBLIC;

CREATE TRIGGER on_deposit_status_change
  AFTER INSERT OR UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.notify_deposit_status();

-- Trigger: withdrawal status
CREATE OR REPLACE FUNCTION public.notify_withdrawal_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (NEW.user_id, 'withdrawal_approved',
      'Your withdrawal of $' || TO_CHAR(NEW.amount, 'FM999,999,999.00') || ' has been approved.');
  ELSIF NEW.status = 'rejected' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'rejected') THEN
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (NEW.user_id, 'withdrawal_rejected',
      'Your withdrawal of $' || TO_CHAR(NEW.amount, 'FM999,999,999.00') || ' was rejected.');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_withdrawal_status() FROM PUBLIC;

CREATE TRIGGER on_withdrawal_status_change
  AFTER INSERT OR UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.notify_withdrawal_status();

-- Trigger: copy trading
CREATE OR REPLACE FUNCTION public.notify_copy_trading()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_copying = true THEN
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (NEW.user_id, 'copying_started',
      'You are now copying ' || NEW.trader_name || '.');
  ELSIF TG_OP = 'UPDATE' AND NEW.is_copying = false AND OLD.is_copying = true THEN
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (NEW.user_id, 'copying_stopped',
      'You have stopped copying ' || NEW.trader_name || '.');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_copy_trading() FROM PUBLIC;

CREATE TRIGGER on_copy_trading_change
  AFTER INSERT OR UPDATE ON public.user_copy_trading
  FOR EACH ROW EXECUTE FUNCTION public.notify_copy_trading();
