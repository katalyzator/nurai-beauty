create policy "notifications server only"
  on public.notifications for all
  to anon, authenticated
  using (false)
  with check (false);

create policy "telegram users server only"
  on public.telegram_users for all
  to anon, authenticated
  using (false)
  with check (false);
