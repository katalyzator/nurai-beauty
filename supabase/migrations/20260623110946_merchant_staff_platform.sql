do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'merchant_member_role'
      and n.nspname = 'public'
  ) then
    create type public.merchant_member_role as enum (
      'owner',
      'admin',
      'manager',
      'staff'
    );
  end if;
end $$;

alter table public.salon_staff
  add column if not exists specialties text[] not null default '{}'::text[],
  add column if not exists rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  add column if not exists review_count integer not null default 0 check (review_count >= 0),
  add column if not exists sort_order integer not null default 0;

create table public.staff_working_hours (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.salon_staff(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint staff_working_hours_time_order check (ends_at > starts_at),
  constraint staff_working_hours_unique_day unique (staff_id, weekday)
);

create index staff_working_hours_staff_idx
  on public.staff_working_hours(staff_id);

create table public.merchant_members (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.merchant_member_role not null default 'staff',
  is_active boolean not null default true,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchant_members_unique_profile unique (salon_id, profile_id)
);

create index merchant_members_profile_idx
  on public.merchant_members(profile_id);

create table public.merchant_invitations (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  role public.merchant_member_role not null default 'staff',
  invitee_name text,
  phone text,
  telegram_username text,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index merchant_invitations_salon_idx
  on public.merchant_invitations(salon_id);

alter table public.staff_working_hours enable row level security;
alter table public.merchant_members enable row level security;
alter table public.merchant_invitations enable row level security;

grant select on table public.staff_working_hours to anon, authenticated;
grant select, insert, update, delete on table public.staff_working_hours to service_role;
grant select, insert, update, delete on table public.merchant_members to service_role;
grant select, insert, update, delete on table public.merchant_invitations to service_role;
grant select, insert, update on table public.merchant_members to authenticated;
grant select, insert, update on table public.merchant_invitations to authenticated;

create policy "public can read active staff working hours"
  on public.staff_working_hours for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.salon_staff st
      join public.salons s on s.id = st.salon_id
      where st.id = staff_working_hours.staff_id
        and st.is_active = true
        and s.status = 'active'
    )
  );

create policy "owners manage staff working hours"
  on public.staff_working_hours for all
  to authenticated
  using (
    exists (
      select 1
      from public.salon_staff st
      join public.salons s on s.id = st.salon_id
      where st.id = staff_working_hours.staff_id
        and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.salon_staff st
      join public.salons s on s.id = st.salon_id
      where st.id = staff_working_hours.staff_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy "merchant members can read own salons"
  on public.merchant_members for select
  to authenticated
  using (
    profile_id = (select auth.uid())
    or exists (
      select 1
      from public.salons s
      where s.id = merchant_members.salon_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy "owners manage merchant members"
  on public.merchant_members for all
  to authenticated
  using (
    exists (
      select 1
      from public.salons s
      where s.id = merchant_members.salon_id
        and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.salons s
      where s.id = merchant_members.salon_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy "owners manage merchant invitations"
  on public.merchant_invitations for all
  to authenticated
  using (
    exists (
      select 1
      from public.salons s
      where s.id = merchant_invitations.salon_id
        and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.salons s
      where s.id = merchant_invitations.salon_id
        and s.owner_id = (select auth.uid())
    )
  );

update public.salon_staff st
set
  avatar_path = case s.slug
    when 'ala-too-beauty-studio' then 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=520&q=80'
    when 'erkindik-nails' then 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=520&q=80'
    when 'asanbay-glow' then 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=520&q=80'
    else st.avatar_path
  end,
  specialties = case s.slug
    when 'ala-too-beauty-studio' then array['Стрижки', 'Укладки', 'Окрашивание']
    when 'erkindik-nails' then array['Маникюр', 'Гель-лак', 'Дизайн']
    when 'asanbay-glow' then array['Чистка лица', 'Уход', 'Консультация']
    else st.specialties
  end,
  rating = case s.slug
    when 'ala-too-beauty-studio' then 4.9
    when 'erkindik-nails' then 4.8
    when 'asanbay-glow' then 4.9
    else st.rating
  end,
  review_count = case s.slug
    when 'ala-too-beauty-studio' then 42
    when 'erkindik-nails' then 31
    when 'asanbay-glow' then 36
    else st.review_count
  end,
  sort_order = 10
from public.salons s
where s.id = st.salon_id;

insert into public.salon_staff (
  salon_id,
  full_name,
  role_title,
  bio,
  avatar_path,
  specialties,
  rating,
  review_count,
  sort_order
)
select
  s.id,
  seed.full_name,
  seed.role_title,
  seed.bio,
  seed.avatar_path,
  seed.specialties,
  seed.rating,
  seed.review_count,
  seed.sort_order
from public.salons s
join (
  values
    (
      'ala-too-beauty-studio',
      'Элина',
      'Колорист',
      'Сложное окрашивание, тонирование и восстановление волос.',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=520&q=80',
      array['Окрашивание', 'Тонирование', 'Восстановление']::text[],
      4.7::numeric,
      19,
      20
    ),
    (
      'erkindik-nails',
      'Сезим',
      'Nail artist',
      'Дизайн ногтей, укрепление и аккуратный френч.',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=520&q=80',
      array['Дизайн', 'Френч', 'Укрепление']::text[],
      4.9::numeric,
      27,
      20
    ),
    (
      'asanbay-glow',
      'Нурайым',
      'Косметолог-эстетист',
      'Уходовые программы, пилинги и работа с чувствительной кожей.',
      'https://images.unsplash.com/photo-1558898479-33c0057a5d12?auto=format&fit=crop&w=520&q=80',
      array['Пилинг', 'Уход', 'Чувствительная кожа']::text[],
      4.8::numeric,
      22,
      20
    )
) as seed(
  salon_slug,
  full_name,
  role_title,
  bio,
  avatar_path,
  specialties,
  rating,
  review_count,
  sort_order
) on seed.salon_slug = s.slug
where not exists (
  select 1
  from public.salon_staff st
  where st.salon_id = s.id
    and st.full_name = seed.full_name
);

insert into public.staff_services (staff_id, service_id)
select st.id, sv.id
from public.salon_staff st
join public.services sv on sv.salon_id = st.salon_id
on conflict do nothing;

insert into public.staff_working_hours (staff_id, weekday, starts_at, ends_at)
select st.id, weekday, '10:00'::time, '20:00'::time
from public.salon_staff st
cross join generate_series(1, 6) as weekday
where st.is_active = true
on conflict (staff_id, weekday) do nothing;
