revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Best-effort lock-down for PostGIS SECURITY DEFINER helpers. On this
-- Supabase project these grants remain extension-managed while PostGIS lives
-- in public, so advisors can still surface them after this migration.
revoke execute on function public.st_estimatedextent(text, text)
  from public, anon, authenticated;

revoke execute on function public.st_estimatedextent(text, text, text)
  from public, anon, authenticated;

revoke execute on function public.st_estimatedextent(text, text, text, boolean)
  from public, anon, authenticated;
