-- ─── support_conversations ────────────────────────────────────────
CREATE TABLE public.support_conversations (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'open',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── support_messages ────────────────────────────────────────────
CREATE TABLE public.support_messages (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_admin        boolean NOT NULL DEFAULT false,
  message         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────────
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages      ENABLE ROW LEVEL SECURITY;

-- ─── Grants ──────────────────────────────────────────────────────
GRANT SELECT, INSERT ON public.support_conversations TO authenticated;
GRANT UPDATE (status, updated_at) ON public.support_conversations TO authenticated;
GRANT SELECT, INSERT ON public.support_messages TO authenticated;

-- ─── Policies: support_conversations ────────────────────────────

-- Users see own; admins see all
CREATE POLICY "support_convs_select" ON public.support_conversations
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Users insert own conversations
CREATE POLICY "support_convs_insert" ON public.support_conversations
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admins update status / updated_at
CREATE POLICY "support_convs_update" ON public.support_conversations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ─── Policies: support_messages ──────────────────────────────────

-- Users see messages in their own conversations; admins see all
CREATE POLICY "support_msgs_select" ON public.support_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_conversations
      WHERE id = conversation_id AND user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Sender must be self; must own the conversation or be admin
CREATE POLICY "support_msgs_insert" ON public.support_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
    AND (
      EXISTS (
        SELECT 1 FROM public.support_conversations
        WHERE id = conversation_id AND user_id = (SELECT auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
      )
    )
  );

-- ─── Admins can read all profiles (for support conversation list) ─
CREATE POLICY "admins_read_all_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ─── Realtime ────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- ─── Trigger: keep conversation updated_at current ───────────────
CREATE OR REPLACE FUNCTION public.update_conversation_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.support_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.update_conversation_updated_at() FROM PUBLIC;

CREATE TRIGGER on_support_message_inserted
  AFTER INSERT ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_updated_at();
