create schema if not exists extensions;

-- PostGIS is not relocatable on this Supabase project, so spatial_ref_sys
-- remains in public. Keep the app RPC search_path fixed and review the
-- extension advisory separately before changing extension table access.

drop policy "active salons public read" on public.salons;
drop policy "owners read own salons" on public.salons;

create policy "active salons public read"
  on public.salons for select
  to anon
  using (status = 'active');

create policy "authenticated salons read active or owned"
  on public.salons for select
  to authenticated
  using (status = 'active' or owner_id = (select auth.uid()));

create policy "active staff services public read"
  on public.staff_services for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.salon_staff st
      join public.salons s on s.id = st.salon_id
      where st.id = staff_services.staff_id
        and st.is_active = true
        and s.status = 'active'
    )
  );

drop policy "public can create bookings" on public.bookings;

create policy "public can create bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (
    source in ('web'::public.booking_source, 'telegram'::public.booking_source)
    and exists (
      select 1
      from public.services sv
      join public.salons s on s.id = sv.salon_id
      where sv.id = bookings.service_id
        and sv.salon_id = bookings.salon_id
        and sv.is_active = true
        and s.status = 'active'
    )
    and (
      staff_id is null
      or exists (
        select 1
        from public.salon_staff st
        where st.id = bookings.staff_id
          and st.salon_id = bookings.salon_id
          and st.is_active = true
      )
    )
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
set search_path = public, extensions, pg_temp
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

create index if not exists salons_owner_idx
  on public.salons(owner_id)
  where owner_id is not null;

create index if not exists bookings_service_idx
  on public.bookings(service_id);

create index if not exists bookings_client_profile_idx
  on public.bookings(client_profile_id)
  where client_profile_id is not null;

create index if not exists notifications_booking_idx
  on public.notifications(booking_id)
  where booking_id is not null;

create index if not exists staff_services_service_idx
  on public.staff_services(service_id);
