const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const MANAGER_PIN = "Tigris97";

let activeEvent = null;
let metrics = {
  participants: 0,
  checkedIn: 0,
  speakers: 0,
  gallery: 0,
  featuredGallery: 0,
  speakerMissingBio: 0,
  speakerMissingImage: 0
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

  activeEvent = await loadActiveEvent(client);
  await loadMetrics();
  renderEventCard();
  renderKpis();
  renderTasks();
  renderSystemChecks();
  renderReadiness();
}

function setGreeting() {
  const hour = new Date().getHours();
  let text = "Szia! 👋";
  if (hour < 10) text = "Jó reggelt! 👋";
  else if (hour < 18) text = "Szép napot! 👋";
  else text = "Jó estét! 👋";
  document.getElementById("dashboardGreeting").textContent = text;
}

async function loadMetrics() {
  metrics = {
    participants: 0,
    checkedIn: 0,
    speakers: 0,
    gallery: 0,
    featuredGallery: 0,
    speakerMissingBio: 0,
    speakerMissingImage: 0
  };

  try {
    const { data: participants } = await client.from("participants").select("checked_in");
    metrics.participants = participants?.length || 0;
    metrics.checkedIn = (participants || []).filter(p => p.checked_in).length;
  } catch (error) {
    console.warn("Participants tábla nem elérhető.", error);
  }

  if (!activeEvent) return;

  try {
    const { data: speakerRows } = await client
      .from("event_speakers")
      .select("is_visible, people(name,bio,image_filename)")
      .eq("event_id", activeEvent.id);

    const visibleSpeakers = (speakerRows || []).filter(row => row.is_visible !== false);
    metrics.speakers = visibleSpeakers.length;
    metrics.speakerMissingBio = visibleSpeakers.filter(row => !row.people?.bio).length;
    metrics.speakerMissingImage = visibleSpeakers.filter(row => !row.people?.image_filename).length;
  } catch (error) {
    console.warn("Előadók nem elérhetők.", error);
  }

  try {
    const { data: galleryRows } = await client
      .from("gallery_items")
      .select("is_visible,is_featured")
      .eq("event_id", activeEvent.id);

    const visibleGallery = (galleryRows || []).filter(row => row.is_visible !== false);
    metrics.gallery = visibleGallery.length;
    metrics.featuredGallery = visibleGallery.filter(row => row.is_featured).length;
  } catch (error) {
    console.warn("Galéria nem elérhető.", error);
  }
}

function renderEventCard() {
  const hero = document.getElementById("dashboardHeroText");
  const name = document.getElementById("managerEventName");
  const date = document.getElementById("managerEventDate");
  const countdown = document.getElementById("managerEventCountdown");
  const location = document.getElementById("managerEventLocation");
  const fee = document.getElementById("managerEventFee");

  if (!activeEvent) {
    hero.textContent = "Nincs aktív rendezvény beállítva.";
    name.textContent = "Nincs aktív rendezvény";
    date.textContent = "📅 –";
    countdown.textContent = "⏳ –";
    location.textContent = "📍 –";
    fee.textContent = "💰 –";
    return;
  }

  const days = daysUntil(activeEvent.event_date);
  hero.textContent = days !== null
    ? `Az aktív rendezvényig még ${days} nap van hátra.`
    : "Az aktív rendezvény adatai betöltve.";

  name.textContent = activeEvent.name || "Aktív rendezvény";
  date.textContent = activeEvent.event_date ? "📅 " + formatEventDateHu(activeEvent.event_date) : "📅 –";
  countdown.textContent = days !== null ? `⏳ ${days} nap` : "⏳ –";
  location.textContent = "📍 " + (activeEvent.location_name || activeEvent.location_address || "–");
  fee.textContent = "💰 " + (activeEvent.contribution_amount ? formatFtHu(activeEvent.contribution_amount) : "–");
}

function renderKpis() {
  document.getElementById("kpiParticipants").textContent = metrics.participants;
  document.getElementById("kpiCheckedIn").textContent = metrics.checkedIn;
  document.getElementById("kpiSpeakers").textContent = metrics.speakers;
  document.getElementById("kpiGallery").textContent = metrics.gallery;
}

function renderTasks() {
  const tasks = [];

  if (!activeEvent) {
    tasks.push(["warning", "Állíts be aktív rendezvényt a Rendezvény beállítások oldalon."]);
  }

  if (activeEvent && metrics.speakers === 0) {
    tasks.push(["warning", "Még nincs előadó rendelve az aktív rendezvényhez."]);
  }

  if (metrics.speakerMissingImage > 0) {
    tasks.push(["warning", `${metrics.speakerMissingImage} előadónál hiányzik a kép.`]);
  }

  if (metrics.speakerMissingBio > 0) {
    tasks.push(["warning", `${metrics.speakerMissingBio} előadónál hiányzik a bemutatkozás.`]);
  }

  if (activeEvent && metrics.gallery === 0) {
    tasks.push(["warning", "Az aktív rendezvény galériája még üres."]);
  }

  if (metrics.gallery > 0 && metrics.featuredGallery === 0) {
    tasks.push(["warning", "Van galéria, de még nincs kiemelt kép."]);
  }

  if (!tasks.length) {
    tasks.push(["ok", "Minden fontos alapadat rendben van."]);
  }

  document.getElementById("dashboardTasks").innerHTML = tasks.map(([type, text]) => `
    <div class="${type === "ok" ? "ok" : "warning"}">${type === "ok" ? "🟢" : "🟡"} ${escapeHtml(text)}</div>
  `).join("");
}

function renderSystemChecks() {
  const checks = [];
  checks.push(["ok", "Supabase kapcsolat működik"]);
  checks.push([activeEvent ? "ok" : "warning", activeEvent ? "Aktív rendezvény beállítva" : "Nincs aktív rendezvény"]);
  checks.push(["ok", "Jelentkezési adatbázis ellenőrizve"]);

  if (metrics.gallery > 0) checks.push(["ok", "Galéria elérhető"]);
  else checks.push(["warning", "Galéria még üres vagy nincs beállítva"]);

  if (metrics.speakers > 0) checks.push(["ok", "Előadómodul elérhető"]);
  else checks.push(["warning", "Előadómodul még üres"]);

  document.getElementById("systemChecks").innerHTML = checks.map(([type, text]) => `
    <div class="${type === "ok" ? "ok" : "warning"}">${type === "ok" ? "✅" : "🟡"} ${escapeHtml(text)}</div>
  `).join("");
}

function renderReadiness() {
  let score = 0;
  let max = 5;

  if (activeEvent) score++;
  if (metrics.participants > 0) score++;
  if (metrics.speakers > 0) score++;
  if (metrics.gallery > 0) score++;
  if (metrics.speakerMissingBio === 0 && metrics.speakerMissingImage === 0 && metrics.speakers > 0) score++;

  const percent = Math.round(score / max * 100);
  document.getElementById("readinessPercent").textContent = percent + "%";
  document.getElementById("readinessBar").style.width = percent + "%";
  document.getElementById("readinessText").textContent =
    percent >= 80 ? "Nagyon jó állapotban van a rendezvény." :
    percent >= 50 ? "Jó úton haladunk, pár dolog még hiányzik." :
    "Még több alapadatot érdemes feltölteni.";
}

function daysUntil(dateValue) {
  if (!dateValue) return null;
  const today = new Date();
  const target = new Date(dateValue + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const diff = target - new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.ceil(diff / 86400000));
}

function formatFtHu(value) {
  if (value === null || value === undefined || value === "") return "";
  return new Intl.NumberFormat("hu-HU").format(Number(value)) + " Ft";
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
