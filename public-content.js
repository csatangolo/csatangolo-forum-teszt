const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function youtubeEmbed(url) {
  const s = String(url || "");
  let id = "";
  if (s.includes("youtu.be/")) id = s.split("youtu.be/")[1].split(/[?&]/)[0];
  if (s.includes("watch?v=")) id = s.split("watch?v=")[1].split("&")[0];
  if (s.includes("/embed/")) id = s.split("/embed/")[1].split(/[?&]/)[0];
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

const LOCAL_SPEAKERS = [
  {
    name: "Panyi György",
    subtitle: "Belovaglás, csikóképzés és díjugratás",
    image_url: "assets/panyi-gyuri.jpg",
    motto: "A jó ló kiképzése mindig a bizalommal kezdődik.",
    bio: `A lovak egész életemet végigkísérték. Több mint ötven éve foglalkozom velük, és ez idő alatt megtapasztaltam a lovassport szépségeit, kihívásait, valamint azt, hogy a legjobb eredményeket mindig türelemmel, következetességgel és a ló iránti tisztelettel lehet elérni.

Pályafutásom során Magyarország mellett külföldön is dolgoztam, ahol rengeteg tapasztalatot szereztem a lovak képzésében és a fiatal csikók belovaglásában. Az évek során több ezer lóval dolgozhattam együtt, és számomra mindig az volt a legfontosabb, hogy a ló bizalommal, nyugodtan és örömmel működjön együtt az emberrel.

Pályafutásom egyik legemlékezetesebb eredménye, hogy Django nevű lovammal 219 centimétert ugrottam. Ez a teljesítmény a lovas pályám egyik meghatározó pillanata maradt.

Előadásomban saját tapasztalataimon keresztül szeretném megmutatni, hogyan lehet biztos alapokra építeni egy fiatal ló képzését, és milyen szemlélet vezet hosszú távon sikeres, harmonikus együttműködéshez.`,
    topic: "Belovaglás | Csikóképzés | Díjugratás | Gyakorlati tapasztalat",
    sort_order: 1,
    is_featured: true,
    is_published: true
  },
  {
    name: "Karl Péter",
    subtitle: "Western és ranch szemlélet • Horsemanship",
    image_url: "assets/karl-peter.jpg",
    motto: "A jó lóval való kapcsolat nem erőből, hanem megértésből épül.",
    bio: `A ló és ember közötti tiszta kommunikációt, a következetes segítségadást és a bizalmon alapuló munkát képviseli.`,
    topic: "Horsemanship | Kommunikáció | Ranch szemlélet",
    sort_order: 3,
    is_featured: false,
    is_published: true
  },
  {
    name: "Kevey Bella",
    subtitle: "Hagyományos lókiképzés, sport, terápiás és iskolalovak képzése",
    image_url: "assets/kevey-bella.jpeg.PNG",
    motto: "A jó iskolaló, sportló és terápiás ló képzése ugyanarra épül: bizalomra, következetességre és pontos alapmunkára.",
    bio: `A hagyományos lókiképzés szemléletéből indulok ki, ahol a ló képzése nem gyors eredményekről, hanem biztos alapokról, fokozatosságról és hosszú távon is működő együttműködésről szól. Számomra a sportlovak, terápiás lovak és iskolalovak képzése ugyanarra az alapra épül: a ló legyen nyugodt, érthető segítségekre reagáló, testileg és lelkileg is terhelhető, biztonságos társ.

A fórumon arról a gyakorlati munkáról szeretnék beszélni, amely a mindennapokban is használható: hogyan lehet egy lovat úgy felépíteni, hogy sportban, oktatásban vagy terápiás helyzetekben is megbízhatóan, kiegyensúlyozottan működjön.

Fontosnak tartom, hogy a ló ne csak végrehajtsa a feladatot, hanem értse is azt, amit kérünk tőle. A jó képzés számomra türelmes, következetes és mindig a ló aktuális állapotához igazodik.`,
    topic: "Hagyományos lókiképzés | Sportlovak | Terápiás lovak | Iskolalovak képzése",
    sort_order: 4,
    is_featured: false,
    is_published: true
  },
  {
    name: "Pataky Kata",
    subtitle: "Okleveles Monty Roberts Instruktor",
    image_url: "assets/pataky-kata.jpg",
    motto: "A bizalom mindig a kommunikációval kezdődik.",
    bio: `A lovak mindig arra ösztönöztek, hogy ne csupán irányítani próbáljam őket, hanem valóban megértsem a gondolkodásukat és a kommunikációjukat. Ez vezetett el Monty Roberts erőszakmentes módszeréhez, amely alapjaiban változtatta meg a lovakról alkotott szemléletemet.

Magyarország első okleveles Monty Roberts Instruktoraként hiszem, hogy a sikeres közös munka alapja a bizalom, a tiszta kommunikáció és a kölcsönös tisztelet. A lovak testbeszédének megértése lehetővé teszi, hogy kényszer helyett együttműködésre építsük kapcsolatunkat.

Előadásomban megmutatom, hogyan alkalmazható a Monty Roberts módszer a mindennapi lóhasználat során, legyen szó hobbilovakról, sportlovakról vagy fiatal lovak képzéséről. Célom, hogy minden résztvevő olyan szemléletet és gyakorlati tudást vigyen haza, amely hosszú távon is segíti a lóval való harmonikus együttműködést.`,
    topic: "Monty Roberts módszer | Lókommunikáció | Bizalomépítés | Földi munka",
    sort_order: 2,
    is_featured: true,
    is_published: true
  },
  {
    name: "Szabó Árpád",
    subtitle: "Akhal-teke tenyésztő • Csikónevelés",
    image_url: "assets/szabo-arpad-card.jpg",
    motto: "Először ki kell vívni a ló tiszteletét. Aztán el kell nyerni a bizalmát.",
    bio: `48 éve foglalkozom lovakkal, és úgy érzem, ma is ugyanazzal a lelkesedéssel tanulok tőlük, mint amikor először ültem nyeregbe. Számomra a lótenyésztés nem a csikó megszületéséig tart, hanem éppen ott kezdődik. Hiszem, hogy a tenyésztő felelőssége már az első pillanattól kialakítani azt a bizalmi kapcsolatot, amelyre később minden további képzés épülhet.`,
    topic: "Csikónevelés | Tenyésztői felelősség | Akhal-teke fajta",
    facebook_url: "https://www.facebook.com/share/p/18LLaey9Xi/",
    website_url: "https://nava.hu/id/4473109/",
    sort_order: 5,
    is_featured: false,
    is_published: true
  },
  {
    name: "Kaska Zoltán",
    subtitle: "Díjugratás • Versenytapasztalat",
    image_url: "assets/kaska-zoltan.jpg",
    motto: "A jó ugrás a felkészítésben kezdődik.",
    bio: `Díjugrató szemlélettel, versenytapasztalattal és gyakorlati lófelkészítési gondolatokkal érkezik a fórumra.`,
    topic: "Díjugratás | Versenyló | Felkészítés",
    sort_order: 6,
    is_featured: false,
    is_published: true
  },
  {
    name: "Benner Jani",
    subtitle: "Terepmunka • Használati ló képzés",
    image_url: "assets/benner-jani.jpg",
    motto: "A képzett ló terepen is magabiztos, figyelmes és együttműködő.",
    bio: `A használati szemléletű lókiképzés, a terepen is működő lovak és a gyakorlati tapasztalat oldaláról kapcsolódik a szakmai naphoz.`,
    topic: "Terepmunka | Használati ló | Lókiképzés",
    sort_order: 7,
    is_featured: false,
    is_published: true
  },
  {
    name: "Tisza Zoltán",
    subtitle: "Szabadidomítás • Lóval való kommunikáció",
    image_url: "assets/tisza-zoltan.jpg",
    motto: "A látványos munka mögött mindig pontos kommunikáció és bizalom áll.",
    bio: `A lóval való földi munka, a figyelem, a bizalom és a finom kommunikáció területéről hoz gyakorlati tapasztalatokat.`,
    topic: "Szabadidomítás | Földi munka | Kommunikáció",
    sort_order: 8,
    is_featured: false,
    is_published: true
  },
  {
    name: "Tászler Melinda",
    subtitle: "Lovas bemutató • Klasszikus munka",
    image_url: "assets/taszler-melinda.jpg",
    motto: "A lóval való összhang a legszebb bemutató.",
    bio: `A klasszikus lovas munka számomra nem pusztán látványos bemutató, hanem a lóval való finom, tiszta és következetes kommunikáció eredménye. Hiszem, hogy a valódi összhang akkor születik meg, amikor a lovas nem uralni akarja a lovat, hanem érti a jelzéseit, figyel rá, és türelemmel építi fel a közös munkát.

A fórumon azt a szemléletet szeretném képviselni, amelyben a szépség, a fegyelem és a ló iránti tisztelet egyszerre van jelen. Fontosnak tartom, hogy a bemutató mögött mindig legyen szakmai tartalom: átgondolt alapmunka, bizalom, fokozatosság és a ló testi-lelki állapotának figyelembevétele.

Szeretném megmutatni, hogy a klasszikus jellegű munka nem elérhetetlen különlegesség, hanem olyan út, amely a mindennapi lóval való kapcsolatot is szebbé, pontosabbá és harmonikusabbá teheti.`,
    topic: "Bemutató | Összhang | Klasszikus munka",
    sort_order: 9,
    is_featured: false,
    is_published: true
  },
  {
    name: "Szabó Zoltán",
    subtitle: "Terepakadályok • Gyakorlati képzés",
    image_url: "assets/szabo-zoltan.jpg",
    motto: "A bátorság tanítható, ha a ló lépésről lépésre érti a feladatot.",
    bio: `Gyakorlati terepakadályos tapasztalattal és használati szemléletű lófelkészítéssel kapcsolódik a fórum programjához.`,
    topic: "Terepakadály | Bátorság | Gyakorlati képzés",
    sort_order: 10,
    is_featured: false,
    is_published: true
  }
];


function speakerSlug(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/gyorgy/g, "gyuri")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function speakerTopics(topic) {
  return String(topic || "").split(/\||,|;/).map(t => t.trim()).filter(Boolean);
}

function speakerParagraphs(bio) {
  return String(bio || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

function speakerImage(s) {
  return s.image_url || s.main_image_url || s.photo_url || s.profile_image_url || "";
}

function renderSpeakerCard(s) {
  const topics = speakerTopics(s.topic);
  const paragraphs = speakerParagraphs(s.bio);
  const lead = paragraphs[0] || s.bio || "";
  const img = speakerImage(s);
  const slug = speakerSlug(s.name);
  return `
    <article class="speaker-premium-card ${s.is_featured ? 'is-featured' : ''}" id="speaker-${esc(slug)}">
      <button class="speaker-card-open" type="button" data-speaker-slug="${esc(slug)}" aria-label="${esc(s.name)} bemutatása">
        <div class="speaker-image-wrap">
          ${img ? `<img class="speaker-photo" src="${esc(img)}" alt="${esc(s.name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/panyi-gyuri.jpg';">` : `<div class="speaker-photo placeholder">${esc((s.name || '?').charAt(0))}</div>`}
          ${s.is_featured ? '<span class="profile-tag floating-tag">⭐ Kiemelt előadó</span>' : ""}
        </div>
        <div class="speaker-body">
          <p class="speaker-label">Előadó</p>
          <h2>${esc(s.name)}</h2>
          ${s.subtitle ? `<p class="speaker-subtitle">${esc(s.subtitle)}</p>` : ""}
          ${s.motto ? `<blockquote class="speaker-motto">„${esc(s.motto)}”</blockquote>` : ""}
          ${lead ? `<p class="speaker-lead">${esc(lead)}</p>` : ""}
          ${topics.length ? `<div class="speaker-topic-list">${topics.slice(0,4).map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
          <span class="speaker-more">Bővebben erről az előadóról</span>
        </div>
      </button>
    </article>
  `;
}

function renderSpeakerDetail(s) {
  const topics = speakerTopics(s.topic);
  const paragraphs = speakerParagraphs(s.bio);
  const img = speakerImage(s);
  const speakerImages = [s.gallery_image_1_url, s.gallery_image_2_url, s.gallery_image_3_url].filter(Boolean);
  return `
    <article class="speaker-detail-panel">
      <div class="speaker-detail-hero">
        ${img ? `<img src="${esc(img)}" alt="${esc(s.name)}">` : ""}
        <div>
          <span class="eyebrow">Előadó</span>
          <h2>${esc(s.name)}</h2>
          ${s.subtitle ? `<p>${esc(s.subtitle)}</p>` : ""}
          ${s.motto ? `<blockquote>„${esc(s.motto)}”</blockquote>` : ""}
        </div>
      </div>
      <div class="speaker-detail-content">
        <h3>Bemutatkozás</h3>
        ${paragraphs.length ? paragraphs.map(p => `<p>${esc(p)}</p>`).join("") : `<p>${esc(s.bio || "A bemutatkozó hamarosan bővül.")}</p>`}
        ${topics.length ? `<div class="speaker-topic-list detail-topics">${topics.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
        ${speakerImages.length ? `<div class="speaker-detail-gallery">${speakerImages.map((img, i) => `<img src="${esc(img)}" alt="${esc(s.name)} bemutatkozó kép ${i + 1}" loading="lazy">`).join("")}</div>` : ""}
        <div class="speaker-links detail-links">
          ${s.facebook_url ? `<a href="${esc(s.facebook_url)}" target="_blank" rel="noopener">Facebook</a>` : ""}
          ${s.instagram_url ? `<a href="${esc(s.instagram_url)}" target="_blank" rel="noopener">Instagram</a>` : ""}
          ${s.youtube_url ? `<a href="${esc(s.youtube_url)}" target="_blank" rel="noopener">YouTube</a>` : ""}
          ${s.website_url ? `<a href="${esc(s.website_url)}" target="_blank" rel="noopener">Riport / weboldal</a>` : ""}
        </div>
      </div>
    </article>
  `;
}


async function loadPublicSpeakers() {
  const el = document.getElementById("speakerList");
  if (!el) return;
  const { data, error } = await client.from("speakers").select("*").eq("is_published", true).order("sort_order", { ascending: true });
  let speakers = (!error && data && data.length) ? data : [];

  LOCAL_SPEAKERS.forEach(local => {
    const exists = speakers.some(s => String(s.name || "").toLowerCase().trim() === local.name.toLowerCase().trim());
    if (!exists) speakers.push(local);
  });

  speakers = speakers
    .filter(s => s && s.is_published !== false)
    .sort((a,b) => Number(a.sort_order || 100) - Number(b.sort_order || 100));

  window.CSATANGOLO_SPEAKERS = speakers;

  if (!speakers.length) {
    el.innerHTML = `<article class="profile-card featured-profile"><span class="profile-tag">Kiemelt előadó</span><h2>Hamarosan</h2><p>Az előadók bemutatkozása hamarosan felkerül.</p></article>`;
    return;
  }

  el.innerHTML = speakers.map(renderSpeakerCard).join("");

  el.querySelectorAll("[data-speaker-slug]").forEach(btn => {
    btn.addEventListener("click", () => openSpeakerDetail(btn.dataset.speakerSlug));
  });

  if (!document.getElementById("speakerModal")) {
    document.body.insertAdjacentHTML("beforeend", `
      <div id="speakerModal" class="speaker-modal hidden" role="dialog" aria-modal="true">
        <div class="speaker-modal-backdrop" data-close-speaker></div>
        <div class="speaker-modal-window">
          <button class="speaker-modal-close" type="button" data-close-speaker>×</button>
          <div id="speakerModalContent"></div>
        </div>
      </div>
    `);
    document.querySelectorAll("[data-close-speaker]").forEach(x => x.addEventListener("click", closeSpeakerDetail));
  }

  const hash = decodeURIComponent(location.hash || "").replace("#", "");
  if (hash) {
    const found = speakers.find(s => speakerSlug(s.name) === hash || speakerSlug(s.name).includes(hash));
    if (found) openSpeakerDetail(speakerSlug(found.name), false);
  }
}

function openSpeakerDetail(slug, updateHash = true) {
  const speakers = window.CSATANGOLO_SPEAKERS || [];
  const s = speakers.find(x => speakerSlug(x.name) === slug);
  if (!s) return;
  const modal = document.getElementById("speakerModal");
  const content = document.getElementById("speakerModalContent");
  content.innerHTML = renderSpeakerDetail(s);
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  if (updateHash) history.replaceState(null, "", "#" + speakerSlug(s.name));
}

function closeSpeakerDetail() {
  const modal = document.getElementById("speakerModal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

async function loadPublicProgram() {
  const el = document.getElementById("programList");
  const { data, error } = await client.from("program_items").select("*").eq("is_published", true).order("sort_order", { ascending: true });
  if (error || !data || !data.length) {
    el.innerHTML = `<div><time>09:00</time><strong>Érkezés, regisztráció, kávé</strong><span>Ismerkedés, beszélgetés, a nap közös megnyitása.</span></div>
    <div><time>Délelőtt</time><strong>Szakmai gondolatindító előadások</strong><span>Belovaglás, fiatal lovak képzése, lókiképzési szemléletek és gyakorlati tapasztalatok.</span></div>
    <div><time>Kora délután</time><strong>Gyakorlati bemutatók</strong><span>Fedeles lovardában vagy kültéren, az időjáráshoz igazítva.</span></div>
    <div><time>Délután</time><strong>Kötetlen szakmai beszélgetések</strong><span>Kérdések, válaszok, kapcsolatok és közös gondolkodás.</span></div>
    <div><time>Egész nap</time><strong>Lovas büfé és Fröccsterasz</strong><span>Pihenés, családi programok és közösségi találkozások.</span></div>
    <div><time>Estig</time><strong>Levezetés jó hangulatban</strong><span>A nap tapasztalatainak összegzése, közösségi beszélgetés akár késő estig.</span></div>`;
    return;
  }
  el.innerHTML = data.map(p => `<div><time>${esc(p.time_label)}</time><strong>${esc(p.title)}</strong><span>${esc(p.description || "")}</span></div>`).join("");
}

async function loadPublicVideos() {
  const el = document.getElementById("videoList");
  const { data, error } = await client.from("videos").select("*").eq("is_published", true).order("sort_order", { ascending: true });
  if (error || !data || !data.length) {
    el.innerHTML = `<article class="knowledge-tile"><div class="play">▶</div><h2>Fórum meghívó</h2><p>Ide kerülhet az első YouTube meghívó videó.</p></article>`;
    return;
  }
  el.innerHTML = data.map(v => {
    const embed = youtubeEmbed(v.youtube_url);
    return `<article class="knowledge-tile">
      ${embed ? `<iframe class="yt" src="${embed}" title="${esc(v.title)}" allowfullscreen></iframe>` : '<div class="play">▶</div>'}
      <h2>${esc(v.title)}</h2>
      <p>${esc(v.description || "")}</p>
      ${v.youtube_url ? `<a class="mini-link" href="${esc(v.youtube_url)}" target="_blank" rel="noopener">Megnyitás YouTube-on</a>` : ""}
    </article>`;
  }).join("");
}

async function loadPublicNews() {
  const el = document.getElementById("newsList");
  const { data, error } = await client.from("news").select("*").eq("is_published", true).order("created_at", { ascending: false });
  if (error || !data || !data.length) {
    el.innerHTML = `<section class="card"><h2>Hamarosan</h2><p>Ide kerülnek majd a friss fórum hírek és tudnivalók.</p></section>`;
    return;
  }
  el.innerHTML = data.map(n => `<article class="card news-card"><span class="eyebrow">${new Date(n.created_at).toLocaleDateString("hu-HU")}</span><h2>${esc(n.title)}</h2><p>${esc(n.body || "")}</p></article>`).join("");
}


async function loadPublicGallery() {
  const el = document.getElementById("galleryList");
  const { data, error } = await client.from("gallery").select("*").eq("is_published", true).order("created_at", { ascending: false });
  if (error || !data || !data.length) {
    el.innerHTML = `<section class="card"><h2>Hamarosan</h2><p>Ide kerülnek majd a feltöltött képek.</p></section>`;
    return;
  }
  el.innerHTML = data.map(g => `<article class="gallery-card">
    <img src="${esc(g.image_url)}" alt="${esc(g.title || 'Galéria kép')}">
    <h2>${esc(g.title || '')}</h2>
    <p>${esc(g.description || '')}</p>
  </article>`).join("");
}

async function loadPublicDocuments() {
  const el = document.getElementById("documentList");
  const { data, error } = await client.from("documents").select("*").eq("is_published", true).order("created_at", { ascending: false });
  if (error || !data || !data.length) {
    el.innerHTML = `<p class="hint">Még nincs letölthető dokumentum.</p>`;
    return;
  }
  el.innerHTML = data.map(d => `<article class="cms-row">
    <div><strong>${esc(d.title)}</strong><span>${esc(d.description || '')}</span></div>
    <a class="button" href="${esc(d.file_url)}" target="_blank">Letöltés</a>
  </article>`).join("");
}


// Premium v1.8: plusz „Jelentkezz te is előadónak” kártya, ha a lista dinamikusan töltődik
(function(){
  function addApplySpeakerCard(){
    var strip = document.getElementById('speakerList');
    if(!strip || strip.querySelector('.f33-speaker-apply')) return;
    var card = document.createElement('article');
    card.className = 'f33-speaker f33-speaker-apply';
    card.innerHTML = '<div class="f33-speaker-photo"></div><div class="f33-speaker-body"><span>Nyitott lehetőség</span><h3>Jelentkezz te is előadónak</h3><p>Kerülj fel hamarosan az előadók közé.</p><a href="kapcsolat.html">Kapcsolatfelvétel</a></div>';
    strip.appendChild(card);
  }
  document.addEventListener('DOMContentLoaded', addApplySpeakerCard);
  window.addEventListener('load', addApplySpeakerCard);
  setTimeout(addApplySpeakerCard, 800);
  setTimeout(addApplySpeakerCard, 1800);
})();


// Premium v1.9: plusz „Jelentkezz te is előadónak” kártya, ha a lista dinamikusan töltődik
(function(){
  function addApplySpeakerCard(){
    var strip = document.getElementById('speakerList');
    if(!strip || strip.querySelector('.f33-speaker-apply')) return;
    var card = document.createElement('article');
    card.className = 'f33-speaker f33-speaker-apply';
    card.innerHTML = '<div class="f33-speaker-photo"></div><div class="f33-speaker-body"><span>Nyitott lehetőség</span><h3>Jelentkezz te is előadónak</h3><p>Kerülj fel hamarosan az előadók közé.</p><a href="kapcsolat.html">Kapcsolatfelvétel</a></div>';
    strip.appendChild(card);
  }
  document.addEventListener('DOMContentLoaded', addApplySpeakerCard);
  window.addEventListener('load', addApplySpeakerCard);
  setTimeout(addApplySpeakerCard, 800);
  setTimeout(addApplySpeakerCard, 1800);
})();


// === v4.0 stabil előadó-lista és egyedi előadói bemutató ===
function csgSpeakerSlug(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function csgSpeakerImage(s) {
  return s.image_url || s.main_image_url || s.photo_url || s.profile_image_url || "";
}

function csgTopics(topic) {
  return String(topic || "").split(/\||,|;/).map(x => x.trim()).filter(Boolean);
}

function csgParagraphs(text) {
  return String(text || "").split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
}

function renderSpeakerCardV4(s) {
  const img = csgSpeakerImage(s);
  const slug = csgSpeakerSlug(s.name);
  const lead = csgParagraphs(s.bio)[0] || "";
  const topics = csgTopics(s.topic).slice(0, 4);
  return `
    <article class="speaker-premium-card ${s.is_featured ? "is-featured" : ""}">
      <button type="button" class="speaker-card-open" data-speaker-slug="${esc(slug)}">
        <div class="speaker-image-wrap">
          ${img ? `<img class="speaker-photo" src="${esc(img)}" alt="${esc(s.name)}" loading="lazy">` : `<div class="speaker-photo placeholder">${esc((s.name || "?").charAt(0))}</div>`}
          ${s.is_featured ? `<span class="profile-tag floating-tag">Kiemelt előadó</span>` : ""}
        </div>
        <div class="speaker-body">
          <p class="speaker-label">Előadó</p>
          <h2>${esc(s.name)}</h2>
          ${s.subtitle ? `<p class="speaker-subtitle">${esc(s.subtitle)}</p>` : ""}
          ${s.motto ? `<blockquote class="speaker-motto">„${esc(s.motto)}”</blockquote>` : ""}
          ${lead ? `<p class="speaker-lead">${esc(lead)}</p>` : ""}
          ${topics.length ? `<div class="speaker-topic-list">${topics.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
          <span class="speaker-more">Bővebben erről az előadóról</span>
        </div>
      </button>
    </article>
  `;
}

function renderSpeakerDetailV4(s) {
  const img = csgSpeakerImage(s);
  const paragraphs = csgParagraphs(s.bio);
  const topics = csgTopics(s.topic);
  const gallery = [s.gallery_image_1_url, s.gallery_image_2_url, s.gallery_image_3_url].filter(Boolean);
  return `
    <article class="speaker-detail-panel">
      <div class="speaker-detail-hero">
        ${img ? `<img src="${esc(img)}" alt="${esc(s.name)}">` : ""}
        <div>
          <span class="eyebrow">Előadó</span>
          <h2>${esc(s.name)}</h2>
          ${s.subtitle ? `<p>${esc(s.subtitle)}</p>` : ""}
          ${s.motto ? `<blockquote>„${esc(s.motto)}”</blockquote>` : ""}
        </div>
      </div>
      <div class="speaker-detail-content">
        <h3>Bemutatkozás</h3>
        ${paragraphs.length ? paragraphs.map(p => `<p>${esc(p)}</p>`).join("") : `<p>A részletes bemutatkozás hamarosan bővül.</p>`}
        ${topics.length ? `<div class="speaker-topic-list detail-topics">${topics.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
        ${gallery.length ? `<div class="speaker-detail-gallery">${gallery.map((g,i)=>`<img src="${esc(g)}" alt="${esc(s.name)} kép ${i+1}">`).join("")}</div>` : ""}
      </div>
    </article>
  `;
}

async function loadPublicSpeakers() {
  const el = document.getElementById("speakerList");
  if (!el) return;

  let speakers = [];
  try {
    const { data, error } = await client.from("speakers").select("*").eq("is_published", true).order("sort_order", { ascending: true });
    if (!error && data && data.length) speakers = data;
  } catch (e) {
    console.log("Előadók adatbázisból nem elérhetők:", e);
  }

  LOCAL_SPEAKERS.forEach(local => {
    const exists = speakers.some(s => String(s.name || "").toLowerCase().trim() === local.name.toLowerCase().trim());
    if (!exists) speakers.push(local);
  });

  speakers = speakers
    .filter(s => s && s.is_published !== false)
    .sort((a,b) => Number(a.sort_order || 100) - Number(b.sort_order || 100));

  window.CSATANGOLO_SPEAKERS = speakers;

  if (!speakers.length) {
    el.innerHTML = `<article class="profile-card featured-profile"><h2>Hamarosan</h2><p>Az előadók bemutatkozása hamarosan felkerül.</p></article>`;
    return;
  }

  el.innerHTML = speakers.map(renderSpeakerCardV4).join("");

  if (!document.getElementById("speakerModal")) {
    document.body.insertAdjacentHTML("beforeend", `
      <div id="speakerModal" class="speaker-modal hidden" role="dialog" aria-modal="true">
        <div class="speaker-modal-backdrop" data-close-speaker></div>
        <div class="speaker-modal-window">
          <button class="speaker-modal-close" type="button" data-close-speaker>×</button>
          <div id="speakerModalContent"></div>
        </div>
      </div>
    `);
    document.querySelectorAll("[data-close-speaker]").forEach(x => x.addEventListener("click", () => {
      document.getElementById("speakerModal").classList.add("hidden");
      document.body.classList.remove("modal-open");
    }));
  }

  el.querySelectorAll("[data-speaker-slug]").forEach(btn => {
    btn.addEventListener("click", () => {
      const s = speakers.find(x => csgSpeakerSlug(x.name) === btn.dataset.speakerSlug);
      if (!s) return;
      document.getElementById("speakerModalContent").innerHTML = renderSpeakerDetailV4(s);
      document.getElementById("speakerModal").classList.remove("hidden");
      document.body.classList.add("modal-open");
      history.replaceState(null, "", "#" + csgSpeakerSlug(s.name));
    });
  });
}

// v4.0 bővített program fallback
async function loadPublicProgram() {
  const el = document.getElementById("programList");
  if (!el) return;
  try {
    const { data, error } = await client.from("program_items").select("*").eq("is_published", true).order("sort_order", { ascending: true });
    if (!error && data && data.length) {
      el.innerHTML = data.map(p => `<div><time>${esc(p.time_label)}</time><strong>${esc(p.title)}</strong><span>${esc(p.description || "")}</span></div>`).join("");
      return;
    }
  } catch (e) {}
  el.innerHTML = `<div><time>09:00</time><strong>Érkezés, regisztráció, kávé</strong><span>Ismerkedés, beszélgetés, a nap közös megnyitása.</span></div>
  <div><time>Délelőtt</time><strong>Szakmai gondolatindító előadások</strong><span>Belovaglás, fiatal lovak képzése, lókiképzési szemléletek és gyakorlati tapasztalatok.</span></div>
  <div><time>Kora délután</time><strong>Gyakorlati bemutatók</strong><span>Fedeles lovardában vagy kültéren, az időjáráshoz igazítva.</span></div>
  <div><time>Délután</time><strong>Kötetlen szakmai beszélgetések</strong><span>Kérdések, válaszok, kapcsolatok és közös gondolkodás.</span></div>
  <div><time>Egész nap</time><strong>Lovas büfé, Fröccsterasz és családi programok</strong><span>Pihenés, gyerekprogramok és közösségi találkozások.</span></div>
  <div><time>Estig</time><strong>Levezetés jó hangulatban</strong><span>A nap tapasztalatainak összegzése, közösségi beszélgetés akár késő estig.</span></div>`;
}

// FINAL2: stabil előadói oldal – a szerverről érkező hiányos adatok mellé visszatölti a helyi szövegeket
function finalSpeakerSlug(name){return String(name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function finalSpeakerImage(s){return s.image_url||s.main_image_url||s.photo_url||s.profile_image_url||'';}
function finalParagraphs(text){return String(text||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);}
function finalTopics(text){return String(text||'').split(/\||,|;/).map(x=>x.trim()).filter(Boolean);}
function finalMergeSpeakers(db){
  const byName=new Map((LOCAL_SPEAKERS||[]).map(s=>[String(s.name||'').toLowerCase().trim(),s]));
  const used=new Set();
  const out=(db||[]).map(s=>{const k=String(s.name||'').toLowerCase().trim(); const l=byName.get(k)||{}; used.add(k); return {...l,...s,image_url:s.image_url||s.main_image_url||s.photo_url||l.image_url,subtitle:s.subtitle||l.subtitle,motto:s.motto||l.motto,bio:s.bio||l.bio,topic:s.topic||l.topic,sort_order:s.sort_order||l.sort_order||100};});
  (LOCAL_SPEAKERS||[]).forEach(l=>{const k=String(l.name||'').toLowerCase().trim(); if(!used.has(k)) out.push(l);});
  return out.filter(s=>s && s.is_published!==false).sort((a,b)=>Number(a.sort_order||100)-Number(b.sort_order||100));
}
function renderSpeakerCardFinal(s){
  const img=finalSpeakerImage(s); const lead=finalParagraphs(s.bio)[0]||''; const topics=finalTopics(s.topic).slice(0,3); const slug=finalSpeakerSlug(s.name);
  return `<article class="speaker-final-card ${s.is_featured?'is-featured':''}">
    <button type="button" class="speaker-card-open" data-speaker-slug="${esc(slug)}">
      <div class="speaker-final-image">${img?`<img src="${esc(img)}" alt="${esc(s.name)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('phantom');">`:`<span>${esc((s.name||'?').charAt(0))}</span>`}${s.is_featured?'<em>Kiemelt előadó</em>':''}</div>
      <div class="speaker-final-body"><span>Előadó</span><h2>${esc(s.name)}</h2>${s.subtitle?`<p class="speaker-final-subtitle">${esc(s.subtitle)}</p>`:''}${s.motto?`<blockquote>„${esc(s.motto)}”</blockquote>`:''}${lead?`<p>${esc(lead)}</p>`:''}${topics.length?`<div class="speaker-topic-list">${topics.map(t=>`<i>${esc(t)}</i>`).join('')}</div>`:''}<strong>Bővebben</strong></div>
    </button>
  </article>`;
}
function renderSpeakerDetailFinal(s){
  const img=finalSpeakerImage(s); const ps=finalParagraphs(s.bio); const topics=finalTopics(s.topic);
  return `<article class="speaker-detail-panel"><div class="speaker-detail-hero">${img?`<img src="${esc(img)}" alt="${esc(s.name)}">`:''}<div><span class="eyebrow">Előadó</span><h2>${esc(s.name)}</h2>${s.subtitle?`<p>${esc(s.subtitle)}</p>`:''}${s.motto?`<blockquote>„${esc(s.motto)}”</blockquote>`:''}</div></div><div class="speaker-detail-content"><h3>Bemutatkozás</h3>${ps.length?ps.map(p=>`<p>${esc(p)}</p>`).join(''):'<p>A részletes bemutatkozás hamarosan bővül.</p>'}${topics.length?`<div class="speaker-topic-list detail-topics">${topics.map(t=>`<i>${esc(t)}</i>`).join('')}</div>`:''}</div></article>`;
}
async function loadPublicSpeakers(){
  const el=document.getElementById('speakerList'); if(!el) return;
  let db=[]; try{const {data,error}=await client.from('speakers').select('*').eq('is_published',true).order('sort_order',{ascending:true}); if(!error&&data) db=data;}catch(e){console.log(e)}
  const speakers=finalMergeSpeakers(db); window.CSATANGOLO_SPEAKERS=speakers;
  el.innerHTML=speakers.map(renderSpeakerCardFinal).join('')+`<article class="speaker-final-card apply"><a href="kapcsolat.html"><div class="speaker-final-image phantom"><span>♞</span></div><div class="speaker-final-body"><span>Nyitott lehetőség</span><h2>Jelentkezz te is előadónak</h2><p>Kerülj fel hamarosan az előadók közé.</p><strong>Kapcsolatfelvétel</strong></div></a></article>`;
  if(!document.getElementById('speakerModal')){document.body.insertAdjacentHTML('beforeend',`<div id="speakerModal" class="speaker-modal hidden" role="dialog" aria-modal="true"><div class="speaker-modal-backdrop" data-close-speaker></div><div class="speaker-modal-window"><button class="speaker-modal-close" type="button" data-close-speaker>×</button><div id="speakerModalContent"></div></div></div>`);document.querySelectorAll('[data-close-speaker]').forEach(x=>x.addEventListener('click',()=>{document.getElementById('speakerModal').classList.add('hidden');document.body.classList.remove('modal-open');}));}
  el.querySelectorAll('[data-speaker-slug]').forEach(btn=>btn.addEventListener('click',()=>{const s=speakers.find(x=>finalSpeakerSlug(x.name)===btn.dataset.speakerSlug); if(!s)return; document.getElementById('speakerModalContent').innerHTML=renderSpeakerDetailFinal(s);document.getElementById('speakerModal').classList.remove('hidden');document.body.classList.add('modal-open');}));
}
