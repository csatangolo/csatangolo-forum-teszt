const SUPABASE_URL = "https://ywkabsgazkzrjgjncbfc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DJvD1Hoou3Tn74T9BFx0ww_O6ObFlxY";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const MANAGER_PIN = "Tigris97";
const SPEAKER_IMAGE_BUCKET = "forum-assets";

async function loadActiveEvent(client) {
  const { event } = await loadOrCreateEvent(client);
  return event;
}

async function loadOrCreateEvent(client) {
  try {
    const { data, error } = await client
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (!error && Array.isArray(data) && data.length) {
      allEvents = data;
      const active = data.find(e => e.is_active === true) || data[0];
      return { event: active, created: false };
    }
  } catch (error) {
    console.warn("Rendezvények betöltése nem sikerült:", error);
  }

  try {
    const defaultEvent = {
      name: "I. Országos Belovagló és Lókiképző Szakmai Fórum",
      title: "I. Országos Belovagló és Lókiképző Szakmai Fórum",
      event_date: "2026-07-25",
      start_time: "09:00",
      location: "6311 Öregcsertő, Homokmégyi u. 39.",
      is_active: true
    };

    const { data, error } = await client
      .from("events")
      .insert(defaultEvent)
      .select("*")
      .single();

    if (!error && data) {
      allEvents = [data];
      return { event: data, created: true };
    }
  } catch (error) {
    console.warn("Alap rendezvény létrehozása nem sikerült:", error);
  }

  return { event: null, created: false };
}

