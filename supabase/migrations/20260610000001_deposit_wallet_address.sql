-- Move the deposit wallet address out of the hardcoded client constant and into
-- platform_settings so admins can change it without a deploy. Seed it with the
-- address that was previously hardcoded in app/dashboard/deposit/page.tsx.
INSERT INTO public.platform_settings (key, value)
VALUES ('deposit_wallet_address', 'TDAHiiJJFSarDNQpos63qSfLd9sr2QYyd5')
ON CONFLICT (key) DO NOTHING;
