const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GATE_PIN = "Tigris97";

let participants = [];
let currentParticipant = null;
let scanner = null;
let scannerRunning = false;
let lastCode = "";
let lastAt = 0;
let recentCheckins = [];

const gateMessage = document.getElementById("gateMessage");
const scannerSection = document.getElementById("scannerSection");
const resultBox = document.getElementById("resultBox");
const cameraStatus = document.getElementById("cameraStatus");
const manualSearchInput = document.getElementById("manualSearchInput");
const manualResults = document.getElementById("manualResults");
const recentList = document.getElementById("recentList");
const quickMessage = document.getElementById("quickMessage");

document.getElementById("unlockGate").addEventListener("click", async () => {
  if (document.getElementById("gateCode").value !== GATE_PIN) {
    gateMessage.className = "form-message error";
    gateMessage.textContent = "Hibás beléptető PIN.";
    return;
  }

  document.getElementById("gateLogin").classList.add("hidden");
  scannerSection.classList.remove("hidden");
  await loadParticipants();
});

document.getElementById("gateCode").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("unlockGate").click();
});

document.getElementById("startScannerBtn").addEventListener("click", startScanner);
document.getElementById("stopScannerBtn").addEventListener("click", stopScanner);
document.getElementById("restartScannerBtn").addEventListener("click", async () => {
  await stopScanner();
  setTimeout(startScanner, 250);
});

document.getElementById("showScanner").addEventListener("click", () => switchPanel("scanner"));
document.getElementById("showSearch").addEventListener("click", () => switchPanel("search"));
document.getElementById("showOnsite").addEventListener("click", () => switchPanel("onsite"));

manualSearchInput.addEventListener("input", renderManualResults);

document.getElementById("quickOnsiteForm").addEventListener("submit", createQuickParticipant);

async function loadParticipants() {
  await loadCheckinActiveEvent();
  const { data, error } = await client.from("participants").select("*").order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    resultBox.innerHTML = errorCard("Nem sikerült betölteni a résztvevőket", "Ellenőrizd a teszt Supabase jogosultságokat.");
    return;
  }

  participants = data || [];
  updateStats();
  renderManualResults();
}


async function loadCheckinActiveEvent() {
  const event = await loadActiveEvent(client);
  const eventName = document.getElementById("checkinEventName");
  const status = document.getElementById("connectionStatus");

  if (!event) {
    if (eventName) eventName.textContent = "Nincs aktív rendezvény beállítva";
    if (status) status.textContent = "Nincs aktív rendezvény";
    return;
  }

  if (eventName) {
    const date = event.event_date ? formatEventDateHu(event.event_date) : "";
    eventName.textContent = [event.name, date].filter(Boolean).join(" • ");
  }

  if (status) {
    status.textContent = event.name || "Aktív rendezvény";
  }
}

function updateStats() {
  const arrived = participants.filter(p => p.checked_in);
  const paid = participants.filter(p => p.contribution_paid);
  const waitingPay = participants.filter(p => p.checked_in && !p.contribution_paid);

  document.getElementById("statTotal").textContent = participants.length;
  document.getElementById("statArrived").textContent = arrived.length;
  document.getElementById("statPaid").textContent = paid.length;
  document.getElementById("statWaitingPay").textContent = waitingPay.length;
}

function switchPanel(panel) {
  const panels = {
    scanner: document.getElementById("scannerPanel"),
    search: document.getElementById("searchPanel"),
    onsite: document.getElementById("onsitePanel")
  };
  const buttons = {
    scanner: document.getElementById("showScanner"),
    search: document.getElementById("showSearch"),
    onsite: document.getElementById("showOnsite")
  };

  Object.entries(panels).forEach(([key, el]) => el.classList.toggle("hidden", key !== panel));
  Object.entries(buttons).forEach(([key, el]) => el.classList.toggle("active", key === panel));

  if (panel === "scanner") {
    cameraStatus.textContent = scannerRunning ? "Kamera aktív." : "Indítsd el a kamerát, majd tartsd a QR-kódot a négyzet elé.";
  }
}

