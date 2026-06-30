const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const MANAGER_PIN = "Tigris97";

let activeEvent = null;
let people = [];
let appearances = [];
let selectedPerson = null;
let selectedAppearance = null;

document.getElementById("speakerUnlock").addEventListener("click", unlockSpeakers);
document.getElementById("speakerPin").addEventListener("keydown", e => {
  if (e.key === "Enter") unlockSpeakers();
});
document.getElementById("reloadSpeakersBtn").addEventListener("click", loadSpeakerData);
document.getElementById("newPersonBtn").addEventListener("click", resetForm);
document.getElementById("resetSpeakerForm").addEventListener("click", resetForm);
document.getElementById("speakerSearch").addEventListener("input", renderSpeakerList);
document.getElementById("speakerFilter").addEventListener("change", renderSpeakerList);
document.getElementById("speakerForm").addEventListener("submit", saveSpeaker);
document.getElementById("deleteSpeakerBtn").addEventListener("click", deleteSelectedSpeaker);

function unlockSpeakers() {
  const message = document.getElementById("speakerLoginMessage");
  if (document.getElementById("speakerPin").value !== MANAGER_PIN) {
    message.className = "form-message error";
    message.textContent = "Hibás PIN.";
    return;
  }
  document.getElementById("speakerLogin").classList.add("hidden");
  document.getElementById("speakerContent").classList.remove("hidden");
  loadSpeakerData();
}

async function loadSpeakerData() {
  activeEvent = await loadActiveEvent(client);
  const meta = document.getElementById("speakerEventMeta");

  if (!activeEvent) {
    meta.textContent = "Nincs aktív rendezvény. Előbb állítsd be a Rendezvény oldalon.";
    return;
  }

  meta.textContent = [activeEvent.name, activeEvent.event_date ? formatEventDateHu(activeEvent.event_date) : ""].filter(Boolean).join(" • ");

  const peopleRes = await client.from("people").select("*").order("name", { ascending: true });
  const appRes = await client.from("event_speakers").select("*").eq("event_id", activeEvent.id).order("sort_order", { ascending: true });

  if (peopleRes.error || appRes.error) {
    console.error(peopleRes.error || appRes.error);
    document.getElementById("speakerList").innerHTML = `<p class="hint">Nem sikerült betölteni. Futtasd le a v1.7 SQL kódot a TESZT Supabase-ben.</p>`;
    return;
  }

  people = peopleRes.data || [];
  appearances = appRes.data || [];
  renderSpeakerList();
}

function renderSpeakerList() {
  const list = document.getElementById("speakerList");
  const q = document.getElementById("speakerSearch").value.toLowerCase().trim();
  const filter = document.getElementById("speakerFilter").value;

  let rows = people.map(person => ({
    person,
    appearance: appearances.find(a => a.person_id === person.id)
  }));

  rows = rows.filter(row => {
    const p = row.person;
    const a = row.appearance;
    const text = [p.name, p.title, p.city, p.bio, a?.talk_title].join(" ").toLowerCase();
    if (q && !text.includes(q)) return false;

    if (filter === "visible") return !!a?.is_visible;
    if (filter === "hidden") return a && !a.is_visible;
    if (filter === "featured") return !!a?.is_featured;
    return true;
  });

  if (!rows.length) {
    list.innerHTML = `<p class="hint">Nincs találat.</p>`;
    return;
  }

  list.innerHTML = rows.map(row => {
    const p = row.person;
    const a = row.appearance;
    return `
      <button type="button" class="speaker-row ${a?.is_visible ? "visible" : "not-visible"}" data-id="${p.id}">
        <span class="speaker-thumb">${p.image_filename ? `<img src="${escapeHtml(p.image_filename)}" alt="">` : "👤"}</span>
        <span class="speaker-row-text">
          <strong>${escapeHtml(p.name || "")}</strong>
          <small>${escapeHtml(p.title || "Nincs titulus")} ${p.city ? "• " + escapeHtml(p.city) : ""}</small>
          <em>${a?.is_visible ? "Látható" : a ? "Elrejtve" : "Nincs rendezvényhez rendelve"}</em>
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

  document.getElementById("editorTitle").textContent = selectedPerson.name || "Személy szerkesztése";
  document.getElementById("personId").value = selectedPerson.id || "";
  document.getElementById("appearanceId").value = selectedAppearance?.id || "";
  document.getElementById("personName").value = selectedPerson.name || "";
  document.getElementById("personTitle").value = selectedPerson.title || "";
  document.getElementById("personCity").value = selectedPerson.city || "";
  document.getElementById("personImage").value = selectedPerson.image_filename || "";
  document.getElementById("personBio").value = selectedPerson.bio || "";
  document.getElementById("personLink").value = selectedPerson.link_url || "";
  document.getElementById("talkTitle").value = selectedAppearance?.talk_title || "";
  document.getElementById("speakerOrder").value = selectedAppearance?.sort_order ?? 100;
  document.getElementById("speakerVisible").checked = selectedAppearance ? !!selectedAppearance.is_visible : true;
  document.getElementById("speakerFeatured").checked = selectedAppearance ? !!selectedAppearance.is_featured : false;
  document.getElementById("speakerFormMessage").textContent = "";
}

function resetForm() {
  selectedPerson = null;
  selectedAppearance = null;
  document.getElementById("editorTitle").textContent = "Új személy";
  document.getElementById("speakerForm").reset();
  document.getElementById("personId").value = "";
  document.getElementById("appearanceId").value = "";
  document.getElementById("speakerOrder").value = 100;
  document.getElementById("speakerVisible").checked = true;
  document.getElementById("speakerFeatured").checked = false;
  document.getElementById("speakerFormMessage").textContent = "";
}

async function saveSpeaker(event) {
  event.preventDefault();
  const msg = document.getElementById("speakerFormMessage");

  if (!activeEvent) {
    msg.className = "form-message error";
    msg.textContent = "Nincs aktív rendezvény.";
    return;
  }

  const personRow = {
    name: document.getElementById("personName").value.trim(),
    title: document.getElementById("personTitle").value.trim(),
    city: document.getElementById("personCity").value.trim(),
    image_filename: document.getElementById("personImage").value.trim(),
    bio: document.getElementById("personBio").value.trim(),
    link_url: document.getElementById("personLink").value.trim()
  };

  if (!personRow.name) {
    msg.className = "form-message error";
    msg.textContent = "A név kötelező.";
    return;
  }

  msg.className = "form-message";
  msg.textContent = "Mentés folyamatban...";

  const personId = document.getElementById("personId").value;
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
    talk_title: document.getElementById("talkTitle").value.trim(),
    sort_order: Number(document.getElementById("speakerOrder").value || 100),
    is_visible: document.getElementById("speakerVisible").checked,
    is_featured: document.getElementById("speakerFeatured").checked
  };

  const appearanceId = document.getElementById("appearanceId").value;
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
  await loadSpeakerData();
  selectPerson(savedPerson.id);
}

async function deleteSelectedSpeaker() {
  if (!selectedPerson) return;

  const ok = confirm(`Biztosan törlöd / leveszed ezt az előadót?\n\n${selectedPerson.name}\n\nElsőként csak az aktív rendezvényből vesszük le. A személy adatlapja megmarad.`);
  if (!ok) return;

  const msg = document.getElementById("speakerFormMessage");

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
  msg.textContent = "Levettük az aktív rendezvény előadói közül. A személy adatlapja megmaradt.";
  await loadSpeakerData();
  resetForm();
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
