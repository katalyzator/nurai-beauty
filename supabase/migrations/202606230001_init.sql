create extension if not exists postgis;
create extension if not exists pgcrypto;

create type public.user_role as enum ('client', 'merchant', 'staff', 'admin');
create type public.salon_status as enum ('draft', 'pending_review', 'active', 'suspended');
create type public.booking_status as enum ('new', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.booking_source as enum ('web', 'telegram', 'merchant_manual');
create type public.review_status as enum ('pending', 'published', 'hidden');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'client',
  full_name text,
  phone text,
  telegram_user_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.salons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  status public.salon_status not null default 'pending_review',
  city text not null default 'Bishkek',
  district text,
  address text not null,
  phone text,
  instagram_url text,
  description text,
  price_tier int not null default 2 check (price_tier between 1 and 4),
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  location geography(point, 4326) not null,
  cover_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index salons_location_idx on public.salons using gist(location);
create index salons_status_city_idx on public.salons(status, city);

create table public.salon_staff (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  full_name text not null,
  role_title text not null default 'Master',
  bio text,
  avatar_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index salon_staff_salon_idx on public.salon_staff(salon_id);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  category text not null,
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes between 10 and 600),
  price_kgs int not null check (price_kgs >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index services_salon_idx on public.services(salon_id);

create table public.staff_services (
  staff_id uuid not null references public.salon_staff(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (staff_id, service_id)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  staff_id uuid references public.salon_staff(id) on delete set null,
  client_profile_id uuid references public.profiles(id) on delete set null,
  client_name text not null,
  client_phone text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.booking_status not null default 'new',
  source public.booking_source not null default 'web',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_time_order check (end_at > start_at)
);

create index bookings_salon_start_idx on public.bookings(salon_id, start_at);
create index bookings_staff_start_idx on public.bookings(staff_id, start_at);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index reviews_salon_status_idx on public.reviews(salon_id, status);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  recipient_phone text,
  telegram_user_id bigint,
  channel text not null check (channel in ('telegram', 'sms', 'email')),
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.nearby_salons(
  lat double precision,
  lng double precision,
  radius_meters integer default 10000
)
returns table (
  id uuid,
  name text,
  slug text,
  city text,
  district text,
  address text,
  rating numeric,
  review_count int,
  price_tier int,
  cover_image_path text,
  latitude double precision,
  longitude double precision,
  distance_meters double precision
)
language sql
stable
security invoker
as $$
  select
    s.id,
    s.name,
    s.slug,
    s.city,
    s.district,
    s.address,
    s.rating,
    s.review_count,
    s.price_tier,
    s.cover_image_path,
    st_y(s.location::geometry) as latitude,
    st_x(s.location::geometry) as longitude,
    st_distance(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography) as distance_meters
  from public.salons s
  where s.status = 'active'
    and st_dwithin(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography, radius_meters)
  order by distance_meters asc;
$$;

alter table public.profiles enable row level security;
alter table public.salons enable row level security;
alter table public.salon_staff enable row level security;
alter table public.services enable row level security;
alter table public.staff_services enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

grant usage on schema public to anon, authenticated;
grant usage on type public.user_role to anon, authenticated;
grant usage on type public.salon_status to anon, authenticated;
grant usage on type public.booking_status to anon, authenticated;
grant usage on type public.booking_source to anon, authenticated;
grant usage on type public.review_status to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.salons to anon, authenticated;
grant update on table public.salons to authenticated;
grant select on table public.salon_staff to anon, authenticated;
grant select on table public.services to anon, authenticated;
grant select on table public.staff_services to anon, authenticated;
grant select, insert, update on table public.bookings to anon, authenticated;
grant select on table public.reviews to anon, authenticated;
grant execute on function public.nearby_salons(double precision, double precision, integer) to anon, authenticated;

create policy "profiles read own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "active salons public read"
  on public.salons for select
  to anon, authenticated
  using (status = 'active');

create policy "owners read own salons"
  on public.salons for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "owners update own salons"
  on public.salons for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "active salon staff public read"
  on public.salon_staff for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = salon_staff.salon_id and s.status = 'active'
    )
  );

create policy "active services public read"
  on public.services for select
  to anon, authenticated
  using (
    is_active = true and exists (
      select 1 from public.salons s
      where s.id = services.salon_id and s.status = 'active'
    )
  );

create policy "public can create bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

create policy "owners read own bookings"
  on public.bookings for select
  to authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = bookings.salon_id and s.owner_id = (select auth.uid())
    )
  );

create policy "owners update own bookings"
  on public.bookings for update
  to authenticated
  using (
    exists (
      select 1 from public.salons s
      where s.id = bookings.salon_id and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = bookings.salon_id and s.owner_id = (select auth.uid())
    )
  );

create policy "published reviews public read"
  on public.reviews for select
  to anon, authenticated
  using (status = 'published');
