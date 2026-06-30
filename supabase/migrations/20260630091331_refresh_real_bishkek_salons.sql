-- Refresh the demo marketplace catalog with real Bishkek beauty businesses.
-- Sources used while preparing this dataset:
-- - Yandex Maps public listings for names, addresses, ratings, review counts, and phones when present.
-- - WE Project beauty salon roundup for confirming several known salon names/Instagram handles.
-- - OpenStreetMap/Overpass + Nominatim for coordinates and OSM POI confirmation.
--
-- Intentional product choice:
-- We do not invent real employees. Each salon gets a generic "Любой свободный мастер"
-- operational staff record so booking can work until the merchant owner replaces it.

with old_demo_slugs(slug) as (
  values
    ('seven-microdistrict-glow'),
    ('ak-ordo-beauty'),
    ('ala-too-beauty-studio'),
    ('asanbay-glow'),
    ('asia-mall-beauty'),
    ('baytik-beauty-club'),
    ('botanical-lash-studio'),
    ('dordoi-beauty-point'),
    ('erkindik-nails'),
    ('iwa-massage-room'),
    ('jal-art-spa'),
    ('kalyk-akiev-hair'),
    ('karven-skin-care'),
    ('manas-nail-house'),
    ('mossovet-color-lab'),
    ('orto-sai-nails'),
    ('osh-bazaar-brows'),
    ('tumar-brow-bar'),
    ('tunguch-lash-nails'),
    ('vefa-hair-room')
)
update public.salons s
set
  status = 'suspended',
  updated_at = now()
from old_demo_slugs old
where s.slug = old.slug;

