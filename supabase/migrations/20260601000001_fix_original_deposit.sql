-- One-time repair: sync original_deposit to current balance for active copying users
-- where original_deposit was never set (NULL or 0), causing P&L to inflate from zero.
UPDATE user_copy_trading
SET original_deposit = p.balance
FROM profiles p
WHERE user_copy_trading.user_id = p.id
  AND user_copy_trading.is_copying = true
  AND (user_copy_trading.original_deposit IS NULL OR user_copy_trading.original_deposit = 0);
