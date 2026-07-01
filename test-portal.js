const client = supabase.createClient(window.CSATANGOLO_SUPABASE_URL, window.CSATANGOLO_SUPABASE_ANON_KEY);
const PORTAL_PIN = "Tigris97";

document.getElementById("portalUnlock").addEventListener("click", unlockPortal);
document.getElementById("portalPin").addEventListener("keydown", event => {
  if (event.key === "Enter") unlockPortal();
});

async function unlockPortal() {
  const msg = document.getElementById("portalMessage");
  if (document.getElementById("portalPin").value !== PORTAL_PIN) {
    msg.className = "form-message error";
    msg.textContent = "Hibás PIN.";
    return;
  }
  document.getElementById("portalLogin").classList.add("hidden");
  document.getElementById("portalContent").classList.remove("hidden");
  try {
    const event = await loadActiveEvent(client);
    document.getElementById("portalEventText").textContent = event ? `Aktív rendezvény: ${event.name || "név nélkül"}` : "Nincs aktív rendezvény beállítva.";
  } catch (error) {
    document.getElementById("portalEventText").textContent = "Aktív rendezvény nem tölthető be.";
  }
}