async function startScanner() {
  if (scannerRunning) return;
  if (!window.Html5Qrcode) {
    cameraStatus.textContent = "A QR olvasó nem töltött be. Használd a név szerinti keresést.";
    return;
  }

  cameraStatus.textContent = "Kamera indítása...";
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
        if (code === lastCode && now - lastAt < 2500) return;
        lastCode = code;
        lastAt = now;
        findParticipantByCode(code);
      },
      () => {}
    );

    scannerRunning = true;
    cameraStatus.textContent = "Kamera aktív. Tartsd a QR-kódot a négyzet elé.";
  } catch (err) {
    console.error(err);
    scannerRunning = false;
    cameraStatus.textContent = "Nem sikerült elindítani a kamerát. Használd a név szerinti keresést.";
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

function findParticipantByCode(code) {
  const clean = String(code || "").trim();
  const p = participants.find(x => String(x.participant_code || "").trim() === clean);

  if (!p) {
    resultBox.innerHTML = errorCard("QR-kód nem található", clean);
    playTone("error");
    return;
  }

  showParticipant(p, "qr");
}

function renderManualResults() {
  if (!manualResults) return;
  const q = String(manualSearchInput.value || "").toLowerCase().trim();

  if (!q) {
    manualResults.innerHTML = `<p class="hint">Írj be legalább néhány betűt.</p>`;
    return;
  }

  const matches = participants.filter(p =>
    String(p.name || "").toLowerCase().includes(q) ||
    String(p.city || "").toLowerCase().includes(q) ||
    String(p.participant_code || "").toLowerCase().includes(q) ||
    String(p.type || "").toLowerCase().includes(q)
  ).slice(0, 12);

  if (!matches.length) {
    manualResults.innerHTML = `<p class="hint">Nincs találat.</p>`;
    return;
  }

  manualResults.innerHTML = matches.map(p => `
    <button type="button" class="manual-result-item" data-id="${p.id}">
      <strong>${escapeHtml(p.name || "")}</strong>
      <span>${escapeHtml(p.type || "Vendég")} ${p.city ? "• " + escapeHtml(p.city) : ""}</span>
      <small>${escapeHtml(p.participant_code || "")}</small>
    </button>
  `).join("");

  manualResults.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = participants.find(x => String(x.id) === String(btn.dataset.id));
      if (p) showParticipant(p, "manual");
    });
  });
}

function showParticipant(p, source = "manual") {
  currentParticipant = p;

  const arrived = !!p.checked_in;
  const paid = !!p.contribution_paid;
  const role = String(p.type || "Vendég");
  const isSpeaker = role.toLowerCase().includes("előadó");
  const statusClass = paid && arrived ? "complete" : arrived && !paid ? "payment" : isSpeaker ? "speaker" : "new";
  const arrivalText = p.checked_in_at ? new Date(p.checked_in_at).toLocaleString("hu-HU", { hour: "2-digit", minute: "2-digit", month: "2-digit", day: "2-digit" }) : "Még nincs rögzítve";

  resultBox.innerHTML = `
    <article class="checkin-person-card ${statusClass}">
      <div class="checkin-card-top">
        <span>${source === "qr" ? "📷 QR beolvasva" : "🔍 Kézi kiválasztás"}</span>
        ${arrived ? `<b>⚠️ Már megérkezett</b>` : `<b>Új beléptetés</b>`}
      </div>

      <h2>${escapeHtml(p.name || "")}</h2>
      <p class="checkin-role">${escapeHtml(role)}</p>
      ${p.city ? `<p class="checkin-city">📍 ${escapeHtml(p.city)}</p>` : ""}
      <p class="checkin-code">${escapeHtml(p.participant_code || "")}</p>

      <div class="checkin-arrival">
        <span>Érkezési idő</span>
        <strong>${escapeHtml(arrivalText)}</strong>
      </div>

      <div class="checkin-switch-grid">
        <button type="button" class="checkin-switch ${arrived ? "on" : ""}" id="toggleArrived" aria-pressed="${arrived}">
          <b>${arrived ? "✓" : ""}</b>
          <span>Megérkezett</span>
        </button>
        <button type="button" class="checkin-switch ${paid ? "on" : ""}" id="togglePaid" aria-pressed="${paid}">
          <b>${paid ? "✓" : ""}</b>
          <span>Fizetett</span>
        </button>
      </div>

      <div class="checkin-save-row">
        <button class="button ghost dark" type="button" id="cancelPerson">Mégsem</button>
        <button class="button checkin-primary" type="button" id="savePerson">Mentés</button>
      </div>
    </article>
  `;

  document.getElementById("toggleArrived").addEventListener("click", toggleSwitch);
  document.getElementById("togglePaid").addEventListener("click", toggleSwitch);
  document.getElementById("cancelPerson").addEventListener("click", resetResult);
  document.getElementById("savePerson").addEventListener("click", saveCurrentParticipant);
}

function toggleSwitch(event) {
  const btn = event.currentTarget;
  const next = !btn.classList.contains("on");
  btn.classList.toggle("on", next);
  btn.setAttribute("aria-pressed", next ? "true" : "false");
  btn.querySelector("b").textContent = next ? "✓" : "";
}

