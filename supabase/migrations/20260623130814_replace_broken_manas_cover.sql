update public.salons
set
  cover_image_path = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=82',
  updated_at = now()
where slug = 'manas-nail-house'
  and cover_image_path = 'https://images.unsplash.com/photo-1610992235683-e39b29219e87?auto=format&fit=crop&w=1200&q=82';
