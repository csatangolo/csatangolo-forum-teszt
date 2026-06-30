const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_CODE = "csatangolo2026";
let activeEvent = null;

const eventLogin = document.getElementById("eventLogin");
const eventSettingsContent = document.getElementById("eventSettingsContent");
const eventLoginMessage = document.getElementById("eventLoginMessage");
const eventSaveMessage = document.getElementById("eventSaveMessage");
const form = document.getElementById("eventSettingsForm");

document.getElementById("unlockEvents").addEventListener("click", async () => {
  if (document.getElementById("eventAdminCode").value !== ADMIN_CODE) {
    eventLoginMessage.className = "form-message error";
    eventLoginMessage.textContent = "Hibás admin kód.";
    return;
  }

  eventLogin.classList.add("hidden");
  eventSettingsContent.classList.remove("hidden");
  await loadActiveEvent();
});

document.getElementById("eventAdminCode").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("unlockEvents").click();
});

document.getElementById("loadEvent").addEventListener("click", loadActiveEvent);

form.addEventListener("input", updatePreview);
form.addEventListener("submit", saveEventSettings);

async function loadActiveEvent() {
  eventSaveMessage.className = "form-message";
  eventSaveMessage.textContent = "Betöltés...";

  let { data, error } = await client
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    eventSaveMessage.className = "form-message error";
    eventSaveMessage.textContent = "Nem sikerült betölteni. Futtasd le a v1.6 SQL kódot a TESZT Supabase-ben.";
    fillDefaults();
    updatePreview();
    return;
  }

  if (!data) {
    fillDefaults();
    eventSaveMessage.className = "form-message";
    eventSaveMessage.textContent = "Még nincs aktív rendezvény. Az alapadatokat kitöltöttem, mentés után létrejön.";
  } else {
    activeEvent = data;
    fillForm(data);
    eventSaveMessage.className = "form-message success";
    eventSaveMessage.textContent = "Aktív rendezvény betöltve.";
  }

  updatePreview();
}

function fillDefaults() {
  activeEvent = null;
  document.getElementById("eventId").value = "";
  document.getElementById("eventName").value = "I. Országos Belovagló és Lókiképző Szakmai Fórum";
  document.getElementById("eventDescription").value = "Lovas szakmai nap előadásokkal, gyakorlati bemutatókkal és közösségi programokkal a Csatangoló Lovardában.";
  document.getElementById("eventDate").value = "2026-07-25";
  document.getElementById("eventStartTime").value = "09:00";
  document.getElementById("eventEndTime").value = "";
  document.getElementById("eventCapacity").value = "";
  document.getElementById("eventLocation").value = "Csatangoló Lovarda";
  document.getElementById("eventAddress").value = "6311 Öregcsertő, Homokmégyi u. 39.";
  document.getElementById("eventContribution").value = "2000";
  document.getElementById("eventContactName").value = "Panyi Gyuri";
  document.getElementById("eventContactPhone").value = "";
  document.getElementById("eventContactEmail").value = "";
  document.getElementById("eventRegistrationUrl").value = "https://www.csatangolo.online/csatangolo-forum";
  document.getElementById("eventMapsUrl").value = "https://maps.app.goo.gl/1N2QbDjBaoTYU3Np9?g_st=ic";
  document.getElementById("eventFacebookUrl").value = "";
  document.getElementById("eventIsActive").checked = true;
}

function fillForm(event) {
  document.getElementById("eventId").value = event.id || "";
  document.getElementById("eventName").value = event.name || "";
  document.getElementById("eventDescription").value = event.description || "";
  document.getElementById("eventDate").value = event.event_date || "";
  document.getElementById("eventStartTime").value = event.start_time || "";
  document.getElementById("eventEndTime").value = event.end_time || "";
  document.getElementById("eventCapacity").value = event.capacity || "";
  document.getElementById("eventLocation").value = event.location_name || "";
  document.getElementById("eventAddress").value = event.location_address || "";
  document.getElementById("eventContribution").value = event.contribution_amount ?? "";
  document.getElementById("eventContactName").value = event.contact_name || "";
  document.getElementById("eventContactPhone").value = event.contact_phone || "";
  document.getElementById("eventContactEmail").value = event.contact_email || "";
  document.getElementById("eventRegistrationUrl").value = event.registration_url || "";
  document.getElementById("eventMapsUrl").value = event.google_maps_url || "";
  document.getElementById("eventFacebookUrl").value = event.facebook_url || "";
  document.getElementById("eventIsActive").checked = !!event.is_active;
}

