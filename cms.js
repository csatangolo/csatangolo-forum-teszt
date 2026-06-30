const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_CODE = "csatangolo2026";
const BUCKET = "forum-assets";

const loginBox = document.getElementById("loginBox");
const cmsContent = document.getElementById("cmsContent");
const loginMessage = document.getElementById("loginMessage");
const speakerForm = document.getElementById("speakerForm");
const speakerFormTitle = document.getElementById("speakerFormTitle");
const speakerSubmitButton = document.getElementById("speakerSubmitButton");
const speakerCancelEdit = document.getElementById("speakerCancelEdit");
const speakerCurrentImage = document.getElementById("speakerCurrentImage");
let speakerRowsById = {};

const DEFAULT_SPEAKERS = [
  { name:"Panyi Gyuri", subtitle:"Lovas szakember • Gyakorlati szemlélet", image_url:"assets/panyi-gyuri.jpg", motto:"A lóval való munka alapja a tisztelet, a figyelem és a következetesség.", bio:"A fórumon gyakorlati szemlélettel, sokéves lovas tapasztalattal és nyitott szakmai gondolkodással vesz részt.", topic:"Belovaglás | Lókiképzés | Gyakorlati tapasztalat", sort_order:1, is_featured:true, is_published:true },
  { name:"Pataky Kata", subtitle:"Oktatás • Lóval való kapcsolat", image_url:"assets/pataky-kata.jpg", motto:"A figyelmes jelenlét sokszor többet tanít, mint bármilyen eszköz.", bio:"A lóval való finom, bizalmi kapcsolat és az oktatói jelenlét fontosságát képviseli.", topic:"Oktatás | Kapcsolat | Bizalom", sort_order:2, is_featured:true, is_published:true },
  { name:"Karl Péter", subtitle:"Western és ranch szemlélet • Horsemanship", image_url:"assets/karl-peter.jpg", motto:"A jó lóval való kapcsolat nem erőből, hanem megértésből épül.", bio:"A ló és ember közötti tiszta kommunikációt, a következetes segítségadást és a bizalmon alapuló munkát képviseli.", topic:"Horsemanship | Kommunikáció | Ranch szemlélet", sort_order:3, is_featured:false, is_published:true },
  { name:"Kevey Bella", subtitle:"Díjugratás • Sportló képzés", image_url:"assets/kevey-bella.jpeg.PNG", motto:"A teljesítmény mögött mindig ott van a pontos alapmunka.", bio:"Sportlovas szemlélettel, fegyelmezett, elegáns és lóközpontú megközelítéssel kapcsolódik a fórum szakmai programjához.", topic:"Díjugratás | Sportló | Alapmunka", sort_order:4, is_featured:false, is_published:true },
  { name:"Szabó Árpád", subtitle:"Akhal-teke tenyésztő • Csikónevelés", image_url:"assets/szabo-arpad-card.jpg", motto:"Először ki kell vívni a ló tiszteletét. Aztán el kell nyerni a bizalmát.", bio:"48 éve foglalkozom lovakkal, és úgy érzem, ma is ugyanazzal a lelkesedéssel tanulok tőlük, mint amikor először ültem nyeregbe. Számomra a lótenyésztés nem a csikó megszületéséig tart, hanem éppen ott kezdődik. Hiszem, hogy a tenyésztő felelőssége már az első pillanattól kialakítani azt a bizalmi kapcsolatot, amelyre később minden további képzés épülhet.", topic:"Csikónevelés | Tenyésztői felelősség | Akhal-teke fajta", facebook_url:"https://www.facebook.com/share/p/18LLaey9Xi/", website_url:"https://nava.hu/id/4473109/", sort_order:5, is_featured:false, is_published:true },
  { name:"Kaska Zoltán", subtitle:"Díjugratás • Versenytapasztalat", image_url:"assets/kaska-zoltan.jpg", motto:"A jó ugrás a felkészítésben kezdődik.", bio:"Díjugrató szemlélettel, versenytapasztalattal és gyakorlati lófelkészítési gondolatokkal érkezik a fórumra.", topic:"Díjugratás | Versenyló | Felkészítés", sort_order:6, is_featured:false, is_published:true },
  { name:"Benner Jani", subtitle:"Terepmunka • Használati ló képzés", image_url:"assets/benner-jani.jpg", motto:"A képzett ló terepen is magabiztos, figyelmes és együttműködő.", bio:"A használati szemléletű lókiképzés, a terepen is működő lovak és a gyakorlati tapasztalat oldaláról kapcsolódik a szakmai naphoz.", topic:"Terepmunka | Használati ló | Lókiképzés", sort_order:7, is_featured:false, is_published:true },
  { name:"Tisza Zoltán", subtitle:"Szabadidomítás • Lóval való kommunikáció", image_url:"assets/tisza-zoltan.jpg", motto:"A látványos munka mögött mindig pontos kommunikáció és bizalom áll.", bio:"A lóval való földi munka, a figyelem, a bizalom és a finom kommunikáció területéről hoz gyakorlati tapasztalatokat.", topic:"Szabadidomítás | Földi munka | Kommunikáció", sort_order:8, is_featured:false, is_published:true },
  { name:"Tászler Melinda", subtitle:"Szakágfüggetlen földi idomítómunka", image_url:"assets/taszler-melinda.jpg", motto:"A bizalom a földön kezdődik.", bio:"A lovak mindig arra tanítottak, hogy az igazi kapcsolat nem a felszereléseken múlik, hanem a bizalmon, a türelmen és a kölcsönös megértésen. Több mint húsz éve foglalkozom lovakkal, és az évek során a földi idomítómunka vált a legfontosabb szakterületemmé.\n\nHiszem, hogy minden sikeres lovas kapcsolat alapja a földről kezdődik. A szakágfüggetlen földi idomítómunka nem csupán egy módszer, hanem egy szemlélet, amely segít megérteni a ló gondolkodását, tiszta kommunikációt kialakítani, és olyan bizalmat építeni, amely később a nyeregben is érezhető.", topic:"Földi idomítómunka | Bizalom | Kommunikáció", sort_order:9, is_featured:false, is_published:true },
  { name:"Szabó Zoltán", subtitle:"Terepakadályok • Gyakorlati képzés", image_url:"assets/szabo-zoltan.jpg", motto:"A bátorság tanítható, ha a ló lépésről lépésre érti a feladatot.", bio:"Gyakorlati terepakadályos tapasztalattal és használati szemléletű lófelkészítéssel kapcsolódik a fórum programjához.", topic:"Terepakadály | Bátorság | Gyakorlati képzés", sort_order:10, is_featured:false, is_published:true }
];

