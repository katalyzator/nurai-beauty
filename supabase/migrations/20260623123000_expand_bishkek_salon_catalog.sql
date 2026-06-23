drop function if exists public.nearby_salons(double precision, double precision, integer);

create or replace function public.nearby_salons(
  lat double precision,
  lng double precision,
  radius_meters integer default 18000
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
  service_tags text[],
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
    coalesce(service_data.service_tags, '{}'::text[]) as service_tags,
    st_y(s.location::geometry) as latitude,
    st_x(s.location::geometry) as longitude,
    st_distance(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography) as distance_meters
  from public.salons s
  left join lateral (
    select array_agg(distinct tag order by tag) as service_tags
    from (
      select sv.category as tag
      from public.services sv
      where sv.salon_id = s.id and sv.is_active = true
      union
      select sv.name as tag
      from public.services sv
      where sv.salon_id = s.id and sv.is_active = true
    ) tags
  ) service_data on true
  where s.status = 'active'
    and st_dwithin(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography, radius_meters)
  order by distance_meters asc;
$$;

grant execute on function public.nearby_salons(double precision, double precision, integer) to anon, authenticated;

with seed_salons (
  name,
  slug,
  district,
  address,
  phone,
  instagram_url,
  description,
  price_tier,
  rating,
  review_count,
  longitude,
  latitude,
  cover_image_path
) as (
  values
    ('Vefa Hair Room', 'vefa-hair-room', 'Вефа', 'ул. Горького 27/1, Бишкек', '+996700000004', 'https://instagram.com/vefa_hair_room', 'Стрижки, окрашивание и укладки рядом с Vefa.', 3, 4.9::numeric, 44, 74.6252, 42.8568, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=82'),
    ('Tumar Brow Bar', 'tumar-brow-bar', 'Тунгуч', 'ул. Анкара 18, Бишкек', '+996700000005', 'https://instagram.com/tumar_brow', 'Брови, ресницы и быстрые коррекции.', 2, 4.7::numeric, 18, 74.6682, 42.8507, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=82'),
    ('Botanical Lash Studio', 'botanical-lash-studio', 'Центр', 'ул. Киевская 89, Бишкек', '+996700000006', 'https://instagram.com/botanical_lash', 'Ламинирование, наращивание ресниц и уход.', 2, 4.8::numeric, 29, 74.5988, 42.8751, 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1200&q=82'),
    ('Asia Mall Beauty', 'asia-mall-beauty', 'Юг-2', 'пр. Чынгыза Айтматова 3, Бишкек', '+996700000007', 'https://instagram.com/asia_mall_beauty', 'Полный beauty-день: волосы, ногти и макияж.', 4, 4.6::numeric, 52, 74.5861, 42.8397, 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=82'),
    ('Orto-Sai Nails', 'orto-sai-nails', 'Орто-Сай', 'ул. Суеркулова 16, Бишкек', '+996700000008', 'https://instagram.com/ortosai_nails', 'Маникюр, педикюр и укрепление ногтей.', 2, 4.8::numeric, 37, 74.6268, 42.8328, 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1200&q=82'),
    ('Jal Art Spa', 'jal-art-spa', 'Джал', 'ул. Тыналиева 19, Бишкек', '+996700000009', 'https://instagram.com/jal_art_spa', 'Массаж, уход за лицом и spa-программы.', 3, 4.7::numeric, 41, 74.5754, 42.8469, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=82'),
    ('Dordoi Beauty Point', 'dordoi-beauty-point', 'Дордой', 'ул. Кожевенная 74, Бишкек', '+996700000010', 'https://instagram.com/dordoi_beauty', 'Быстрые укладки, брови и ногти у рынка Дордой.', 1, 4.5::numeric, 23, 74.6624, 42.9352, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=82'),
    ('Mossovet Color Lab', 'mossovet-color-lab', 'Моссовет', 'ул. Байтик Баатыра 36, Бишкек', '+996700000011', 'https://instagram.com/mossovet_color', 'Сложное окрашивание и восстановление волос.', 4, 4.9::numeric, 67, 74.6201, 42.8664, 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1200&q=82'),
    ('Karven Skin Care', 'karven-skin-care', 'Центр', 'ул. Орозбекова 32, Бишкек', '+996700000012', 'https://instagram.com/karven_skin', 'Косметология, чистки и уходовые программы.', 4, 4.8::numeric, 58, 74.6041, 42.8698, 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=82'),
    ('Manas Nail House', 'manas-nail-house', 'Манас', 'пр. Манаса 41, Бишкек', '+996700000013', 'https://instagram.com/manas_nail_house', 'Маникюр, педикюр и nail-дизайн.', 2, 4.6::numeric, 34, 74.5915, 42.8722, 'https://images.unsplash.com/photo-1610992235683-e39b29219e87?auto=format&fit=crop&w=1200&q=82'),
    ('Osh Bazaar Brows', 'osh-bazaar-brows', 'Ошский рынок', 'ул. Бейшеналиева 20, Бишкек', '+996700000014', 'https://instagram.com/osh_bazaar_brows', 'Коррекция, окрашивание бровей и макияж.', 1, 4.4::numeric, 16, 74.5797, 42.8783, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1200&q=82'),
    ('7 Microdistrict Glow', 'seven-microdistrict-glow', '7 микрорайон', 'ул. Токомбаева 9, Бишкек', '+996700000015', 'https://instagram.com/7md_glow', 'Уход за лицом, депиляция и массаж.', 3, 4.7::numeric, 39, 74.6329, 42.8245, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=82'),
    ('Ak-Ordo Beauty', 'ak-ordo-beauty', 'Ак-Ордо', 'ул. Ахунбаева 188, Бишкек', '+996700000016', 'https://instagram.com/akordo_beauty', 'Семейный салон: волосы, ногти и брови.', 2, 4.5::numeric, 22, 74.5612, 42.8524, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=82'),
    ('Kalyk Akiev Hair', 'kalyk-akiev-hair', 'Запад', 'ул. Калык Акиева 95, Бишкек', '+996700000017', 'https://instagram.com/kalyk_hair', 'Стрижки, барбер-уголок и укладки.', 2, 4.6::numeric, 27, 74.5822, 42.8878, 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=82'),
    ('Iwa Massage Room', 'iwa-massage-room', 'Восток-5', 'ул. Чуй 219, Бишкек', '+996700000018', 'https://instagram.com/iwa_massage', 'Массаж, spa и восстановление после рабочего дня.', 3, 4.9::numeric, 48, 74.6402, 42.8749, 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=82'),
    ('Baytik Beauty Club', 'baytik-beauty-club', 'Байтик', 'ул. Байтик Баатыра 72, Бишкек', '+996700000019', 'https://instagram.com/baytik_beauty', 'Премиум-уход, макияж и окрашивание.', 4, 4.8::numeric, 61, 74.6218, 42.8511, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=82'),
    ('Tunguch Lash & Nails', 'tunguch-lash-nails', 'Тунгуч', 'ул. Жукеева-Пудовкина 110, Бишкек', '+996700000020', 'https://instagram.com/tunguch_lash_nails', 'Ресницы, маникюр и экспресс-записи.', 2, 4.7::numeric, 33, 74.6556, 42.8461, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=82')
)
insert into public.salons (
  name,
  slug,
  status,
  city,
  district,
  address,
  phone,
  instagram_url,
  description,
  price_tier,
  rating,
  review_count,
  location,
  cover_image_path
)
select
  name,
  slug,
  'active'::public.salon_status,
  'Bishkek',
  district,
  address,
  phone,
  instagram_url,
  description,
  price_tier,
  rating,
  review_count,
  st_setsrid(st_makepoint(longitude, latitude), 4326)::geography,
  cover_image_path
from seed_salons
on conflict (slug) do update
set
  name = excluded.name,
  status = excluded.status,
  district = excluded.district,
  address = excluded.address,
  phone = excluded.phone,
  instagram_url = excluded.instagram_url,
  description = excluded.description,
  price_tier = excluded.price_tier,
  rating = excluded.rating,
  review_count = excluded.review_count,
  location = excluded.location,
  cover_image_path = excluded.cover_image_path,
  updated_at = now();

insert into public.services (salon_id, category, name, description, duration_minutes, price_kgs)
select
  s.id,
  seed.category,
  seed.name,
  seed.description,
  seed.duration_minutes,
  seed.price_kgs
from public.salons s
join (
  values
    ('vefa-hair-room', 'Волосы', 'Женская стрижка', 'Мытье, стрижка и укладка.', 60, 1400),
    ('vefa-hair-room', 'Волосы', 'Окрашивание корней', 'Тон, уход и легкая укладка.', 120, 2800),
    ('tumar-brow-bar', 'Брови', 'Коррекция и окрашивание бровей', 'Форма, окрашивание и фиксация.', 45, 900),
    ('tumar-brow-bar', 'Брови', 'Ламинирование бровей', 'Ламинирование, уход и укладка.', 60, 1500),
    ('botanical-lash-studio', 'Брови', 'Ламинирование ресниц', 'Лифтинг, окрашивание и уход.', 75, 1800),
    ('botanical-lash-studio', 'Брови', 'Наращивание ресниц', 'Классика или мягкий объем.', 120, 2600),
    ('asia-mall-beauty', 'Волосы', 'Укладка на брашинг', 'Мытье и быстрая укладка.', 45, 1300),
    ('asia-mall-beauty', 'Ногти', 'Маникюр с покрытием', 'Классический маникюр и гель-лак.', 90, 1700),
    ('orto-sai-nails', 'Ногти', 'Маникюр с гель-лаком', 'Покрытие, выравнивание и уход.', 90, 1400),
    ('orto-sai-nails', 'Ногти', 'Педикюр', 'Аппаратный педикюр и покрытие.', 100, 1900),
    ('jal-art-spa', 'Массаж', 'Расслабляющий массаж', 'Массаж спины и шеи.', 60, 2200),
    ('jal-art-spa', 'Косметология', 'Уход за лицом', 'Очищение, маска и массаж лица.', 75, 2500),
    ('dordoi-beauty-point', 'Волосы', 'Экспресс-укладка', 'Быстрая укладка перед событием.', 40, 800),
    ('dordoi-beauty-point', 'Брови', 'Окрашивание бровей', 'Коррекция и цвет.', 35, 700),
    ('mossovet-color-lab', 'Волосы', 'Сложное окрашивание', 'Консультация, окрашивание и уход.', 180, 5200),
    ('mossovet-color-lab', 'Волосы', 'Восстановление волос', 'Уход и холодное восстановление.', 90, 2600),
    ('karven-skin-care', 'Косметология', 'Чистка лица', 'Комбинированная чистка и уход.', 90, 3000),
    ('karven-skin-care', 'Косметология', 'Пилинг', 'Поверхностный пилинг и восстановление.', 60, 2400),
    ('manas-nail-house', 'Ногти', 'Маникюр с дизайном', 'Маникюр, покрытие и простой дизайн.', 110, 1800),
    ('manas-nail-house', 'Ногти', 'Укрепление ногтей', 'Укрепление гелем и покрытие.', 100, 1900),
    ('osh-bazaar-brows', 'Брови', 'Коррекция бровей', 'Форма пинцетом и воском.', 30, 500),
    ('osh-bazaar-brows', 'Макияж', 'Дневной макияж', 'Легкий макияж на день.', 60, 1500),
    ('seven-microdistrict-glow', 'Косметология', 'Депиляция', 'Воск, сахар и уход после.', 45, 900),
    ('seven-microdistrict-glow', 'Массаж', 'Массаж лица', 'Скульптурный массаж лица.', 50, 1800),
    ('ak-ordo-beauty', 'Волосы', 'Мужская стрижка', 'Стрижка и оформление.', 45, 800),
    ('ak-ordo-beauty', 'Ногти', 'Маникюр без покрытия', 'Аккуратный маникюр и уход.', 45, 700),
    ('kalyk-akiev-hair', 'Волосы', 'Барбер-стрижка', 'Стрижка, окантовка и укладка.', 50, 1100),
    ('kalyk-akiev-hair', 'Волосы', 'Укладка', 'Укладка феном или стайлером.', 45, 900),
    ('iwa-massage-room', 'Массаж', 'Классический массаж', 'Общий массаж тела.', 90, 3000),
    ('iwa-massage-room', 'Массаж', 'Массаж спины', 'Спина, шея и плечи.', 45, 1600),
    ('baytik-beauty-club', 'Макияж', 'Вечерний макияж', 'Макияж с подготовкой кожи.', 90, 3500),
    ('baytik-beauty-club', 'Волосы', 'Тонирование волос', 'Тонирование и уход.', 120, 3600),
    ('tunguch-lash-nails', 'Брови', 'Наращивание ресниц', 'Классика или 2D.', 120, 2300),
    ('tunguch-lash-nails', 'Ногти', 'Экспресс-маникюр', 'Маникюр с однотонным покрытием.', 75, 1300)
) as seed(salon_slug, category, name, description, duration_minutes, price_kgs)
  on seed.salon_slug = s.slug
where not exists (
  select 1
  from public.services existing
  where existing.salon_id = s.id
    and existing.name = seed.name
);

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
    ('vefa-hair-room', 'Алина', 'Hair stylist', 'Стрижки и повседневные укладки.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=520&q=80', array['Стрижка', 'Укладка']::text[], 4.9::numeric, 34, 10),
    ('vefa-hair-room', 'Жанара', 'Колорист', 'Окрашивание и восстановление волос.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=520&q=80', array['Окрашивание', 'Уход']::text[], 4.8::numeric, 28, 20),
    ('tumar-brow-bar', 'Айдана', 'Brow master', 'Коррекция и ламинирование бровей.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=520&q=80', array['Брови', 'Ламинирование']::text[], 4.7::numeric, 18, 10),
    ('tumar-brow-bar', 'Раяна', 'Lash & brow artist', 'Ресницы, брови и мягкая архитектура формы.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=520&q=80', array['Ресницы', 'Брови']::text[], 4.8::numeric, 21, 20),
    ('botanical-lash-studio', 'Медина', 'Lash master', 'Ламинирование и классическое наращивание.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=520&q=80', array['Ресницы', 'Ламинирование']::text[], 4.8::numeric, 24, 10),
    ('asia-mall-beauty', 'Эльмира', 'Universal master', 'Волосы, ногти и быстрые сборы.', 'https://images.unsplash.com/photo-1558898479-33c0057a5d12?auto=format&fit=crop&w=520&q=80', array['Укладка', 'Маникюр']::text[], 4.6::numeric, 30, 10),
    ('orto-sai-nails', 'Бегимай', 'Nail master', 'Маникюр, педикюр и укрепление.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=520&q=80', array['Маникюр', 'Педикюр']::text[], 4.8::numeric, 32, 10),
    ('jal-art-spa', 'Арууке', 'Spa therapist', 'Массаж и уходовые процедуры.', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=520&q=80', array['Массаж', 'Уход']::text[], 4.7::numeric, 27, 10),
    ('dordoi-beauty-point', 'Назик', 'Express master', 'Быстрые укладки и брови.', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=520&q=80', array['Укладка', 'Брови']::text[], 4.5::numeric, 19, 10),
    ('mossovet-color-lab', 'Салтанат', 'Color expert', 'Сложный цвет и восстановление.', 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=520&q=80', array['Окрашивание', 'Восстановление']::text[], 4.9::numeric, 55, 10),
    ('karven-skin-care', 'Динара', 'Косметолог', 'Чистка, пилинги и уход.', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=520&q=80', array['Чистка лица', 'Пилинг']::text[], 4.8::numeric, 49, 10),
    ('manas-nail-house', 'Каныкей', 'Nail designer', 'Дизайн и укрепление ногтей.', 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=520&q=80', array['Дизайн', 'Укрепление']::text[], 4.6::numeric, 26, 10),
    ('osh-bazaar-brows', 'Малика', 'Brow master', 'Быстрая форма и окрашивание.', 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=520&q=80', array['Брови', 'Макияж']::text[], 4.4::numeric, 14, 10),
    ('seven-microdistrict-glow', 'Алия', 'Эстетист', 'Депиляция и массаж лица.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=520&q=80', array['Депиляция', 'Массаж лица']::text[], 4.7::numeric, 33, 10),
    ('ak-ordo-beauty', 'Нурзат', 'Universal master', 'Семейные стрижки и маникюр.', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=520&q=80', array['Стрижка', 'Маникюр']::text[], 4.5::numeric, 20, 10),
    ('kalyk-akiev-hair', 'Темир', 'Barber', 'Мужские стрижки и укладки.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=520&q=80', array['Барбер', 'Стрижка']::text[], 4.6::numeric, 24, 10),
    ('iwa-massage-room', 'Ирина', 'Massage therapist', 'Классический массаж и спина.', 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=520&q=80', array['Массаж', 'Спина']::text[], 4.9::numeric, 41, 10),
    ('baytik-beauty-club', 'Перизат', 'Makeup artist', 'Макияж, тонирование и сборы.', 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=520&q=80', array['Макияж', 'Волосы']::text[], 4.8::numeric, 53, 10),
    ('tunguch-lash-nails', 'Сайкал', 'Lash & nail master', 'Ресницы и экспресс-маникюр.', 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=520&q=80', array['Ресницы', 'Маникюр']::text[], 4.7::numeric, 28, 10)
) as seed(salon_slug, full_name, role_title, bio, avatar_path, specialties, rating, review_count, sort_order)
  on seed.salon_slug = s.slug
where not exists (
  select 1
  from public.salon_staff existing
  where existing.salon_id = s.id
    and existing.full_name = seed.full_name
);

insert into public.staff_services (staff_id, service_id)
select st.id, sv.id
from public.salon_staff st
join public.salons s on s.id = st.salon_id
join public.services sv on sv.salon_id = s.id
where s.slug in (
  'vefa-hair-room',
  'tumar-brow-bar',
  'botanical-lash-studio',
  'asia-mall-beauty',
  'orto-sai-nails',
  'jal-art-spa',
  'dordoi-beauty-point',
  'mossovet-color-lab',
  'karven-skin-care',
  'manas-nail-house',
  'osh-bazaar-brows',
  'seven-microdistrict-glow',
  'ak-ordo-beauty',
  'kalyk-akiev-hair',
  'iwa-massage-room',
  'baytik-beauty-club',
  'tunguch-lash-nails'
)
on conflict do nothing;

insert into public.staff_working_hours (staff_id, weekday, starts_at, ends_at)
select st.id, weekday, '10:00'::time, '20:00'::time
from public.salon_staff st
join public.salons s on s.id = st.salon_id
cross join generate_series(1, 6) as weekday
where s.slug in (
  'vefa-hair-room',
  'tumar-brow-bar',
  'botanical-lash-studio',
  'asia-mall-beauty',
  'orto-sai-nails',
  'jal-art-spa',
  'dordoi-beauty-point',
  'mossovet-color-lab',
  'karven-skin-care',
  'manas-nail-house',
  'osh-bazaar-brows',
  'seven-microdistrict-glow',
  'ak-ordo-beauty',
  'kalyk-akiev-hair',
  'iwa-massage-room',
  'baytik-beauty-club',
  'tunguch-lash-nails'
)
on conflict (staff_id, weekday) do nothing;
