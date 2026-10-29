-- Jours d'ouverture du showroom confirmés le 29/10/2026.
update public.site_settings set
  opening_hours_fr = 'Du lundi au samedi, de 9 h à 17 h 30',
  opening_hours_en = 'Monday to Saturday, 9:00 am – 5:30 pm'
where id = 1;