function formatEventDateHu(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("hu-HU", { year:"numeric", month:"long", day:"numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}



let activeEvent = null;
let allEvents = [];
let people = [];
let appearances = [];
let selectedPerson = null;
let selectedAppearance = null;
let speakerGalleryImages = ["", "", ""];
let draggedPersonId = null;

const $ = id => document.getElementById(id);

$("speakerUnlock").addEventListener("click", unlockSpeakers);
$("speakerPin").addEventListener("keydown", e => { if (e.key === "Enter") unlockSpeakers(); });
$("reloadSpeakersBtn").addEventListener("click", loadSpeakerData);
$("speakerEventSelect").addEventListener("change", async () => {
  const selectedId = $("speakerEventSelect").value;
  activeEvent = allEvents.find(e => String(e.id) === String(selectedId)) || activeEvent;
  await migrateLegacySpeakersIfNeeded();
  await loadSpeakerData(false);
});
$("newPersonBtn").addEventListener("click", resetForm);
$("resetSpeakerForm").addEventListener("click", resetForm);
$("speakerSearch").addEventListener("input", renderSpeakerList);
$("speakerFilter").addEventListener("change", renderSpeakerList);
$("speakerForm").addEventListener("submit", saveSpeaker);
$("deleteSpeakerBtn").addEventListener("click", deleteSelectedSpeaker);
initSpeakerMediaUpload();

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

async function loadSpeakerData(allowAutoMigration = true) {
  const loaded = await loadOrCreateEvent(client);
  if (!activeEvent) activeEvent = loaded.event;
  if (!activeEvent && loaded.event) activeEvent = loaded.event;

  const meta = $("speakerEventMeta");
  renderEventSelect();

  if (!activeEvent) {
    meta.textContent = "Nem sikerült rendezvényt létrehozni vagy betölteni.";
    $("speakerList").innerHTML = `<p class="hint">Nincs elérhető rendezvény.</p>`;
    return;
  }

  meta.textContent = [activeEvent.name || activeEvent.title, activeEvent.event_date ? formatEventDateHu(activeEvent.event_date) : ""].filter(Boolean).join(" • ");

  if (allowAutoMigration) {
    await migrateLegacySpeakersIfNeeded();
  }

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

function renderEventSelect() {
  const select = $("speakerEventSelect");
  if (!select) return;

  select.innerHTML = (allEvents || []).map(event => {
    const label = [event.name || event.title || "Rendezvény", event.event_date ? formatEventDateHu(event.event_date) : ""].filter(Boolean).join(" – ");
    return `<option value="${escapeHtml(event.id)}">${escapeHtml(label)}</option>`;
  }).join("");

  if (activeEvent) select.value = activeEvent.id;
}

async function migrateLegacySpeakersIfNeeded() {
  if (!activeEvent) return;

  const existingRes = await client
    .from("event_speakers")
    .select("id")
    .eq("event_id", activeEvent.id)
    .limit(1);

  if (!existingRes.error && existingRes.data && existingRes.data.length) return;

  let legacy = [];
  try {
    const { data, error } = await client
      .from("speakers")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data) legacy = data;
  } catch (error) {
    console.warn("Régi speakers tábla nem olvasható:", error);
  }

  if (!legacy.length) return;

  const msg = $("speakerFormMessage");
  if (msg) {
    msg.className = "form-message";
    msg.textContent = "Meglévő előadók átvétele az új rendszerbe...";
  }

  for (const old of legacy) {
    const oldName = old.name || old.full_name || old.title || "";
    if (!oldName.trim()) continue;

    let person = null;

    const found = await client
      .from("people")
      .select("*")
      .ilike("name", oldName.trim())
      .limit(1)
      .maybeSingle();

    if (!found.error && found.data) {
      person = found.data;
    } else {
      const personRow = {
        name: oldName.trim(),
        title: old.subtitle || old.profession || old.role || old.topic || "",
        city: old.city || old.location || "",
        image_filename: old.image_url || old.main_image_url || old.photo_url || old.profile_image_url || "",
        bio: old.bio || old.description || "",
        link_url: old.website_url || old.facebook_url || old.report_url || "",
        gallery_images: Array.isArray(old.gallery_images) ? old.gallery_images : []
      };

      const inserted = await client
        .from("people")
        .insert(personRow)
        .select("*")
        .single();

      if (!inserted.error) person = inserted.data;
    }

    if (!person) continue;

    const exists = await client
      .from("event_speakers")
      .select("id")
      .eq("event_id", activeEvent.id)
      .eq("person_id", person.id)
      .limit(1);

    if (!exists.error && exists.data && exists.data.length) continue;

    await client.from("event_speakers").insert({
      event_id: activeEvent.id,
      person_id: person.id,
      talk_title: old.talk_title || old.topic || old.subtitle || old.title || "",
      sort_order: Number(old.sort_order || 100),
      is_visible: old.is_visible !== false && old.is_published !== false,
      is_featured: !!old.is_featured
    });
  }

  if (msg) {
    msg.className = "form-message success";
    msg.textContent = "Meglévő előadók átvéve az új rendszerbe.";
  }
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
      <button type="button" draggable="true" class="speaker-pro-card ${a?.is_visible ? "is-visible" : "is-hidden"} ${a?.is_featured ? "is-featured" : ""}" data-id="${p.id}">
        <span class="speaker-drag-handle">☰</span><span class="speaker-pro-thumb">${img ? `<img src="${escapeHtml(img)}" alt="">` : "👤"}</span>
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

    btn.addEventListener("dragstart", event => {
      draggedPersonId = btn.dataset.id;
      btn.classList.add("dragging-card");
      event.dataTransfer.effectAllowed = "move";
    });

    btn.addEventListener("dragend", () => {
      draggedPersonId = null;
      btn.classList.remove("dragging-card");
      document.querySelectorAll(".speaker-pro-card.drag-over").forEach(el => el.classList.remove("drag-over"));
    });

    btn.addEventListener("dragover", event => {
      event.preventDefault();
      if (draggedPersonId && draggedPersonId !== btn.dataset.id) btn.classList.add("drag-over");
    });

    btn.addEventListener("dragleave", () => btn.classList.remove("drag-over"));

    btn.addEventListener("drop", async event => {
      event.preventDefault();
      btn.classList.remove("drag-over");
      if (!draggedPersonId || draggedPersonId === btn.dataset.id) return;
      await reorderSpeakers(draggedPersonId, btn.dataset.id);
    });
  });
}


async function reorderSpeakers(sourcePersonId, targetPersonId) {
  const rows = getRows()
    .filter(row => row.appearance)
    .sort((a,b) => Number(a.appearance?.sort_order || 100) - Number(b.appearance?.sort_order || 100));

  const fromIndex = rows.findIndex(row => String(row.person.id) === String(sourcePersonId));
  const toIndex = rows.findIndex(row => String(row.person.id) === String(targetPersonId));
  if (fromIndex < 0 || toIndex < 0) return;

  const [moved] = rows.splice(fromIndex, 1);
  rows.splice(toIndex, 0, moved);

  const updates = rows.map((row, index) => ({
    id: row.appearance.id,
    sort_order: (index + 1) * 10
  }));

  const msg = $("speakerFormMessage");
  msg.className = "form-message";
  msg.textContent = "Sorrend mentése...";

  for (const item of updates) {
    const { error } = await client
      .from("event_speakers")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      msg.className = "form-message error";
      msg.textContent = "Nem sikerült menteni a sorrendet.";
      return;
    }
  }

  msg.className = "form-message success";
  msg.textContent = "Sorrend mentve.";
  await loadSpeakerData();
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
  speakerGalleryImages = normalizeGalleryImages(selectedPerson.gallery_images);
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
  $("personImage").value = "";
  speakerGalleryImages = ["", "", ""];
  renderMediaManager();
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
    link_url: $("personLink").value.trim(),
    gallery_images: speakerGalleryImages.filter(Boolean)
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


function makeSafeFileName(name) {
  return String(name || "image.jpg")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}


function initSpeakerMediaUpload() {
  const mainZone = $("mainImageDrop");
  const mainInput = $("mainImageFile");

  if (mainZone && mainInput && !mainZone.dataset.ready) {
    mainZone.dataset.ready = "1";
    mainZone.addEventListener("click", event => {
      if (event.target.tagName !== "BUTTON") mainInput.click();
    });
    mainInput.addEventListener("change", () => {
      const file = mainInput.files && mainInput.files[0];
      if (file) uploadSpeakerMedia(file, "main");
    });
    wireDropZone(mainZone, file => uploadSpeakerMedia(file, "main"));
  }

  document.querySelectorAll(".speaker-drop-zone.gallery").forEach(zone => {
    if (zone.dataset.ready) return;
    zone.dataset.ready = "1";
    const slot = Number(zone.dataset.slot);
    const input = zone.querySelector("input[type=file]");

    zone.addEventListener("click", event => {
      const action = event.target.closest("[data-media-action]");
      if (action) return;
      input.click();
    });

    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (file) uploadSpeakerMedia(file, "gallery", slot);
    });

    wireDropZone(zone, file => uploadSpeakerMedia(file, "gallery", slot));
  });

  renderMediaManager();
}

