create table public.telegram_users (
  telegram_user_id bigint primary key,
  first_name text not null,
  last_name text,
  username text,
  language_code text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings
  add column telegram_user_id bigint references public.telegram_users(telegram_user_id) on delete set null;

create index bookings_telegram_user_idx
  on public.bookings(telegram_user_id);

alter table public.telegram_users enable row level security;

grant select, insert, update on table public.telegram_users to service_role;
