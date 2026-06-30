-- Szabó Árpád előadó feltöltése/frissítése Supabase-ben
-- Fontos: az image_url mezőt akkor használd így, ha a képet a weboldal assets mappájába feltöltötted.

insert into speakers (
  name, subtitle, motto, bio, topic, image_url, facebook_url, website_url,
  sort_order, is_featured, is_published
) values (
  'Szabó Árpád',
  'Akhal-teke tenyésztő • Csikónevelés',
  'Először ki kell vívni a ló tiszteletét. Aztán el kell nyerni a bizalmát. Végül meg kell szerettetni magunkat vele.',
  '48 éve foglalkozom lovakkal, és úgy érzem, ma is ugyanazzal a lelkesedéssel tanulok tőlük, mint amikor először ültem nyeregbe.

Számomra a lótenyésztés nem a csikó megszületéséig tart, hanem éppen ott kezdődik. Hiszem, hogy a tenyésztő felelőssége már az első pillanattól kialakítani azt a bizalmi kapcsolatot, amelyre később minden további képzés épülhet. Ezért a csikónevelés életem egyik legfontosabb küldetése.

Elsősorban akhal-teke lovakat tenyésztek, és nagy öröm számomra, hogy ezt a különleges fajtát egyre több emberrel ismertethetem meg. Ennek részeként idén országkerülő lovastúrára indultunk: az első szakaszon Pilismaróttól Mohácsig, 20 nap alatt közel 920 kilométert lovagoltunk végig az országhatár mentén. Ősszel folytatjuk utunkat.

Korábban sok lovat lovagoltam be, ma pedig különösen büszke vagyok arra, amikor egy saját tenyésztésű csikó a korai nevelésnek köszönhetően magabiztosan és könnyedén kezdi meg a munkát. Hiszem, hogy egy jól felkészített fiatal lóval a belovaglás már nem a bizalom kialakításáról, hanem a valódi közös munkáról szól.',
  'Csikónevelés | Tenyésztői felelősség | Jól képzett hobbiló | Tereplovaglásra képzett ló | Akhal-teke fajta',
  'assets/szabo-arpad.jpg',
  'https://www.facebook.com/share/p/18LLaey9Xi/',
  'https://nava.hu/id/4473109/',
  10,
  true,
  true
);
