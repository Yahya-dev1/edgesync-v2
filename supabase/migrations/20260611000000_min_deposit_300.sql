-- Enforce the $300 minimum deposit at the database level.
--
-- Client-side validation in the deposit UI (num < 300) can be bypassed by
-- calling Supabase directly with a user's JWT, so the user-insert RLS policy
-- must also reject amounts below the minimum. This is the true backend
-- enforcement boundary for user-initiated deposits.
--
-- We intentionally do NOT use a table-wide CHECK constraint: admin writes use
-- the service role (bypassing RLS) for corrections, and a CHECK would re-validate
-- on every UPDATE, breaking admin approve/reject of existing sub-$300 legacy
-- deposits. Scoping the rule to the user INSERT policy avoids both problems.

DROP POLICY IF EXISTS "users_insert_own_deposits" ON public.deposits;
CREATE POLICY "users_insert_own_deposits"
  ON public.deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id AND amount >= 300);