function wireDropZone(zone, callback) {
  ["dragenter", "dragover"].forEach(type => {
    zone.addEventListener(type, event => {
      event.preventDefault();
      zone.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach(type => {
    zone.addEventListener(type, event => {
      event.preventDefault();
      zone.classList.remove("dragging");
    });
  });

  zone.addEventListener("drop", event => {
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) callback(file);
  });
}

async function uploadSpeakerMedia(file, kind, slot = null) {
  const msg = $("speakerFormMessage");

  if (!file.type || !file.type.startsWith("image/")) {
    msg.className = "form-message error";
    msg.textContent = "Csak képfájlt lehet feltölteni.";
    return;
  }

  msg.className = "form-message";
  msg.textContent = "Kép optimalizálása és feltöltése...";

  try {
    const optimized = await optimizeImage(file, kind === "main" ? 1200 : 1000);
    const currentName = $("personName").value.trim() || "eloadok";
    const safeName = makeSafeFileName(`${currentName}-${kind}-${slot ?? "main"}-${file.name.replace(/\.[^.]+$/, "")}.jpg`);
    const path = `speakers/${Date.now()}-${safeName}`;

    const { error } = await client.storage
      .from(SPEAKER_IMAGE_BUCKET)
      .upload(path, optimized, { cacheControl: "3600", upsert: false, contentType: "image/jpeg" });

    if (error) throw error;

    const { data } = client.storage.from(SPEAKER_IMAGE_BUCKET).getPublicUrl(path);

    if (kind === "main") {
      $("personImage").value = data.publicUrl;
    } else {
      speakerGalleryImages[slot] = data.publicUrl;
    }

    msg.className = "form-message success";
    msg.textContent = "Kép feltöltve. Mentéskor bekerül az előadó adatlapjára.";
    $("saveState").textContent = "Módosítva";
    $("saveState").className = "save-state changed";
    renderLivePreview();
  } catch (error) {
    console.error(error);
    msg.className = "form-message error";
    msg.textContent = "Nem sikerült feltölteni a képet. Ellenőrizd a Storage jogosultságokat.";
  }
}

function optimizeImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;
      const ratio = Math.min(maxSize / width, maxSize / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(blob => {
        if (!blob) reject(new Error("Nem sikerült tömöríteni a képet."));
        else resolve(blob);
      }, "image/jpeg", 0.84);
    };

    img.onerror = () => reject(new Error("Nem sikerült megnyitni a képet."));
    img.src = url;
  });
}

