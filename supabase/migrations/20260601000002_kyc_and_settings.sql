-- ── kyc_submissions table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_front_url  TEXT NOT NULL,
  id_back_url   TEXT NOT NULL,
  status        TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.kyc_submissions TO authenticated;

CREATE POLICY "users_read_own_kyc"
  ON public.kyc_submissions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "users_insert_own_kyc"
  ON public.kyc_submissions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "users_update_own_kyc"
  ON public.kyc_submissions FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── Profiles: DELETE policy for account deletion ──────────────
CREATE POLICY "users_delete_own_profile"
  ON public.profiles FOR DELETE TO authenticated
  USING ((select auth.uid()) = id);

-- ── kyc-documents storage bucket ──────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents', 'kyc-documents', false, 10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/jpg','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "kyc_user_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = (select auth.uid())::text);

CREATE POLICY "kyc_user_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = (select auth.uid())::text);

CREATE POLICY "kyc_user_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = (select auth.uid())::text);
