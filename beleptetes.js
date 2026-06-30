const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Beléptető kolléga PIN. Ezt később átírhatod, ha szeretnéd.
const GATE_PIN = "2026";

const gateMessage = document.getElementById("gateMessage");
const scannerSection = document.getElementById("scannerSection");
const resultBox = document.getElementById("resultBox");
const cameraStatus = document.getElementById("cameraStatus");

let scanner = null;
let scannerRunning = false;
let lastCode = "";
let lastAt = 0;
let currentParticipant = null;

document.getElementById("unlockGate").addEventListener("click", () => {
  if (document.getElementById("gateCode").value !== GATE_PIN) {
    gateMessage.className = "form-message error";
    gateMessage.textContent = "Hibás beléptető PIN.";
    return;
  }
  document.getElementById("gateLogin").classList.add("hidden");
  scannerSection.classList.remove("hidden");
});

document.getElementById("gateCode").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("unlockGate").click();
});

document.getElementById("startScannerBtn").addEventListener("click", startScanner);
document.getElementById("stopScannerBtn").addEventListener("click", stopScanner);
document.getElementById("restartScannerBtn").addEventListener("click", async () => {
  await stopScanner();
  setTimeout(startScanner, 300);
});

document.getElementById("manualSearch").addEventListener("click", () => {
  const code = document.getElementById("manualCode").value.trim();
  if (code) findParticipant(code);
});

document.getElementById("manualCode").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const code = document.getElementById("manualCode").value.trim();
    if (code) findParticipant(code);
  }
});

async function startScanner() {
  if (scannerRunning) return;
  if (!window.Html5Qrcode) {
    cameraStatus.textContent = "A QR olvasó nem töltött be. Használd a kézi kódbevitelt.";
    return;
  }

  cameraStatus.textContent = "Kamera indítása...";
  resultBox.innerHTML = `<div class="gate-waiting"><b>📷</b><h2>Kamera indítása</h2><p>Engedélyezd a kamerát, ha a böngésző kéri.</p></div>`;

  try {
    scanner = new Html5Qrcode("reader");
    const cameras = await Html5Qrcode.getCameras();
    const backCamera = cameras.find(c => /back|rear|environment|hátsó/i.test(c.label)) || cameras[cameras.length - 1] || cameras[0];

    await scanner.start(
      backCamera ? { deviceId: { exact: backCamera.id } } : { facingMode: "environment" },
      { fps: 10, qrbox: { width: 280, height: 280 }, aspectRatio: 1.0 },
      decodedText => {
        const code = String(decodedText || "").trim();
        const now = Date.now();
        if (!code) return;
        if (code === lastCode && now - lastAt < 2600) return;
        lastCode = code;
        lastAt = now;
        findParticipant(code);
      },
      () => {}
    );

    scannerRunning = true;
    cameraStatus.textContent = "Kamera aktív. Tartsd a QR-kódot a négyzet elé.";
    resultBox.innerHTML = `<div class="gate-waiting"><b>🎟️</b><h2>Olvasásra kész</h2><p>Mutasd a QR-kódot a kamerának.</p></div>`;
  } catch (err) {
    console.error(err);
    scannerRunning = false;
    cameraStatus.textContent = "Nem sikerült elindítani a kamerát. Használd a kézi kódbevitelt.";
    resultBox.innerHTML = `<div class="gate-result danger"><b>📷</b><h2>Kamera nem indult el</h2><p>Használd a kézi kódbevitelt, vagy frissítsd az oldalt.</p></div>`;
  }
}

async function stopScanner() {
  try {
    if (scanner && scannerRunning) {
      await scanner.stop();
      await scanner.clear();
    }
  } catch (e) {
    console.warn(e);
  }
  scanner = null;
  scannerRunning = false;
  cameraStatus.textContent = "Kamera leállítva.";
}

async function findParticipant(code) {
  const clean = String(code || "").trim();
  resultBox.innerHTML = `<div class="gate-result loading"><b>🔎</b><h2>Ellenőrzés...</h2><p class="gate-code">${escapeHtml(clean)}</p></div>`;

  const { data, error } = await client.from("participants").select("*").eq("participant_code", clean).single();

  if (error || !data) {
    currentParticipant = null;
    resultBox.innerHTML = `<div class="gate-result danger"><b>❌</b><h2>Érvénytelen vendégkártya</h2><p>Nem található ilyen belépőkód.</p><p class="gate-code">${escapeHtml(clean)}</p></div>`;
    return;
  }

  currentParticipant = data;
  showParticipant(data);
}

