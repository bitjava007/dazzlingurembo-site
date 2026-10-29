-- Traductions anglaises des textes de la fondatrice (29/10/2026), à faire relire par la fondatrice.
update public.pages set
  title_en = 'Elegance that feels like you.',
  body_en = $t$Dazzling Urembo is a fashion brand offering clothing and accessories designed to accompany women through every moment of their lives. We love beautiful fabrics, flattering cuts and carefully crafted details. Our world draws on our African roots while staying contemporary and easy to wear.$t$
where key = 'home';

update public.pages set
  body_en = $t$I founded Dazzling Urembo in 2016 in Ngor Almadies, Dakar, where our showroom is located, wishing to offer creations that reflect both our culture and a contemporary way of dressing. It is a project I have built step by step. The brand has grown between my Congolese roots and my work in Dakar.

## Where the name "Urembo" comes from

"Urembo" is a Swahili word associated with beauty and elegance. The name captures what I want to convey: a beauty that goes beyond the outfit itself, to the way you feel when you wear it.

## Our values

Quality work, respect for our clients, listening, creativity and authenticity. I want every creation to be beautiful, but also comfortable to wear, well finished and suited to the person who chooses it.

"I love the idea that an outfit can make a woman shine without stealing the spotlight."
Christelle Matabaro Ndamuso, founder$t$
where key = 'story';

update public.pages set
  body_en = $t$We work with a range of fabrics depending on the design: bazin, brocade, shantung, silk, organza, crepe and other fabrics chosen for their drape and hold. We pay close attention to cut, finishing, embroidery and detail. We work with artisans and workshops according to the needs of each collection and order.

## Made to measure

You first get in touch to tell us what you have in mind, with or without an inspiration photo. Together, we discuss the design, fabric, colours, measurements and timing.

Once the details are agreed, a 50% deposit allows us to start making your piece. The usual lead time is about three weeks, depending on complexity and availability; urgent requests are considered case by case. Fittings or adjustments can be arranged when possible. The balance is paid on delivery.

## Occasions

For everyday life, work, weekend outings, weddings, celebrations and ceremonies. Our creations accompany a woman through her ordinary days as well as her great moments.$t$
where key = 'craftsmanship';

update public.pages set
  body_en = $t$Our showroom in Ngor Almadies, Dakar, is a place to discover our world and some of our creations. Every visit is personal. For now, the easiest way is to contact us before coming by, so we can prepare your visit properly.$t$
where key = 'showroom';

update public.pages set
  body_en = $t$Have a question, a special wish or an outfit in mind? Write to us, we would be delighted to talk it through with you. We reply as soon as possible, usually during our business hours.$t$
where key = 'contact';

update public.themes set description_en = 'Outfits for everyday life, work and special occasions: dresses, sets, boubous and trousers.' where slug_fr = 'vetements';
update public.themes set description_en = 'A selection of bags to complete Dazzling Urembo looks.' where slug_fr = 'sacs';
update public.themes set description_en = 'Shoes designed to combine style and comfort.' where slug_fr = 'chaussures';
update public.themes set description_en = 'Our bazin creations, with beautiful colours, embroidery and refined cuts.' where slug_fr = 'bazin';
update public.themes set description_en = 'Brocade pieces, chosen for their texture and presence.' where slug_fr = 'brocard';

update public.catalogues set description_en = $t$Cowry Majesty is a collection exploring an elegance inspired by our African heritage. It brings together bold silhouettes, refined fabrics and details that give each piece its character.$t$ where slug_fr = 'cowry-majesty';
update public.catalogues set description_en = $t$This capsule grows out of work on Kuba patterns and their interpretation in contemporary silhouettes. Understated yet recognisable pieces, with real attention to cut, texture and colour.$t$ where slug_fr = 'collection-kuba';
update public.catalogues set description_en = $t$A selection of creations that fit easily into different occasions: outfits, bags and shoes. Dazzling Urembo is about much more than ceremonial wear.$t$ where slug_fr = 'nos-essentiels';
