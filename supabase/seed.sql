insert into public.salons (name, slug, status, city, district, address, phone, instagram_url, description, price_tier, rating, review_count, location)
values
  ('Ala-Too Beauty Studio', 'ala-too-beauty-studio', 'active', 'Bishkek', 'Center', 'Chuy Ave 132, Bishkek', '+996700000001', 'https://instagram.com/alatoo_beauty', 'Hair, nails, and brows near Ala-Too Square.', 3, 4.8, 24, st_setsrid(st_makepoint(74.6057, 42.8766), 4326)::geography),
  ('Erkindik Nails', 'erkindik-nails', 'active', 'Bishkek', 'Erkindik', 'Erkindik Blvd 45, Bishkek', '+996700000002', 'https://instagram.com/erkindik_nails', 'Nail studio with express manicure slots.', 2, 4.6, 18, st_setsrid(st_makepoint(74.6122, 42.8731), 4326)::geography),
  ('Asanbay Glow', 'asanbay-glow', 'active', 'Bishkek', 'Asanbay', 'Aaly Tokombaev St 21, Bishkek', '+996700000003', 'https://instagram.com/asanbay_glow', 'Cosmetology and waxing services.', 3, 4.7, 31, st_setsrid(st_makepoint(74.6362, 42.8273), 4326)::geography);

insert into public.salon_staff (salon_id, full_name, role_title, bio)
select id, 'Aigerim', 'Senior master', 'Haircuts, styling, and color consultation.' from public.salons where slug = 'ala-too-beauty-studio'
union all
select id, 'Dana', 'Nail master', 'Gel manicure and nail art.' from public.salons where slug = 'erkindik-nails'
union all
select id, 'Meerim', 'Cosmetologist', 'Face cleansing and skincare procedures.' from public.salons where slug = 'asanbay-glow';

insert into public.services (salon_id, category, name, description, duration_minutes, price_kgs)
select id, 'Hair', 'Women haircut', 'Consultation, wash, haircut, and light styling.', 60, 1200 from public.salons where slug = 'ala-too-beauty-studio'
union all
select id, 'Nails', 'Gel manicure', 'Classic manicure with gel polish.', 90, 1500 from public.salons where slug = 'erkindik-nails'
union all
select id, 'Cosmetology', 'Face cleansing', 'Skin analysis and deep cleansing procedure.', 75, 2200 from public.salons where slug = 'asanbay-glow';

insert into public.staff_services (staff_id, service_id)
select st.id, sv.id
from public.salon_staff st
join public.services sv on sv.salon_id = st.salon_id;
