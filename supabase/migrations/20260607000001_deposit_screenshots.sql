-- Add screenshot_url column to deposits table
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- Ensure RLS is enabled on deposits
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Users can read their own deposits (idempotent-safe via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'deposits' AND policyname = 'users_read_own_deposits'
  ) THEN
    CREATE POLICY "users_read_own_deposits"
      ON public.deposits FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can insert their own deposits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'deposits' AND policyname = 'users_insert_own_deposits'
  ) THEN
    CREATE POLICY "users_insert_own_deposits"
      ON public.deposits FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create deposit-screenshots storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deposit-screenshots',
  'deposit-screenshots',
  false,
  10485760,
  '{image/jpeg,image/png,image/webp,image/jpg}'
)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload into their own folder
DROP POLICY IF EXISTS "deposit_screenshots_insert" ON storage.objects;
CREATE POLICY "deposit_screenshots_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'deposit-screenshots' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- RLS: authenticated users can read their own screenshots
DROP POLICY IF EXISTS "deposit_screenshots_select" ON storage.objects;
CREATE POLICY "deposit_screenshots_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'deposit-screenshots' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
