create table if not exists public.merchant_telegram_members (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  telegram_user_id bigint not null references public.telegram_users(telegram_user_id) on delete cascade,
  role public.merchant_member_role not null default 'staff',
  is_active boolean not null default true,
  invited_by_telegram_user_id bigint references public.telegram_users(telegram_user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchant_telegram_members_unique_user unique (salon_id, telegram_user_id)
);

create index if not exists merchant_telegram_members_telegram_idx
  on public.merchant_telegram_members(telegram_user_id)
  where is_active = true;

create index if not exists merchant_telegram_members_salon_idx
  on public.merchant_telegram_members(salon_id)
  where is_active = true;

alter table public.merchant_invitations
  add column if not exists created_by_telegram_user_id bigint references public.telegram_users(telegram_user_id) on delete set null;

create index if not exists merchant_invitations_created_by_telegram_idx
  on public.merchant_invitations(created_by_telegram_user_id);

alter table public.merchant_telegram_members enable row level security;

grant select, insert, update, delete on table public.merchant_telegram_members to service_role;

create policy "merchant telegram members server only"
  on public.merchant_telegram_members for all
  to service_role
  using (true)
  with check (true);