function renderMediaManager() {
  const mainUrl = speakerImageUrl($("personImage").value.trim());
  const mainPreview = $("mainImagePreview");

  if (mainPreview) {
    mainPreview.innerHTML = mainUrl
      ? `<img src="${escapeHtml(mainUrl)}" alt=""><button type="button" data-media-action="remove-main">Törlés</button>`
      : "📷";
  }

  document.querySelectorAll(".speaker-drop-zone.gallery").forEach(zone => {
    const slot = Number(zone.dataset.slot);
    const url = speakerImageUrl(speakerGalleryImages[slot]);
    const preview = zone.querySelector(".speaker-drop-preview");
    if (!preview) return;

    preview.innerHTML = url
      ? `<img src="${escapeHtml(url)}" alt="">
          <div class="speaker-media-buttons">
            <button type="button" data-media-action="make-main" data-slot="${slot}">⭐ Főkép</button>
            <button type="button" data-media-action="remove-gallery" data-slot="${slot}">Törlés</button>
          </div>`
      : "+";
  });

  const counter = $("speakerImageCounter");
  if (counter) {
    const count = ($("personImage").value.trim() ? 1 : 0) + speakerGalleryImages.filter(Boolean).length;
    counter.textContent = `${count}/4 kép`;
  }

  document.querySelectorAll("[data-media-action]").forEach(btn => {
    if (btn.dataset.ready) return;
    btn.dataset.ready = "1";
    btn.addEventListener("click", event => {
      event.stopPropagation();
      const action = btn.dataset.mediaAction;
      const slot = Number(btn.dataset.slot);

      if (action === "remove-main") {
        $("personImage").value = "";
      }

      if (action === "remove-gallery") {
        speakerGalleryImages[slot] = "";
      }

      if (action === "make-main") {
        const oldMain = $("personImage").value.trim();
        $("personImage").value = speakerGalleryImages[slot] || "";
        speakerGalleryImages[slot] = oldMain;
      }

      $("saveState").textContent = "Módosítva";
      $("saveState").className = "save-state changed";
      renderLivePreview();
    });
  });
}

function normalizeGalleryImages(value) {
  let arr = [];

  if (Array.isArray(value)) arr = value;
  else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) arr = parsed;
    } catch {
      arr = value.split(",").map(x => x.trim()).filter(Boolean);
    }
  }

  return [arr[0] || "", arr[1] || "", arr[2] || ""];
}

function renderLivePreview() {
  const name = $("personName").value.trim() || "Előadó neve";
  const title = $("personTitle").value.trim() || "Szakterület / titulus";
  const city = $("personCity").value.trim();
  const bio = $("personBio").value.trim() || "A bemutatkozás élő előnézete itt jelenik meg.";
  const talk = $("talkTitle").value.trim();
  const img = speakerImageUrl($("personImage").value.trim());
  const gallery = speakerGalleryImages.filter(Boolean).map(speakerImageUrl);
  renderMediaManager();
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
        ${gallery.length ? `<div class="speaker-preview-gallery">${gallery.map(url => `<img src="${escapeHtml(url)}" alt="">`).join("")}</div>` : ""}
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
