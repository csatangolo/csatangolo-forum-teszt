const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const MANAGER_PIN = "Tigris97";

let activeEvent = null;
let people = [];
let appearances = [];
let selectedPerson = null;
let selectedAppearance = null;

const $ = id => document.getElementById(id);

$("speakerUnlock").addEventListener("click", unlockSpeakers);
$("speakerPin").addEventListener("keydown", e => { if (e.key === "Enter") unlockSpeakers(); });
$("reloadSpeakersBtn").addEventListener("click", loadSpeakerData);
$("newPersonBtn").addEventListener("click", resetForm);
$("resetSpeakerForm").addEventListener("click", resetForm);
$("speakerSearch").addEventListener("input", renderSpeakerList);
$("speakerFilter").addEventListener("change", renderSpeakerList);
$("speakerForm").addEventListener("submit", saveSpeaker);
$("deleteSpeakerBtn").addEventListener("click", deleteSelectedSpeaker);

["personName","personTitle","personCity","personImage","personBio","personLink","talkTitle","speakerOrder","speakerVisible","speakerFeatured"].forEach(id => {
  $(id).addEventListener("input", () => {
    $("saveState").textContent = "Módosítva";
    $("saveState").className = "save-state changed";
    renderLivePreview();
  });
  $(id).addEventListener("change", renderLivePreview);
});

function unlockSpeakers() {
  const message = $("speakerLoginMessage");
  if ($("speakerPin").value !== MANAGER_PIN) {
    message.className = "form-message error";
    message.textContent = "Hibás PIN.";
    return;
  }
  $("speakerLogin").classList.add("hidden");
  $("speakerContent").classList.remove("hidden");
  loadSpeakerData();
}

async function loadSpeakerData() {
  activeEvent = await loadActiveEvent(client);
  const meta = $("speakerEventMeta");

  if (!activeEvent) {
    meta.textContent = "Nincs aktív rendezvény. Előbb állítsd be a Rendezvény oldalon.";
    return;
  }

  meta.textContent = [activeEvent.name, activeEvent.event_date ? formatEventDateHu(activeEvent.event_date) : ""].filter(Boolean).join(" • ");

  const peopleRes = await client.from("people").select("*").order("name", { ascending: true });
  const appRes = await client.from("event_speakers").select("*").eq("event_id", activeEvent.id).order("sort_order", { ascending: true });

  if (peopleRes.error || appRes.error) {
    console.error(peopleRes.error || appRes.error);
    $("speakerList").innerHTML = `<p class="hint">Nem sikerült betölteni az előadókat.</p>`;
    return;
  }

  people = peopleRes.data || [];
  appearances = appRes.data || [];
  renderStats();
  renderSpeakerList();
  renderLivePreview();
}

function getRows() {
  return people.map(person => ({
    person,
    appearance: appearances.find(a => String(a.person_id) === String(person.id))
  }));
}

function renderStats() {
  const rows = getRows();
  $("statAll").textContent = rows.length;
  $("statVisible").textContent = rows.filter(r => r.appearance?.is_visible).length;
  $("statFeatured").textContent = rows.filter(r => r.appearance?.is_featured).length;
  $("statHidden").textContent = rows.filter(r => r.appearance && !r.appearance.is_visible).length;
}