async function saveCurrentParticipant() {
  if (!currentParticipant) return;

  const arrived = document.getElementById("toggleArrived").classList.contains("on");
  const paid = document.getElementById("togglePaid").classList.contains("on");

  const update = {
    checked_in: arrived,
    checked_in_at: arrived ? (currentParticipant.checked_in_at || new Date().toISOString()) : null,
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
    resultBox.innerHTML = errorCard("Nem sikerült menteni", "Ellenőrizd az UPDATE jogosultságot.");
    playTone("error");
    return;
  }

  const updated = data || { ...currentParticipant, ...update };
  participants = participants.map(p => String(p.id) === String(updated.id) ? updated : p);
  updateStats();
  addRecent(updated);
  playTone("success");
  showSaved(updated);
}

function showSaved(p) {
  const paid = !!p.contribution_paid;
  const arrived = !!p.checked_in;
  const statusClass = paid && arrived ? "complete" : arrived && !paid ? "payment" : "new";

  resultBox.innerHTML = `
    <article class="checkin-saved-card ${statusClass}">
      <b>✅</b>
      <h2>Sikeres mentés</h2>
      <p class="checkin-name">${escapeHtml(p.name || "")}</p>
      <p>${escapeHtml(p.type || "Vendég")}</p>
      <div class="checkin-status-pills">
        <span class="${arrived ? "ok" : "wait"}">${arrived ? "Megérkezett" : "Nincs érkezés"}</span>
        <span class="${paid ? "ok" : "pay"}">${paid ? "Fizetett" : "Fizetésre vár"}</span>
      </div>
      <button class="button checkin-primary" type="button" id="nextScan">Következő vendég</button>
    </article>
  `;

  document.getElementById("nextScan").addEventListener("click", resetResult);
  setTimeout(resetResult, 1800);
}

function resetResult() {
  currentParticipant = null;
  resultBox.innerHTML = `
    <div class="checkin-waiting">
      <b>🎟️</b>
      <h2>Várakozás beolvasásra</h2>
      <p>Olvass be QR-kódot, keress név alapján, vagy rögzíts helyszíni vendéget.</p>
    </div>
  `;
}

async function createQuickParticipant(event) {
  event.preventDefault();
  quickMessage.className = "form-message";
  quickMessage.textContent = "Rögzítés folyamatban...";

  const name = document.getElementById("quickName").value.trim();
  if (!name) {
    quickMessage.className = "form-message error";
    quickMessage.textContent = "A név megadása kötelező.";
    return;
  }

  const arrived = document.getElementById("quickArrived").checked;
  const paid = document.getElementById("quickPaid").checked;

  const row = {
    participant_code: makeOnsiteCode(),
    name,
    city: document.getElementById("quickCity").value.trim(),
    type: document.getElementById("quickType").value,
    checked_in: arrived,
    checked_in_at: arrived ? new Date().toISOString() : null,
    contribution_paid: paid
  };

  const { data, error } = await client.from("participants").insert(row).select("*").single();

  if (error) {
    console.error(error);
    quickMessage.className = "form-message error";
    quickMessage.textContent = "Nem sikerült rögzíteni. Ellenőrizd az INSERT jogosultságot.";
    playTone("error");
    return;
  }

  participants.push(data);
  updateStats();
  addRecent(data);
  document.getElementById("quickOnsiteForm").reset();
  document.getElementById("quickArrived").checked = true;
  quickMessage.className = "form-message success";
  quickMessage.textContent = "Helyszíni résztvevő rögzítve.";
  showSaved(data);
  playTone("success");
}

function makeOnsiteCode() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HELYSZIN-2026-${random}`;
}

function addRecent(p) {
  recentCheckins.unshift({
    name: p.name || "",
    type: p.type || "Vendég",
    paid: !!p.contribution_paid,
    arrived: !!p.checked_in,
    time: new Date().toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })
  });
  recentCheckins = recentCheckins.slice(0, 10);
  renderRecent();
}

function renderRecent() {
  if (!recentCheckins.length) {
    recentList.innerHTML = `<p class="hint">Még nincs beléptetés ebben a munkamenetben.</p>`;
    return;
  }

  recentList.innerHTML = recentCheckins.map(item => `
    <div class="recent-item ${item.paid && item.arrived ? "ok" : "warn"}">
      <span>${escapeHtml(item.time)}</span>
      <strong>${escapeHtml(item.name)}</strong>
      <small>${item.paid ? "Fizetett" : "Fizetésre vár"}</small>
    </div>
  `).join("");
}

function errorCard(title, text) {
  return `
    <div class="checkin-error-card">
      <b>❌</b>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(text || "")}</p>
    </div>
  `;
}

function playTone(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = type === "success" ? 880 : 180;
    gain.gain.value = 0.08;
    osc.start();

    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, type === "success" ? 120 : 220);
  } catch (e) {
    // Hangjelzés opcionális.
  }
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
