create index if not exists merchant_members_invited_by_idx
  on public.merchant_members(invited_by)
  where invited_by is not null;

create index if not exists merchant_invitations_created_by_idx
  on public.merchant_invitations(created_by)
  where created_by is not null;

drop policy if exists "public can read active staff working hours"
  on public.staff_working_hours;

drop policy if exists "owners manage staff working hours"
  on public.staff_working_hours;

create policy "staff working hours readable by public or owner"
  on public.staff_working_hours for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.salon_staff st
      join public.salons s on s.id = st.salon_id
      where st.id = staff_working_hours.staff_id
        and (
          (
            staff_working_hours.is_active = true
            and st.is_active = true
            and s.status = 'active'
          )
          or s.owner_id = (select auth.uid())
        )
    )
  );

create policy "owners insert staff working hours"
  on public.staff_working_hours for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.salon_staff st
      join public.salons s on s.id = st.salon_id
      where st.id = staff_working_hours.staff_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy "owners update staff working hours"
  on public.staff_working_hours for update
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

create policy "owners delete staff working hours"
  on public.staff_working_hours for delete
  to authenticated
  using (
    exists (
      select 1
      from public.salon_staff st
      join public.salons s on s.id = st.salon_id
      where st.id = staff_working_hours.staff_id
        and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists "owners manage merchant members"
  on public.merchant_members;

create policy "owners insert merchant members"
  on public.merchant_members for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.salons s
      where s.id = merchant_members.salon_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy "owners update merchant members"
  on public.merchant_members for update
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

create policy "owners delete merchant members"
  on public.merchant_members for delete
  to authenticated
  using (
    exists (
      select 1
      from public.salons s
      where s.id = merchant_members.salon_id
        and s.owner_id = (select auth.uid())
    )
  );