with real_salons (
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
    ('Onstudio', 'onstudio-moscow', 'Ленинский', 'Moscow Street, 189A, Бишкек', null, null, 'Реальный beauty/nail salon из публичных карт: стрижки, ногти и базовые beauty-услуги.', 3, 4.2::numeric, 13, 74.5832150, 42.8707428, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=82'),
    ('Cheguevara', 'cheguevara-bishkek', 'Октябрьский', 'Baitik Baatyr Street, 65, Бишкек', null, null, 'Beauty salon и barber-направление на Байтик Баатыра.', 2, 3.3::numeric, 10, 74.6108068, 42.8593928, 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=82'),
    ('Life Style', 'life-style-erkindik', 'Центр', 'Erkindik boulevard, 35, Бишкек', null, null, 'Салон красоты на бульваре Эркиндик с базовыми услугами ухода.', 3, 4.4::numeric, 14, 74.6071982, 42.8726555, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=82'),
    ('Kamilla', 'kamilla-chui', 'Восток-5', 'Chui avenue, 117, этаж 1, Бишкек', '+996 312 43 43 43', null, 'Салон красоты на проспекте Чуй: волосы, ногти и косметология.', 3, 4.7::numeric, 15, 74.6278457, 42.8754118, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=82'),
    ('I like Nails', 'i-like-nails-kalyk-akiev', 'Ленинский', 'Kalyk Akiev Street, 118, Бишкек', null, null, 'Nail salon и brow/lash-направление на Калык Акиева.', 2, 4.5::numeric, 5, 74.5778984, 42.8817284, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=82'),
    ('Lash Book', 'lash-book-baitik', 'Октябрьский', 'Baitik Baatyr Street, 34A/2, этаж 2, Бишкек', null, null, 'Салон ресниц и бровей на Байтик Баатыра.', 2, 0::numeric, 0, 74.6105260, 42.8591492, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=82'),
    ('Vogue Beauty Studio', 'vogue-beauty-studio', 'Первомайский', 'Nasirdin Isanov Street, 24, Бишкек', '+996 704 62 24 88', 'https://www.instagram.com/vogue_beautykg/', 'Beauty studio из подборки WE Project: волосы, макияж, ногти, ресницы и брови.', 3, 4.4::numeric, 3, 74.5906845, 42.8691723, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=82'),
    ('Valerie', 'valerie-toktogul', 'Ленинский', 'Toktogul Street, 217, Бишкек', null, null, 'Beauty salon, brow/lash-направление на Токтогула.', 2, 4.2::numeric, 3, 74.5783127, 42.8735142, 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1200&q=82'),
    ('Amor Nail Studio', 'amor-nail-studio', 'Первомайский', 'Nasirdin Isanov Street, 41, Бишкек', '+996 558 45 20 55', null, 'Nail studio на Исанова.', 2, 0::numeric, 0, 74.5914802, 42.8716121, 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1200&q=82'),
    ('Pretty', 'pretty-chui', 'Восток-5', 'Chui avenue, 48, Бишкек', '+996 701 91 12 82', null, 'Beauty salon на проспекте Чуй.', 2, 0::numeric, 0, 74.6250016, 42.8749392, 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1200&q=82'),
    ('Vibebeauty', 'vibebeauty-vefa', 'Вефа', 'Gorky Street, 27/1, этаж 10, Бишкек', null, null, 'Beauty salon в районе Vefa Center.', 3, 0::numeric, 0, 74.6095915, 42.8575092, 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=82'),
    ('InStyle', 'instyle-bishkek', 'Центр', 'Киевская улица, город Бишкек', '+996 (312) 66-07-77, +996 (312) 66-09-11', null, 'OSM beauty salon: InStyle / Инстайл.', 3, 0::numeric, 0, 74.6086825, 42.8743788, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1200&q=82'),
    ('Selective Professional Салон красоты', 'selective-professional', 'Центр', 'Михаил Фрунзе көчөсү, 364/3, Бишкек', null, null, 'OSM hairdresser/beauty point на улице Фрунзе.', 2, 0::numeric, 0, 74.6109360, 42.8803951, 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1200&q=82'),
    ('Adel', 'adel-naberezhnaya', 'Асанбай', 'Набережная, 12/1, Бишкек', null, null, 'OSM hairdresser: Adel.', 2, 0::numeric, 0, 74.6308718, 42.8254357, 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=82'),
    ('Грейс', 'greys-kiev', 'Ленинский', 'Киев көчөсү, 135, Бишкек', '+996555240686', null, 'OSM hairdresser на Киевской улице.', 2, 0::numeric, 0, 74.5899529, 42.8753899, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=82'),
    ('Лора', 'lora-aitmatov', 'Юг', 'Чингиза Айтматова проспект, 16, Бишкек', null, null, 'OSM hairdresser на проспекте Чингиза Айтматова.', 2, 0::numeric, 0, 74.5872807, 42.8595289, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=82'),
    ('Лючия', 'lyuchiya-suerkulov', 'Юг', 'Суеркулова улица, город Бишкек', '+996 312 268966', null, 'OSM hairdresser в южной части Бишкeка.', 2, 0::numeric, 0, 74.6064714, 42.8373294, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=82'),
    ('Рассвет', 'rassvet-erkindik', 'Центр', 'бульвар Эркиндик, город Бишкек', '+996 312 663825', null, 'OSM hairdresser на бульваре Эркиндик.', 1, 0::numeric, 0, 74.6058654, 42.8742154, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1200&q=82'),
    ('Шарм', 'sharm-erkindik', 'Центр', 'бульвар Эркиндик, город Бишкек', '+996 312 664597', null, 'OSM hairdresser на бульваре Эркиндик.', 1, 0::numeric, 0, 74.6059022, 42.8749278, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=82'),
    ('Кербен', 'kerben-chui', 'Восток-5', 'Чуй проспект, 127, город Бишкек', '+996 312 437476', null, 'OSM beauty salon на проспекте Чуй.', 2, 0::numeric, 0, 74.6223485, 42.8756913, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=82')
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
from real_salons
on conflict (slug) do update
set
  name = excluded.name,
  status = excluded.status,
  city = excluded.city,
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

with service_seed(salon_slug, category, name, description, duration_minutes, price_kgs) as (
  values
    ('onstudio-moscow', 'Волосы', 'Женская стрижка', 'Базовая запись; детали и финальная цена уточняются салоном.', 60, 1200),
    ('onstudio-moscow', 'Ногти', 'Классический маникюр', 'Базовая запись на маникюр.', 75, 1200),
    ('cheguevara-bishkek', 'Волосы', 'Барбер-стрижка', 'Мужская стрижка и оформление.', 50, 1000),
    ('cheguevara-bishkek', 'Волосы', 'Стрижка и укладка', 'Базовая запись к мастеру.', 60, 1200),
    ('life-style-erkindik', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 1200),
    ('life-style-erkindik', 'Ногти', 'Маникюр', 'Базовая запись на маникюр.', 75, 1200),
    ('kamilla-chui', 'Волосы', 'Стрижка и укладка', 'Базовая запись к мастеру.', 60, 1300),
    ('kamilla-chui', 'Косметология', 'Уход за лицом', 'Базовая запись на уходовую процедуру.', 75, 2200),
    ('i-like-nails-kalyk-akiev', 'Ногти', 'Маникюр', 'Базовая запись на маникюр.', 75, 1200),
    ('i-like-nails-kalyk-akiev', 'Ногти', 'Педикюр', 'Базовая запись на педикюр.', 90, 1700),
    ('lash-book-baitik', 'Брови', 'Архитектура бровей', 'Форма, коррекция и окрашивание.', 45, 1000),
    ('lash-book-baitik', 'Ресницы', 'Наращивание ресниц', 'Базовая запись на lash-услугу.', 120, 2500),
    ('vogue-beauty-studio', 'Макияж', 'Макияж', 'Базовая запись к визажисту.', 75, 2500),
    ('vogue-beauty-studio', 'Волосы', 'Окрашивание волос', 'Консультация и запись на окрашивание.', 150, 3500),
    ('valerie-toktogul', 'Брови', 'Коррекция бровей', 'Форма и окрашивание.', 45, 900),
    ('valerie-toktogul', 'Ресницы', 'Окрашивание ресниц', 'Базовая запись на ресницы.', 45, 900),
    ('amor-nail-studio', 'Ногти', 'Маникюр', 'Базовая запись на маникюр.', 75, 1200),
    ('amor-nail-studio', 'Ногти', 'Педикюр', 'Базовая запись на педикюр.', 90, 1700),
    ('pretty-chui', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 1200),
    ('pretty-chui', 'Ногти', 'Маникюр', 'Базовая запись на маникюр.', 75, 1200),
    ('vibebeauty-vefa', 'Волосы', 'Укладка', 'Базовая запись на укладку.', 45, 1200),
    ('vibebeauty-vefa', 'Ногти', 'Маникюр', 'Базовая запись на маникюр.', 75, 1200),
    ('instyle-bishkek', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 1400),
    ('instyle-bishkek', 'Волосы', 'Окрашивание волос', 'Консультация и запись на окрашивание.', 150, 3500),
    ('selective-professional', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 1200),
    ('selective-professional', 'Волосы', 'Окрашивание волос', 'Консультация и запись на окрашивание.', 150, 3000),
    ('adel-naberezhnaya', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 1000),
    ('adel-naberezhnaya', 'Волосы', 'Укладка', 'Базовая запись на укладку.', 45, 1000),
    ('greys-kiev', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 1000),
    ('greys-kiev', 'Волосы', 'Укладка', 'Базовая запись на укладку.', 45, 1000),
    ('lora-aitmatov', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 1000),
    ('lora-aitmatov', 'Волосы', 'Укладка', 'Базовая запись на укладку.', 45, 1000),
    ('lyuchiya-suerkulov', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 1000),
    ('lyuchiya-suerkulov', 'Волосы', 'Укладка', 'Базовая запись на укладку.', 45, 1000),
    ('rassvet-erkindik', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 800),
    ('rassvet-erkindik', 'Волосы', 'Укладка', 'Базовая запись на укладку.', 45, 800),
    ('sharm-erkindik', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 800),
    ('sharm-erkindik', 'Волосы', 'Укладка', 'Базовая запись на укладку.', 45, 800),
    ('kerben-chui', 'Волосы', 'Стрижка', 'Базовая запись к мастеру.', 60, 1000),
    ('kerben-chui', 'Косметология', 'Уходовая процедура', 'Базовая запись на beauty-услугу.', 75, 1800)
)
insert into public.services (salon_id, category, name, description, duration_minutes, price_kgs)
select
  s.id,
  seed.category,
  seed.name,
  seed.description,
  seed.duration_minutes,
  seed.price_kgs
from service_seed seed
join public.salons s on s.slug = seed.salon_slug
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
  'Любой свободный мастер',
  'Мастер салона',
  'Салон подтвердит конкретного специалиста после заявки. Merchant сможет заменить этот placeholder на реальных сотрудников.',
  null,
  coalesce(service_data.specialties, '{}'::text[]),
  0,
  0,
  10
from public.salons s
left join lateral (
  select array_agg(distinct sv.category order by sv.category) as specialties
  from public.services sv
  where sv.salon_id = s.id and sv.is_active = true
) service_data on true
where s.slug in (
  'onstudio-moscow',
  'cheguevara-bishkek',
  'life-style-erkindik',
  'kamilla-chui',
  'i-like-nails-kalyk-akiev',
  'lash-book-baitik',
  'vogue-beauty-studio',
  'valerie-toktogul',
  'amor-nail-studio',
  'pretty-chui',
  'vibebeauty-vefa',
  'instyle-bishkek',
  'selective-professional',
  'adel-naberezhnaya',
  'greys-kiev',
  'lora-aitmatov',
  'lyuchiya-suerkulov',
  'rassvet-erkindik',
  'sharm-erkindik',
  'kerben-chui'
)
and not exists (
  select 1
  from public.salon_staff existing
  where existing.salon_id = s.id
    and existing.full_name = 'Любой свободный мастер'
);

insert into public.staff_services (staff_id, service_id)
select st.id, sv.id
from public.salon_staff st
join public.services sv on sv.salon_id = st.salon_id
join public.salons s on s.id = st.salon_id
where st.full_name = 'Любой свободный мастер'
  and s.slug in (
    'onstudio-moscow',
    'cheguevara-bishkek',
    'life-style-erkindik',
    'kamilla-chui',
    'i-like-nails-kalyk-akiev',
    'lash-book-baitik',
    'vogue-beauty-studio',
    'valerie-toktogul',
    'amor-nail-studio',
    'pretty-chui',
    'vibebeauty-vefa',
    'instyle-bishkek',
    'selective-professional',
    'adel-naberezhnaya',
    'greys-kiev',
    'lora-aitmatov',
    'lyuchiya-suerkulov',
    'rassvet-erkindik',
    'sharm-erkindik',
    'kerben-chui'
  )
on conflict do nothing;

insert into public.staff_working_hours (staff_id, weekday, starts_at, ends_at)
select st.id, weekday, '10:00'::time, '20:00'::time
from public.salon_staff st
join public.salons s on s.id = st.salon_id
cross join generate_series(1, 6) as weekday
where st.full_name = 'Любой свободный мастер'
  and s.slug in (
    'onstudio-moscow',
    'cheguevara-bishkek',
    'life-style-erkindik',
    'kamilla-chui',
    'i-like-nails-kalyk-akiev',
    'lash-book-baitik',
    'vogue-beauty-studio',
    'valerie-toktogul',
    'amor-nail-studio',
    'pretty-chui',
    'vibebeauty-vefa',
    'instyle-bishkek',
    'selective-professional',
    'adel-naberezhnaya',
    'greys-kiev',
    'lora-aitmatov',
    'lyuchiya-suerkulov',
    'rassvet-erkindik',
    'sharm-erkindik',
    'kerben-chui'
  )
on conflict (staff_id, weekday) do update
set
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  is_active = true;