function renderSpeakerList() {
  const list = $("speakerList");
  const q = $("speakerSearch").value.toLowerCase().trim();
  const filter = $("speakerFilter").value;

  let rows = getRows();

  rows = rows.filter(row => {
    const p = row.person;
    const a = row.appearance;
    const text = [p.name, p.title, p.city, p.bio, a?.talk_title].join(" ").toLowerCase();
    if (q && !text.includes(q)) return false;
    if (filter === "visible") return !!a?.is_visible;
    if (filter === "hidden") return a && !a.is_visible;
    if (filter === "featured") return !!a?.is_featured;
    if (filter === "missing") return !p.bio || !p.image_filename;
    return true;
  });

  rows.sort((a,b) => Number(a.appearance?.sort_order || 100) - Number(b.appearance?.sort_order || 100));

  if (!rows.length) {
    list.innerHTML = `<p class="hint">Nincs találat.</p>`;
    return;
  }

  list.innerHTML = rows.map(row => {
    const p = row.person;
    const a = row.appearance;
    const img = speakerImageUrl(p.image_filename);
    const status = a?.is_visible ? "Publikus" : a ? "Rejtett" : "Nincs hozzárendelve";
    return `
      <button type="button" class="speaker-pro-card ${a?.is_visible ? "is-visible" : "is-hidden"} ${a?.is_featured ? "is-featured" : ""}" data-id="${p.id}">
        <span class="speaker-pro-thumb">${img ? `<img src="${escapeHtml(img)}" alt="">` : "👤"}</span>
        <span class="speaker-pro-card-text">
          <strong>${escapeHtml(p.name || "Névtelen")}</strong>
          <small>${escapeHtml(p.title || "Nincs szakterület")} ${p.city ? "• " + escapeHtml(p.city) : ""}</small>
          <em>${a?.is_featured ? "⭐ Kiemelt • " : ""}${escapeHtml(status)}</em>
        </span>
      </button>
    `;
  }).join("");

  list.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => selectPerson(btn.dataset.id));
  });
}

function selectPerson(id) {
  selectedPerson = people.find(p => String(p.id) === String(id));
  selectedAppearance = appearances.find(a => String(a.person_id) === String(id)) || null;
  if (!selectedPerson) return;

  $("editorTitle").textContent = selectedPerson.name || "Előadó szerkesztése";
  $("personId").value = selectedPerson.id || "";
  $("appearanceId").value = selectedAppearance?.id || "";
  $("personName").value = selectedPerson.name || "";
  $("personTitle").value = selectedPerson.title || "";
  $("personCity").value = selectedPerson.city || "";
  $("personImage").value = selectedPerson.image_filename || "";
  $("personBio").value = selectedPerson.bio || "";
  $("personLink").value = selectedPerson.link_url || "";
  $("talkTitle").value = selectedAppearance?.talk_title || "";
  $("speakerOrder").value = selectedAppearance?.sort_order ?? 100;
  $("speakerVisible").checked = selectedAppearance ? !!selectedAppearance.is_visible : true;
  $("speakerFeatured").checked = selectedAppearance ? !!selectedAppearance.is_featured : false;
  $("speakerFormMessage").textContent = "";
  $("saveState").textContent = "Mentve";
  $("saveState").className = "save-state saved";
  renderLivePreview();
}

function resetForm() {
  selectedPerson = null;
  selectedAppearance = null;
  $("editorTitle").textContent = "Új előadó";
  $("speakerForm").reset();
  $("personId").value = "";
  $("appearanceId").value = "";
  $("speakerOrder").value = 100;
  $("speakerVisible").checked = true;
  $("speakerFeatured").checked = false;
  $("speakerFormMessage").textContent = "";
  $("saveState").textContent = "Új adatlap";
  $("saveState").className = "save-state";
  renderLivePreview();
}

