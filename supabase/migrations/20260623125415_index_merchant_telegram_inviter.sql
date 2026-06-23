create index if not exists merchant_telegram_members_invited_by_idx
  on public.merchant_telegram_members(invited_by_telegram_user_id);
