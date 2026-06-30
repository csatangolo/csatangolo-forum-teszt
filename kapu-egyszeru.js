const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SIMPLE_GATE_CODE = "kapu2026";

const loginBox = document.getElementById("simpleLogin");
const gateMessage = document.getElementById("simpleGateMessage");
const scannerSection = document.getElementById("simpleScannerSection");
const resultBox = document.getElementById("simpleResultBox");
let scannerStarted = false;
let lastCode = "";

document.getElementById("unlockSimpleGate").addEventListener("click", () => {
  if (document.getElementById("simpleGateCode").value !== SIMPLE_GATE_CODE) {
    gateMessage.className = "form-message error";
    gateMessage.textContent = "Hibás kapu kód.";
    return;
  }
  loginBox.classList.add("hidden");
  scannerSection.classList.remove("hidden");
  startScanner();
});

document.getElementById("simpleManualSearch").addEventListener("click", () => {
  const code = document.getElementById("simpleManualCode").value.trim();
  if (code) findParticipant(code);
});

function startScanner() {
  if (scannerStarted || !window.Html5Qrcode) return;
  scannerStarted = true;
  const html5QrCode = new Html5Qrcode("simpleReader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 8, qrbox: 250 },
    (decodedText) => {
      const clean = String(decodedText || "").trim();
      if (clean && clean !== lastCode) {
        lastCode = clean;
        findParticipant(clean);
        setTimeout(() => { lastCode = ""; }, 3500);
      }
    },
    () => {}
  ).catch(err => {
    console.log(err);
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = "<h2>Kamera nem indult el</h2><p>Használd a kézi kódbevitelt.</p>";
  });
}

async function findParticipant(code) {
  const clean = String(code || "").trim();
  const { data, error } = await client
    .from("participants")
    .select("id,name,type,participant_code,checked_in,checked_in_at,contribution_paid")
    .eq("participant_code", clean)
    .single();

  if (error || !data) {
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `<div class="simple-denied">✕</div><h2>Nem található belépő</h2><p class="code">${escapeHtml(clean)}</p>`;
    return;
  }
  showParticipant(data);
}

function showParticipant(p) {
  resultBox.classList.remove("hidden");
  const already = p.checked_in ? "Már belépett" : "Belépésre vár";
  const paid = p.contribution_paid ? "Hozzájárulás rendezve" : "Helyszínen fizetendő";
  resultBox.innerHTML = `
    <div class="${p.checked_in ? "simple-warning" : "simple-success"}">${p.checked_in ? "!" : "✓"}</div>
    <h2>${escapeHtml(p.name || "")}</h2>
    <p><strong>${escapeHtml(p.type || "Résztvevő")}</strong></p>
    <p class="code">${escapeHtml(p.participant_code || "")}</p>

    <div class="simple-status">
      <div class="${p.checked_in ? "status-warn" : "status-ok"}">${already}</div>
      <div class="${p.contribution_paid ? "status-ok" : "status-warn"}">${paid}</div>
    </div>

    <div class="simple-actions">
      <button class="button" onclick="checkIn('${p.id}')">Beléptetés</button>
      <button class="button ghost dark" onclick="markPaid('${p.id}')">Hozzájárulás rendezve</button>
    </div>
  `;
}

async function checkIn(id) {
  const { error } = await client
    .from("participants")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return alert("Nem sikerült beléptetni.");
  resultBox.innerHTML = `<div class="simple-success">✓</div><h2>Sikeres beléptetés</h2><p>A résztvevő beléptetve.</p>`;
}

async function markPaid(id) {
  const { error } = await client
    .from("participants")
    .update({ contribution_paid: true })
    .eq("id", id);

  if (error) return alert("Nem sikerült menteni.");
  resultBox.innerHTML = `<div class="simple-success">✓</div><h2>Hozzájárulás rendezve</h2><p>A fizetés státusza mentve.</p>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