async function saveSpeaker(event) {
  event.preventDefault();
  const msg = $("speakerFormMessage");

  if (!activeEvent) {
    msg.className = "form-message error";
    msg.textContent = "Nincs aktív rendezvény.";
    return;
  }

  const personRow = {
    name: $("personName").value.trim(),
    title: $("personTitle").value.trim(),
    city: $("personCity").value.trim(),
    image_filename: $("personImage").value.trim(),
    bio: $("personBio").value.trim(),
    link_url: $("personLink").value.trim()
  };

  if (!personRow.name) {
    msg.className = "form-message error";
    msg.textContent = "A név kötelező.";
    return;
  }

  msg.className = "form-message";
  msg.textContent = "Mentés folyamatban...";
  $("saveState").textContent = "Mentés...";
  $("saveState").className = "save-state changed";

  const personId = $("personId").value;
  const personQuery = personId
    ? client.from("people").update(personRow).eq("id", personId).select("*").single()
    : client.from("people").insert(personRow).select("*").single();

  const { data: savedPerson, error: personError } = await personQuery;
  if (personError) {
    console.error(personError);
    msg.className = "form-message error";
    msg.textContent = "Nem sikerült menteni a személy adatlapját.";
    return;
  }

  const appRow = {
    event_id: activeEvent.id,
    person_id: savedPerson.id,
    talk_title: $("talkTitle").value.trim(),
    sort_order: Number($("speakerOrder").value || 100),
    is_visible: $("speakerVisible").checked,
    is_featured: $("speakerFeatured").checked
  };

  const appearanceId = $("appearanceId").value;
  const appQuery = appearanceId
    ? client.from("event_speakers").update(appRow).eq("id", appearanceId).select("*").single()
    : client.from("event_speakers").insert(appRow).select("*").single();

  const { error: appError } = await appQuery;
  if (appError) {
    console.error(appError);
    msg.className = "form-message error";
    msg.textContent = "A személy mentve, de a rendezvényhez rendelés nem sikerült.";
    return;
  }

  msg.className = "form-message success";
  msg.textContent = "Előadó mentve.";
  $("saveState").textContent = "Mentve";
  $("saveState").className = "save-state saved";

  await loadSpeakerData();
  selectPerson(savedPerson.id);
}

async function deleteSelectedSpeaker() {
  if (!selectedPerson) return;
  const ok = confirm(`Biztosan leveszed ezt az előadót az aktív rendezvényből?\n\n${selectedPerson.name}\n\nA személy adatlapja megmarad.`);
  if (!ok) return;

  const msg = $("speakerFormMessage");
  if (selectedAppearance) {
    const { error } = await client.from("event_speakers").delete().eq("id", selectedAppearance.id);
    if (error) {
      console.error(error);
      msg.className = "form-message error";
      msg.textContent = "Nem sikerült levenni a rendezvényből.";
      return;
    }
  }

  msg.className = "form-message success";
  msg.textContent = "Levettük az aktív rendezvény előadói közül.";
  await loadSpeakerData();
  resetForm();
}

function renderLivePreview() {
  const name = $("personName").value.trim() || "Előadó neve";
  const title = $("personTitle").value.trim() || "Szakterület / titulus";
  const city = $("personCity").value.trim();
  const bio = $("personBio").value.trim() || "A bemutatkozás élő előnézete itt jelenik meg.";
  const talk = $("talkTitle").value.trim();
  const img = speakerImageUrl($("personImage").value.trim());
  const featured = $("speakerFeatured").checked;
  const visible = $("speakerVisible").checked;

  $("imagePreview").innerHTML = img ? `<img src="${escapeHtml(img)}" alt="">` : "👤";

  $("speakerLivePreview").innerHTML = `
    <article class="speaker-preview-card ${featured ? "featured" : ""} ${visible ? "" : "muted"}">
      <div class="speaker-preview-image">${img ? `<img src="${escapeHtml(img)}" alt="">` : "👤"}</div>
      <div class="speaker-preview-body">
        <span>${featured ? "⭐ Kiemelt előadó" : visible ? "Előadó" : "Rejtett előadó"}</span>
        <h3>${escapeHtml(name)}</h3>
        <p class="speaker-preview-title">${escapeHtml(title)}${city ? " • " + escapeHtml(city) : ""}</p>
        ${talk ? `<p class="speaker-preview-talk">🎤 ${escapeHtml(talk)}</p>` : ""}
        <p>${escapeHtml(bio).slice(0, 260)}${bio.length > 260 ? "..." : ""}</p>
      </div>
    </article>
  `;
}

function speakerImageUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return value;
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