function getFormData() {
  return {
    name: document.getElementById("eventName").value.trim(),
    description: document.getElementById("eventDescription").value.trim(),
    event_date: document.getElementById("eventDate").value || null,
    start_time: document.getElementById("eventStartTime").value || null,
    end_time: document.getElementById("eventEndTime").value || null,
    capacity: numberOrNull(document.getElementById("eventCapacity").value),
    location_name: document.getElementById("eventLocation").value.trim(),
    location_address: document.getElementById("eventAddress").value.trim(),
    contribution_amount: numberOrNull(document.getElementById("eventContribution").value),
    contact_name: document.getElementById("eventContactName").value.trim(),
    contact_phone: document.getElementById("eventContactPhone").value.trim(),
    contact_email: document.getElementById("eventContactEmail").value.trim(),
    registration_url: document.getElementById("eventRegistrationUrl").value.trim(),
    google_maps_url: document.getElementById("eventMapsUrl").value.trim(),
    facebook_url: document.getElementById("eventFacebookUrl").value.trim(),
    is_active: document.getElementById("eventIsActive").checked
  };
}

async function saveEventSettings(event) {
  event.preventDefault();

  const row = getFormData();
  if (!row.name) {
    eventSaveMessage.className = "form-message error";
    eventSaveMessage.textContent = "A rendezvény neve kötelező.";
    return;
  }

  eventSaveMessage.className = "form-message";
  eventSaveMessage.textContent = "Mentés folyamatban...";

  if (row.is_active) {
    await client.from("events").update({ is_active: false }).neq("id", document.getElementById("eventId").value || "00000000-0000-0000-0000-000000000000");
  }

  const id = document.getElementById("eventId").value;
  const query = id
    ? client.from("events").update(row).eq("id", id).select("*").single()
    : client.from("events").insert(row).select("*").single();

  const { data, error } = await query;

  if (error) {
    console.error(error);
    eventSaveMessage.className = "form-message error";
    eventSaveMessage.textContent = "Nem sikerült menteni. Ellenőrizd az INSERT/UPDATE jogosultságot.";
    return;
  }

  activeEvent = data;
  fillForm(data);
  updatePreview();
  eventSaveMessage.className = "form-message success";
  eventSaveMessage.textContent = "Rendezvény beállítások mentve.";
}

function updatePreview() {
  const row = getFormData();
  document.getElementById("previewName").textContent = row.name || "Rendezvény neve";
  document.getElementById("previewDescription").textContent = row.description || "Rövid leírás...";
  document.getElementById("previewDate").textContent = formatDate(row.event_date);
  document.getElementById("previewTime").textContent = [row.start_time, row.end_time].filter(Boolean).join(" – ") || "–";
  document.getElementById("previewLocation").textContent = [row.location_name, row.location_address].filter(Boolean).join(", ") || "–";
  document.getElementById("previewContribution").textContent = row.contribution_amount !== null ? formatFt(row.contribution_amount) : "–";
  document.getElementById("previewCapacity").textContent = row.capacity ? `${row.capacity} fő` : "Nincs megadva";

  const reg = document.getElementById("previewRegistrationLink");
  reg.href = row.registration_url || "#";
  reg.classList.toggle("disabled", !row.registration_url);

  const maps = document.getElementById("previewMapsLink");
  maps.href = row.google_maps_url || "#";
  maps.classList.toggle("disabled", !row.google_maps_url);
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function formatFt(num) {
  return new Intl.NumberFormat("hu-HU").format(Number(num || 0)) + " Ft";
}

function formatDate(value) {
  if (!value) return "–";
  const date = new Date(value + "T00:00:00");
  return date.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
}
