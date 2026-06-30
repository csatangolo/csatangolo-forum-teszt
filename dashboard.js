const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_CODE = "csatangolo2026";
const CONTRIBUTION_FT = 2000;

let participants = [];
let autoRefresh = true;
let refreshTimer = null;

const dashboardLogin = document.getElementById("dashboardLogin");
const dashboardContent = document.getElementById("dashboardContent");
const dashboardMessage = document.getElementById("dashboardMessage");

document.getElementById("unlockDashboard").addEventListener("click", async () => {
  if (document.getElementById("dashboardCode").value !== ADMIN_CODE) {
    dashboardMessage.className = "form-message error";
    dashboardMessage.textContent = "Hibás admin kód.";
    return;
  }

  dashboardLogin.classList.add("hidden");
  dashboardContent.classList.remove("hidden");
  await loadDashboard();
  startAutoRefresh();
});

document.getElementById("dashboardCode").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("unlockDashboard").click();
});

document.getElementById("refreshDashboard").addEventListener("click", loadDashboard);

document.getElementById("toggleAutoRefresh").addEventListener("click", () => {
  autoRefresh = !autoRefresh;
  document.getElementById("toggleAutoRefresh").textContent = `Auto frissítés: ${autoRefresh ? "BE" : "KI"}`;
  if (autoRefresh) startAutoRefresh();
  else stopAutoRefresh();
});

async function loadDashboard() {
  const { data, error } = await client.from("participants").select("*").order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    alert("Nem sikerült betölteni a dashboard adatokat. Ellenőrizd a Supabase jogosultságokat.");
    return;
  }

  participants = data || [];
  renderDashboard();
}

function startAutoRefresh() {
  stopAutoRefresh();
  if (!autoRefresh) return;
  refreshTimer = setInterval(loadDashboard, 15000);
}

function stopAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
}

function renderDashboard() {
  const total = participants.length;
  const arrived = participants.filter(p => p.checked_in);
  const paid = participants.filter(p => p.contribution_paid);
  const waitingPay = participants.filter(p => p.checked_in && !p.contribution_paid);
  const notArrived = participants.filter(p => !p.checked_in);
  const income = paid.length * CONTRIBUTION_FT;

  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiArrived").textContent = arrived.length;
  document.getElementById("kpiPaid").textContent = paid.length;
  document.getElementById("kpiWaitingPay").textContent = waitingPay.length;
  document.getElementById("kpiNotArrived").textContent = notArrived.length;
  document.getElementById("kpiIncome").textContent = formatFt(income);

  const arrivalPercent = total ? Math.round(arrived.length / total * 100) : 0;
  const paidPercent = total ? Math.round(paid.length / total * 100) : 0;

  document.getElementById("arrivalPercent").textContent = `${arrivalPercent}%`;
  document.getElementById("paidPercent").textContent = `${paidPercent}%`;
  document.getElementById("arrivalBar").style.width = `${arrivalPercent}%`;
  document.getElementById("paidBar").style.width = `${paidPercent}%`;

  document.getElementById("waitingPayCount").textContent = `${waitingPay.length} fő`;
  document.getElementById("notArrivedCount").textContent = `${notArrived.length} fő`;

  renderPersonList("waitingPayList", waitingPay, "pay", 20);
  renderPersonList("notArrivedList", notArrived, "wait", 20);

  const latest = arrived
    .filter(p => p.checked_in_at)
    .sort((a, b) => new Date(b.checked_in_at) - new Date(a.checked_in_at))
    .slice(0, 12);
  renderPersonList("latestArrivalsList", latest, "ok", 12, true);

  renderRoleBreakdown();
  document.getElementById("lastRefresh").textContent = `Utolsó frissítés: ${new Date().toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

function renderPersonList(id, list, status, limit = 20, showTime = false) {
  const box = document.getElementById(id);

  if (!list.length) {
    box.innerHTML = `<p class="hint">Nincs megjeleníthető résztvevő.</p>`;
    return;
  }

  box.innerHTML = list.slice(0, limit).map(p => {
    const time = p.checked_in_at ? new Date(p.checked_in_at).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }) : "";
    return `
      <div class="dashboard-person ${status}">
        <div>
          <strong>${escapeHtml(p.name || "")}</strong>
          <span>${escapeHtml(p.type || "Vendég")}${p.city ? " • " + escapeHtml(p.city) : ""}</span>
        </div>
        ${showTime ? `<b>${escapeHtml(time)}</b>` : `<b>${status === "pay" ? "Fizetés" : status === "ok" ? "OK" : "Várjuk"}</b>`}
      </div>
    `;
  }).join("");
}

function renderRoleBreakdown() {
  const counts = {};
  participants.forEach(p => {
    const role = p.type || "Vendég";
    counts[role] = (counts[role] || 0) + 1;
  });

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (!entries.length) {
    document.getElementById("roleBreakdown").innerHTML = `<p class="hint">Még nincs adat.</p>`;
    return;
  }

  document.getElementById("roleBreakdown").innerHTML = entries.map(([role, count]) => `
    <div class="role-row">
      <span>${escapeHtml(role)}</span>
      <strong>${count} fő</strong>
    </div>
  `).join("");
}

function formatFt(num) {
  return new Intl.NumberFormat("hu-HU").format(num) + " Ft";
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