document.getElementById("loginButton").addEventListener("click", async () => {
  if (document.getElementById("adminCode").value !== ADMIN_CODE) {
    loginMessage.className = "form-message error";
    loginMessage.textContent = "Hibás szervezői kód.";
    return;
  }
  loginBox.classList.add("hidden");
  cmsContent.classList.remove("hidden");
  await loadAll();
});

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".cms-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

function val(form, name) { const el = form.elements[name]; return el ? String(el.value || "").trim() : ""; }
function file(form, name) { return form.elements[name]?.files?.[0] || null; }
function checked(form, name) { return !!form.elements[name]?.checked; }
function esc(str) { return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function slug(s) { return String(s || "file").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "file"; }

async function uploadFile(fileObj, folder) {
  if (!fileObj) return "";
  const ext = fileObj.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${slug(fileObj.name)}.${ext}`;
  const { error } = await client.storage.from(BUCKET).upload(path, fileObj, { upsert: false });
  if (error) { console.error(error); throw new Error("Nem sikerült feltölteni a fájlt. Ellenőrizd a Supabase Storage beállítást és a forum-assets bucketet."); }
  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function insertRow(table, row, form) {
  const { error } = await client.from(table).insert(row);
  if (error) { alert("Nem sikerült menteni. Lehet, hogy még le kell futtatni az új SQL frissítést."); console.error(error); return false; }
  form.reset();
  if (form.elements["is_published"]) form.elements["is_published"].checked = true;
  await loadAll();
  return true;
}

async function updateRow(table, id, row) {
  const { error } = await client.from(table).update(row).eq("id", id);
  if (error) { alert("Nem sikerült frissíteni. Lehet, hogy még le kell futtatni az új SQL frissítést."); console.error(error); return false; }
  await loadAll();
  return true;
}

async function buildSpeakerRow(f, existing = {}) {
  const uploadedMain = await uploadFile(file(f,"image_file"), "speakers");
  const uploadedGallery1 = await uploadFile(file(f,"gallery_file_1"), "speakers");
  const uploadedGallery2 = await uploadFile(file(f,"gallery_file_2"), "speakers");
  const uploadedGallery3 = await uploadFile(file(f,"gallery_file_3"), "speakers");
  return {
    name: val(f,"name"),
    subtitle: val(f,"subtitle"),
    motto: val(f,"motto"),
    bio: val(f,"bio"),
    topic: val(f,"topic"),
    image_url: uploadedMain ? (uploadedMain + "?v=" + Date.now()) : (val(f,"image_url") || existing.image_url || ""),
    gallery_image_1_url: uploadedGallery1 || val(f,"gallery_image_1_url") || existing.gallery_image_1_url || "",
    gallery_image_2_url: uploadedGallery2 || val(f,"gallery_image_2_url") || existing.gallery_image_2_url || "",
    gallery_image_3_url: uploadedGallery3 || val(f,"gallery_image_3_url") || existing.gallery_image_3_url || "",
    facebook_url: val(f,"facebook_url"),
    instagram_url: val(f,"instagram_url"),
    youtube_url: val(f,"youtube_url"),
    website_url: val(f,"website_url"),
    sort_order: Number(val(f,"sort_order") || 100),
    is_featured: checked(f,"is_featured"),
    is_published: checked(f,"is_published")
  };
}

speakerForm.addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  const id = val(f, "id");
  const existing = id && speakerRowsById[id] ? speakerRowsById[id] : {};
  try {
    const row = await buildSpeakerRow(f, existing);
    const ok = id ? await updateRow("speakers", id, row) : await insertRow("speakers", row, f);
    if (ok) resetSpeakerForm();
  } catch(err) { alert(err.message); }
});

speakerCancelEdit.addEventListener("click", resetSpeakerForm);

function resetSpeakerForm() {
  speakerForm.reset();
  speakerForm.elements["id"].value = "";
  speakerForm.elements["sort_order"].value = "100";
  speakerForm.elements["is_published"].checked = true;
  speakerFormTitle.textContent = "Új előadó hozzáadása";
  speakerSubmitButton.textContent = "Előadó mentése";
  speakerCancelEdit.classList.add("hidden");
  speakerCurrentImage.classList.add("hidden");
  speakerCurrentImage.innerHTML = "";
}

function fillSpeakerForm(r) {
  const f = speakerForm;
  f.elements["id"].value = r.id || "";
  ["name","subtitle","motto","bio","topic","image_url","gallery_image_1_url","gallery_image_2_url","gallery_image_3_url","facebook_url","instagram_url","youtube_url","website_url","sort_order"].forEach(k => {
    if (f.elements[k]) f.elements[k].value = r[k] ?? (k === "sort_order" ? 100 : "");
  });
  f.elements["is_featured"].checked = !!r.is_featured;
  f.elements["is_published"].checked = r.is_published !== false;
  speakerFormTitle.textContent = r.id ? "Előadó szerkesztése" : "Alap előadó szerkesztése és mentése";
  speakerSubmitButton.textContent = r.id ? "Módosítások mentése" : "Előadó mentése adatbázisba";
  speakerCancelEdit.classList.remove("hidden");
  const imgs = [r.image_url, r.gallery_image_1_url, r.gallery_image_2_url, r.gallery_image_3_url].filter(Boolean);
  speakerCurrentImage.innerHTML = imgs.length ? `<strong>Jelenlegi képek:</strong><div class="current-image-grid">${imgs.map(u => `<img src="${esc(u)}" alt="">`).join("")}</div>` : "";
  speakerCurrentImage.classList.toggle("hidden", !imgs.length);
  document.getElementById("speakerEditorCard").scrollIntoView({ behavior:"smooth", block:"start" });
}

window.editSpeaker = function(id) {
  const r = speakerRowsById[id];
  if (!r) return;
  fillSpeakerForm(r);
};

window.editDefaultSpeaker = function(index) {
  const r = { ...DEFAULT_SPEAKERS[index] };
  fillSpeakerForm(r);
};

document.getElementById("programForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  insertRow("program_items", { time_label: val(f,"time_label"), title: val(f,"title"), description: val(f,"description"), sort_order: Number(val(f,"sort_order") || 100), is_published: checked(f,"is_published") }, f);
});

document.getElementById("videoForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  insertRow("videos", { title: val(f,"title"), youtube_url: val(f,"youtube_url"), description: val(f,"description"), category: val(f,"category"), sort_order: Number(val(f,"sort_order") || 100), is_published: checked(f,"is_published") }, f);
});

document.getElementById("newsForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  insertRow("news", { title: val(f,"title"), body: val(f,"body"), is_published: checked(f,"is_published") }, f);
});

document.getElementById("sponsorForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  try {
    const uploaded = await uploadFile(file(f,"logo_file"), "sponsors");
    await insertRow("sponsors", { name: val(f,"name"), logo_url: uploaded || val(f,"logo_url"), website_url: val(f,"website_url"), sort_order: Number(val(f,"sort_order") || 100), is_published: checked(f,"is_published") }, f);
  } catch(err) { alert(err.message); }
});

document.getElementById("galleryForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  try {
    const uploaded = await uploadFile(file(f,"image_file"), "gallery");
    await insertRow("gallery", { title: val(f,"title"), image_url: uploaded, description: val(f,"description"), is_published: checked(f,"is_published") }, f);
  } catch(err) { alert(err.message); }
});

document.getElementById("documentForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  try {
    const uploaded = await uploadFile(file(f,"file"), "documents");
    await insertRow("documents", { title: val(f,"title"), file_url: uploaded, description: val(f,"description"), is_published: checked(f,"is_published") }, f);
  } catch(err) { alert(err.message); }
});

async function loadAll() {
  await Promise.all([
    loadSpeakers(),
    loadTable("program_items","programAdminList", r => `<strong>${esc(r.time_label)} – ${esc(r.title)}</strong><span>${esc(r.description || "")}</span>`),
    loadTable("videos","videoAdminList", r => `<strong>${esc(r.title)}</strong><span>${esc(r.youtube_url || "")}</span>`),
    loadTable("news","newsAdminList", r => `<strong>${esc(r.title)}</strong><span>${esc(r.body || "")}</span>`),
    loadTable("sponsors","sponsorAdminList", r => `<strong>${esc(r.name)}</strong><span>${esc(r.website_url || "")}</span>${r.logo_url ? `<img class="cms-thumb small" src="${esc(r.logo_url)}">` : ""}`),
    loadTable("gallery","galleryAdminList", r => `<strong>${esc(r.title || "Galéria kép")}</strong><span>${esc(r.description || "")}</span>${r.image_url ? `<img class="cms-thumb" src="${esc(r.image_url)}">` : ""}`),
    loadTable("documents","documentAdminList", r => `<strong>${esc(r.title)}</strong><span>${esc(r.description || "")}</span>${r.file_url ? `<a class="mini-link" href="${esc(r.file_url)}" target="_blank">Fájl megnyitása</a>` : ""}`)
  ]);
}

async function loadSpeakers() {
  const el = document.getElementById("speakerAdminList");
  const { data, error } = await client.from("speakers").select("*").order("sort_order", { ascending: true });
  if (error) {
    el.innerHTML = `<div class="card"><p>Nem sikerült betölteni az előadókat. Ellenőrizd a Supabase kapcsolatot.</p></div>`;
    console.error(error);
    return;
  }
  const rows = data || [];
  speakerRowsById = {};
  rows.forEach(r => speakerRowsById[r.id] = r);

  const existingNames = new Set(rows.map(r => String(r.name || "").toLowerCase().trim()));
  const defaultOnly = DEFAULT_SPEAKERS.map((r, i) => ({ ...r, defaultIndex: i })).filter(r => !existingNames.has(String(r.name || "").toLowerCase().trim()));

  const dbHtml = rows.map(r => speakerRowHtml(r, false)).join("");
  const defaultsHtml = defaultOnly.map(r => speakerRowHtml(r, true)).join("");
  if (!dbHtml && !defaultsHtml) {
    el.innerHTML = `<div class="card"><p class="hint">Még nincs mentett előadó.</p></div>`;
    return;
  }
  el.innerHTML = `
    ${dbHtml ? `<h3 class="cms-list-title">Szerkeszthető, mentett előadók</h3>${dbHtml}` : ""}
    ${defaultsHtml ? `<h3 class="cms-list-title">Alap előadók a kódból</h3><p class="hint">Ezek még nincsenek az adatbázisban. A „Szerkesztés és mentés” gombbal átemelheted őket, utána teljesen szerkeszthetők lesznek.</p>${defaultsHtml}` : ""}
  `;
}

function speakerRowHtml(r, isDefault) {
  const gallery = [r.gallery_image_1_url, r.gallery_image_2_url, r.gallery_image_3_url].filter(Boolean);
  const editAttr = isDefault ? `onclick="editDefaultSpeaker('${r.defaultIndex}')"` : `onclick="editSpeaker('${r.id}')"`;
  const deleteButton = isDefault ? "" : `<button class="mini-button danger" onclick="deleteRow('speakers','${r.id}')">Törlés</button>`;
  return `
    <article class="cms-row">
      <div>
        <strong>${esc(r.name)}</strong>
        <span>${esc(r.motto ? "„" + r.motto + "”" : "")}</span>
        <span>${esc(r.subtitle || "")}</span>
        ${r.is_featured ? "<small>⭐ Kiemelt előadó</small>" : ""}
        <small>${r.is_published !== false ? "Publikus" : "Rejtett"}${isDefault ? " • Alapértelmezett" : ""}</small>
        <div class="cms-thumb-row">
          ${r.image_url ? `<img class="cms-thumb" src="${esc(r.image_url)}" alt="">` : ""}
          ${gallery.map(u => `<img class="cms-thumb small" src="${esc(u)}" alt="">`).join("")}
        </div>
      </div>
      <div class="cms-actions">
        <button class="mini-button" ${editAttr}>${isDefault ? "Szerkesztés és mentés" : "Szerkesztés"}</button>
        ${deleteButton}
      </div>
    </article>`;
}

async function loadTable(table, elementId, renderFn) {
  const el = document.getElementById(elementId);
  const { data, error } = await client.from(table).select("*").order("created_at", { ascending: false });
  if (error) { el.innerHTML = `<div class="card"><p>Nem sikerült betölteni: ${table}</p></div>`; return; }
  if (!data.length) { el.innerHTML = `<div class="card"><p class="hint">Még nincs mentett tartalom.</p></div>`; return; }
  el.innerHTML = data.map(r => `
    <article class="cms-row">
      <div>${renderFn(r)}<small>${r.is_published ? "Publikus" : "Rejtett"}</small></div>
      <button class="mini-button danger" onclick="deleteRow('${table}','${r.id}')">Törlés</button>
    </article>
  `).join("");
}

async function deleteRow(table, id) {
  if (!confirm("Biztosan törlöd?")) return;
  const { error } = await client.from(table).delete().eq("id", id);
  if (error) { alert("Nem sikerült törölni. Ellenőrizd a jogosultságokat."); console.error(error); return; }
  await loadAll();
}