function showParticipant(p) {
  const arrived = !!p.checked_in;
  const paid = !!p.contribution_paid;
  const arrivalText = p.checked_in_at ? new Date(p.checked_in_at).toLocaleString("hu-HU", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
  }) : "Még nincs érkezési idő";

  resultBox.innerHTML = `
    <div class="checkin-confirm-card ${arrived ? "already" : ""}">
      <div class="checkin-status-pill">${arrived ? "⚠️ Már megérkezett" : "🎟️ Beolvasva"}</div>

      <h2>${escapeHtml(p.name || "")}</h2>
      <p class="gate-role">${escapeHtml(p.type || "Vendég")}</p>
      <p class="gate-code">${escapeHtml(p.participant_code || "")}</p>
      ${p.city ? `<p class="gate-city">📍 ${escapeHtml(p.city)}</p>` : ""}

      <div class="arrival-time-box">
        <span>Érkezési idő</span>
        <strong>${escapeHtml(arrivalText)}</strong>
      </div>

      <div class="checkin-toggle-grid">
        <button type="button" class="checkin-toggle ${arrived ? "on" : ""}" id="toggleArrived" aria-pressed="${arrived}">
          <b>${arrived ? "✓" : ""}</b>
          <span>Megérkezett</span>
        </button>

        <button type="button" class="checkin-toggle ${paid ? "on" : ""}" id="togglePaid" aria-pressed="${paid}">
          <b>${paid ? "✓" : ""}</b>
          <span>Fizetés rendezve</span>
        </button>
      </div>

      <div class="gate-action-row">
        <button class="button gate-secondary-btn" type="button" onclick="cancelCurrent()">Mégse</button>
        <button class="button gate-primary-btn" type="button" onclick="saveCurrent()">OK, mentés</button>
      </div>
    </div>
  `;

  document.getElementById("toggleArrived").addEventListener("click", toggleButton);
  document.getElementById("togglePaid").addEventListener("click", toggleButton);
}

function toggleButton(e) {
  const btn = e.currentTarget;
  const next = !btn.classList.contains("on");
  btn.classList.toggle("on", next);
  btn.setAttribute("aria-pressed", next ? "true" : "false");
  btn.querySelector("b").textContent = next ? "✓" : "";
}

function cancelCurrent() {
  currentParticipant = null;
  resultBox.innerHTML = `<div class="gate-waiting"><b>🎟️</b><h2>Várakozás beolvasásra</h2><p>Olvass be egy vendégkártyát, vagy írd be kézzel a belépőkódot.</p></div>`;
}

async function saveCurrent() {
  if (!currentParticipant) return;

  const arrived = document.getElementById("toggleArrived").classList.contains("on");
  const paid = document.getElementById("togglePaid").classList.contains("on");

  const update = {
    checked_in: arrived,
    checked_in_at: arrived
      ? (currentParticipant.checked_in_at || new Date().toISOString())
      : null,
    contribution_paid: paid
  };

  const { data, error } = await client
    .from("participants")
    .update(update)
    .eq("id", currentParticipant.id)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    alert("Nem sikerült menteni. Ellenőrizd a Supabase UPDATE jogosultságot.");
    return;
  }

  currentParticipant = data;
  showSaved(data);
}

function showSaved(p) {
  const paid = !!p.contribution_paid;
  const arrived = !!p.checked_in;
  const arrivalText = p.checked_in_at ? new Date(p.checked_in_at).toLocaleString("hu-HU", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
  }) : "";

  resultBox.innerHTML = `
    <div class="gate-result success">
      <b>✅</b>
      <h2>Mentve</h2>
      <p class="gate-name">${escapeHtml(p.name || "")}</p>
      <p class="gate-role">${escapeHtml(p.type || "Vendég")}</p>
      ${arrived ? `<p class="gate-arrival">Érkezés: <strong>${escapeHtml(arrivalText)}</strong></p>` : ""}
      <div class="gate-status-grid">
        <span class="${arrived ? "ok" : "wait"}">${arrived ? "Megérkezett" : "Nincs érkezésre állítva"}</span>
        <span class="${paid ? "ok" : "pay"}">${paid ? "Fizetés rendezve" : "Fizetésre vár"}</span>
      </div>
      <button class="button gate-primary-btn" type="button" onclick="cancelCurrent()">Következő vendég</button>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
