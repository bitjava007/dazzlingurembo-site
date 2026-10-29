-- E-mail de la marque, adresse du showroom et année de création confirmés le 29/10/2026.
update public.site_settings set
  contact_email = 'dazzlingurembo@outlook.com',
  address = 'Ngor Almadies, Dakar, Sénégal'
where id = 1;

update public.pages set
  body_fr = replace(body_fr,
    $t$J'ai fondé Dazzling Urembo avec l'envie de proposer$t$,
    $t$J'ai fondé Dazzling Urembo en 2016, avec l'envie de proposer$t$)
where key = 'story';

update public.pages set
  body_fr = replace(body_fr, $t$Notre showroom à Ngor, Dakar,$t$, $t$Notre showroom à Ngor Almadies, Dakar,$t$)
where key = 'showroom';
