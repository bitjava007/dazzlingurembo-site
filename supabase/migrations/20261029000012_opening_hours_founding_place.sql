-- Horaires du showroom et lieu de création confirmés le 29/10/2026.
update public.site_settings set
  opening_hours_fr = '9 h – 17 h 30',
  opening_hours_en = '9:00 am – 5:30 pm'
where id = 1;

update public.pages set
  body_fr = replace(body_fr,
    $t$J'ai fondé Dazzling Urembo en 2016, avec l'envie$t$,
    $t$J'ai fondé Dazzling Urembo en 2016 à Ngor Almadies, à Dakar, là où se trouve notre showroom, avec l'envie$t$)
where key = 'story';
