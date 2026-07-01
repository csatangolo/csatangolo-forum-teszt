const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const MANAGER_PIN = "Tigris97";

let dashboardState = {
  event: null,
  participants: [],
  people: [],
  appearances: [],
  albums: [],
  galleryItems: []
};

document.getElementById("managerUnlock").addEventListener("click", unlockManager);
document.getElementById("managerPin").addEventListener("keydown", event => {
  if (event.key === "Enter") unlockManager();
});

function unlockManager() {
  const message = document.getElementById("managerLoginMessage");
  if (document.getElementById("managerPin").value !== MANAGER_PIN) {
    message.className = "form-message error";
    message.textContent = "Hibás Manager PIN.";
    return;
  }

  document.getElementById("managerLogin").classList.add("hidden");
  document.getElementById("managerContent").classList.remove("hidden");
  loadManagerData();
}

async function loadManagerData() {
  setGreeting();

  const event = await loadActiveEvent(client);
  dashboardState.event = event;

  if (!event) {
    renderNoEvent();
    return;
  }

  renderEvent(event);
  await loadStats(event.id);
  renderStats();
  renderSystemStatus();
  renderTodos();
  renderReadiness();
}

function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "Jó napot! 👋";
  if (hour < 10) greeting = "Jó reggelt! 👋";
  else if (hour >= 18) greeting = "Jó estét! 👋";
  document.getElementById("managerGreeting").textContent = greeting;
}

function renderNoEvent() {
  document.getElementById("managerSubtitle").textContent = "Nincs aktív rendezvény beállítva.";
  document.getElementById("managerEventName").textContent = "Nincs aktív rendezvény";
  document.getElementById("managerTodos").innerHTML = `<div class="warn">🟡 Hozz létre vagy aktiválj egy rendezvényt.</div>`;
  document.getElementById("managerSystemStatus").innerHTML = `<div class="warn">🟡 Aktív rendezvény hiányzik.</div>`;
  document.getElementById("readinessPercent").textContent = "0%";
  document.getElementById("readinessText").textContent = "Előbb aktív rendezvény szükséges.";
  document.getElementById("readinessBar").style.width = "0%";
}

function renderEvent(event) {
  document.getElementById("managerSubtitle").textContent = "Minden fontos adat egy helyen.";
  document.getElementById("managerEventName").textContent = event.name || "Aktív rendezvény";
  document.getElementById("managerEventDate").textContent = event.event_date ? "📅 " + formatEventDateHu(event.event_date) : "📅 –";
  document.getElementById("managerEventTime").textContent = "🕘 " + (formatEventTimeRange(event) || "–");
  document.getElementById("managerEventLocation").textContent = "📍 " + (event.location_name || event.location_address || "–");
  document.getElementById("managerEventFee").textContent = "💰 " + (event.contribution_amount ? formatFtHu(event.contribution_amount) : "–");

  const days = daysUntil(event.event_date);
  document.getElementById("daysUntilEvent").textContent = days === null ? "–" : days;
}

async function loadStats(eventId) {
  const safe = async (query, fallback = []) => {
    try {
      const { data, error } = await query;
      if (error) {
        console.warn(error);
        return fallback;
      }
      return data || fallback;
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  };

  dashboardState.participants = await safe(client.from("participants").select("*").order("created_at", { ascending: true }));
  dashboardState.people = await safe(client.from("people").select("*"));
  dashboardState.appearances = await safe(client.from("event_speakers").select("*").eq("event_id", eventId));
  dashboardState.albums = await safe(client.from("gallery_albums").select("*").eq("event_id", eventId));
  dashboardState.galleryItems = await safe(client.from("gallery_items").select("*").eq("event_id", eventId));
}

function renderStats() {
  const participants = dashboardState.participants || [];
  const checkedIn = participants.filter(p => p.checked_in);
  const appearances = dashboardState.appearances || [];
  const galleryItems = dashboardState.galleryItems || [];

  document.getElementById("kpiParticipants").textContent = participants.length;
  document.getElementById("kpiCheckedIn").textContent = checkedIn.length;
  document.getElementById("kpiSpeakers").textContent = appearances.length;
  document.getElementById("kpiGallery").textContent = galleryItems.length;
}

function renderSystemStatus() {
  const event = dashboardState.event;
  const rows = [
    event ? ["ok", "🟢 Aktív rendezvény beállítva"] : ["warn", "🟡 Nincs aktív rendezvény"],
    dashboardState.participants ? ["ok", "🟢 Jelentkezők tábla elérhető"] : ["warn", "🟡 Jelentkezők nem elérhetők"],
    dashboardState.appearances ? ["ok", "🟢 Előadó modul elérhető"] : ["warn", "🟡 Előadó modul ellenőrzést igényel"],
    dashboardState.galleryItems ? ["ok", "🟢 Galéria modul elérhető"] : ["warn", "🟡 Galéria modul ellenőrzést igényel"],
    ["ok", "🟢 Manager PIN aktív"]
  ];

  document.getElementById("managerSystemStatus").innerHTML = rows
    .map(([cls, text]) => `<div class="${cls}">${text}</div>`)
    .join("");
}

function renderTodos() {
  const todos = [];
  const event = dashboardState.event;
  const appearances = dashboardState.appearances || [];
  const people = dashboardState.people || [];
  const galleryItems = dashboardState.galleryItems || [];

  if (!event?.registration_url) todos.push(["warn", "🟡 Hiányzik a jelentkezési link."]);
  if (!event?.google_maps_url) todos.push(["warn", "🟡 Hiányzik a Google Térkép link."]);
  if (!appearances.length) todos.push(["warn", "🟡 Még nincs előadó rendelve az aktív rendezvényhez."]);
  if (appearances.length) {
    const missingPeople = appearances
      .map(a => people.find(p => p.id === a.person_id))
      .filter(p => p && (!p.image_filename || !p.bio));
    if (missingPeople.length) todos.push(["warn", `🟡 ${missingPeople.length} előadónál hiányzik kép vagy bemutatkozás.`]);
  }
  if (!galleryItems.length) todos.push(["warn", "🟡 Még nincs kép a galériában."]);
  if (galleryItems.length && !galleryItems.some(i => i.is_featured)) todos.push(["warn", "🟡 Nincs kiemelt galériakép."]);

  if (!todos.length) todos.push(["ok", "🟢 A fő előkészületek rendben vannak."]);

  document.getElementById("managerTodos").innerHTML = todos
    .map(([cls, text]) => `<div class="${cls}">${text}</div>`)
    .join("");
}

function renderReadiness() {
  const event = dashboardState.event;
  const appearances = dashboardState.appearances || [];
  const galleryItems = dashboardState.galleryItems || [];

  const checks = [
    !!event,
    !!event?.registration_url,
    !!event?.google_maps_url,
    appearances.length > 0,
    galleryItems.length > 0,
    galleryItems.some(i => i.is_featured)
  ];

  const ready = checks.filter(Boolean).length;
  const percent = Math.round((ready / checks.length) * 100);

  document.getElementById("readinessPercent").textContent = percent + "%";
  document.getElementById("readinessText").textContent = percent >= 85
    ? "Nagyon jó állapotban van a rendezvény."
    : percent >= 60
      ? "Jól haladunk, de még van néhány teendő."
      : "Még több előkészítés szükséges.";
  document.getElementById("readinessBar").style.width = percent + "%";
}

function daysUntil(dateValue) {
  if (!dateValue) return null;
  const target = new Date(dateValue + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  return Math.max(0, Math.ceil((target - today) / 86400000));
}
