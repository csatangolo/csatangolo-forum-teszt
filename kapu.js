const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_CODE = "csatangolo2026"; // ezt csak Ti ismeritek

const gateMessage = document.getElementById("gateMessage");
const scannerSection = document.getElementById("scannerSection");
const resultBox = document.getElementById("resultBox");
let scannerStarted = false;

document.getElementById("unlockGate").addEventListener("click", () => {
  if (document.getElementById("gateCode").value !== ADMIN_CODE) {
    gateMessage.className = "form-message error";
    gateMessage.textContent = "Hibás admin kód.";
    return;
  }
  scannerSection.classList.remove("hidden");
  startScanner();
});

document.getElementById("manualSearch").addEventListener("click", () => {
  const code = document.getElementById("manualCode").value.trim();
  if (code) findParticipant(code);
});

function startScanner() {
  if (scannerStarted || !window.Html5Qrcode) return;
  scannerStarted = true;
  const html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => findParticipant(decodedText),
    () => {}
  ).catch(err => {
    console.log(err);
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = "<h2>Kamera nem indult el</h2><p>Használd a kézi kódbevitelt.</p>";
  });
}

async function findParticipant(code) {
  const clean = String(code || "").trim();
  const { data, error } = await client.from("participants").select("*").eq("participant_code", clean).single();
  if (error || !data) {
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `<h2>Nem található belépő</h2><p class="code">${escapeHtml(clean)}</p>`;
    return;
  }
  showParticipant(data);
}

function showParticipant(p) {
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `
    <h2>${escapeHtml(p.name || "")}</h2>
    <p><strong>${escapeHtml(p.type || "")}</strong></p>
    <p class="code">${escapeHtml(p.participant_code || "")}</p>
    <div class="status-grid">
      <div class="${p.checked_in ? "status-ok" : "status-warn"}">${p.checked_in ? "Már belépett" : "Még nem lépett be"}</div>
      <div class="${p.contribution_paid ? "status-ok" : "status-warn"}">${p.contribution_paid ? "Hozzájárulás rendezve" : "Hozzájárulás fizetendő"}</div>
    </div>
    <div class="hero-actions">
      <button class="button" onclick="checkIn('${p.id}')">Beléptetés</button>
      <button class="button ghost dark" onclick="togglePaid('${p.id}', ${p.contribution_paid ? "true" : "false"})">Hozzájárulás rendezve</button>
    </div>
  `;
}

async function checkIn(id) {
  const { error } = await client.from("participants").update({ checked_in: true, checked_in_at: new Date().toISOString() }).eq("id", id);
  if (error) return alert("Nem sikerült beléptetni. Futtasd le az admin SQL frissítést.");
  resultBox.innerHTML = "<h2>✅ Sikeres beléptetés</h2><p>A résztvevő beléptetve.</p>";
}

async function togglePaid(id, current) {
  const { error } = await client.from("participants").update({ contribution_paid: !current }).eq("id", id);
  if (error) return alert("Nem sikerült menteni. Futtasd le az admin SQL frissítést.");
  resultBox.innerHTML = "<h2>✅ Mentve</h2><p>A hozzájárulás állapota frissítve.</p>";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
