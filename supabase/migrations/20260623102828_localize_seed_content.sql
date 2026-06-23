update public.salons
set
  district = 'Центр',
  address = 'пр. Чуй 132, Бишкек',
  description = 'Стрижки, укладки и брови рядом с площадью Ала-Тоо.'
where slug = 'ala-too-beauty-studio';

update public.salons
set
  district = 'Эркиндик',
  address = 'бульвар Эркиндик 45, Бишкек',
  description = 'Ногтевая студия с быстрыми окнами на сегодня.'
where slug = 'erkindik-nails';

update public.salons
set
  district = 'Асанбай',
  address = 'ул. Аалы Токомбаева 21, Бишкек',
  description = 'Косметология, уходовые процедуры и депиляция.'
where slug = 'asanbay-glow';

update public.salon_staff st
set
  full_name = 'Айгерим',
  role_title = 'Старший мастер',
  bio = 'Стрижки, укладки и консультация по окрашиванию.'
from public.salons s
where s.id = st.salon_id and s.slug = 'ala-too-beauty-studio';

update public.salon_staff st
set
  full_name = 'Дана',
  role_title = 'Мастер ногтевого сервиса',
  bio = 'Маникюр с покрытием и дизайн ногтей.'
from public.salons s
where s.id = st.salon_id and s.slug = 'erkindik-nails';

update public.salon_staff st
set
  full_name = 'Мээрим',
  role_title = 'Косметолог',
  bio = 'Чистка лица и уходовые процедуры.'
from public.salons s
where s.id = st.salon_id and s.slug = 'asanbay-glow';

update public.services sv
set
  category = 'Волосы',
  name = 'Женская стрижка',
  description = 'Консультация, мытье, стрижка и легкая укладка.'
from public.salons s
where s.id = sv.salon_id and s.slug = 'ala-too-beauty-studio';

update public.services sv
set
  category = 'Ногти',
  name = 'Маникюр с гель-лаком',
  description = 'Классический маникюр с покрытием.'
from public.salons s
where s.id = sv.salon_id and s.slug = 'erkindik-nails';

update public.services sv
set
  category = 'Косметология',
  name = 'Чистка лица',
  description = 'Анализ кожи и глубокая очищающая процедура.'
from public.salons s
where s.id = sv.salon_id and s.slug = 'asanbay-glow';
