insert into public.salons (name, slug, status, city, district, address, phone, instagram_url, description, price_tier, rating, review_count, location)
values
  ('Ala-Too Beauty Studio', 'ala-too-beauty-studio', 'active', 'Bishkek', 'Центр', 'пр. Чуй 132, Бишкек', '+996700000001', 'https://instagram.com/alatoo_beauty', 'Стрижки, укладки и брови рядом с площадью Ала-Тоо.', 3, 4.8, 24, st_setsrid(st_makepoint(74.6057, 42.8766), 4326)::geography),
  ('Erkindik Nails', 'erkindik-nails', 'active', 'Bishkek', 'Эркиндик', 'бульвар Эркиндик 45, Бишкек', '+996700000002', 'https://instagram.com/erkindik_nails', 'Ногтевая студия с быстрыми окнами на сегодня.', 2, 4.6, 18, st_setsrid(st_makepoint(74.6122, 42.8731), 4326)::geography),
  ('Asanbay Glow', 'asanbay-glow', 'active', 'Bishkek', 'Асанбай', 'ул. Аалы Токомбаева 21, Бишкек', '+996700000003', 'https://instagram.com/asanbay_glow', 'Косметология, уходовые процедуры и депиляция.', 3, 4.7, 31, st_setsrid(st_makepoint(74.6362, 42.8273), 4326)::geography);

insert into public.salon_staff (salon_id, full_name, role_title, bio)
select id, 'Айгерим', 'Старший мастер', 'Стрижки, укладки и консультация по окрашиванию.' from public.salons where slug = 'ala-too-beauty-studio'
union all
select id, 'Дана', 'Мастер ногтевого сервиса', 'Маникюр с покрытием и дизайн ногтей.' from public.salons where slug = 'erkindik-nails'
union all
select id, 'Мээрим', 'Косметолог', 'Чистка лица и уходовые процедуры.' from public.salons where slug = 'asanbay-glow';

insert into public.services (salon_id, category, name, description, duration_minutes, price_kgs)
select id, 'Волосы', 'Женская стрижка', 'Консультация, мытье, стрижка и легкая укладка.', 60, 1200 from public.salons where slug = 'ala-too-beauty-studio'
union all
select id, 'Ногти', 'Маникюр с гель-лаком', 'Классический маникюр с покрытием.', 90, 1500 from public.salons where slug = 'erkindik-nails'
union all
select id, 'Косметология', 'Чистка лица', 'Анализ кожи и глубокая очищающая процедура.', 75, 2200 from public.salons where slug = 'asanbay-glow';

insert into public.staff_services (staff_id, service_id)
select st.id, sv.id
from public.salon_staff st
join public.services sv on sv.salon_id = st.salon_id;
