const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const MANAGER_PIN = "Tigris97";

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
  const event = await loadActiveEvent(client);

  if (!event) {
    document.getElementById("managerSubtitle").textContent = "Nincs aktív rendezvény beállítva.";
    document.getElementById("managerEventName").textContent = "Nincs aktív rendezvény";
    return;
  }

  document.getElementById("managerSubtitle").textContent = "Minden fontos felület egy helyen.";
  document.getElementById("managerEventName").textContent = event.name || "Aktív rendezvény";
  document.getElementById("managerEventDate").textContent = event.event_date ? "📅 " + formatEventDateHu(event.event_date) : "📅 –";
  document.getElementById("managerEventTime").textContent = "🕘 " + (formatEventTimeRange(event) || "–");
  document.getElementById("managerEventLocation").textContent = "📍 " + (event.location_name || event.location_address || "–");
  document.getElementById("managerEventFee").textContent = "💰 " + (event.contribution_amount ? formatFtHu(event.contribution_amount) : "–");
}
