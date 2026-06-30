const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_CODE = "csatangolo2026";

let participants = [];
let registrations = [];

const loginBox = document.getElementById("loginBox");
const adminContent = document.getElementById("adminContent");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const body = document.getElementById("participantsBody");
const searchInput = document.getElementById("searchInput");

function msg(text) {
  loginMessage.className = "form-message error";
  loginMessage.textContent = text;
}

loginButton.addEventListener("click", async () => {
  if (document.getElementById("adminCode").value !== ADMIN_CODE) {
    msg("Hibás szervezői kód.");
    return;
  }
  loginBox.classList.add("hidden");
  adminContent.classList.remove("hidden");
  await loadData();
});

document.getElementById("refreshData").addEventListener("click", loadData);

async function loadData() {
  const pRes = await client.from("participants").select("*").order("created_at", { ascending: false });
  const rRes = await client.from("registrations").select("*").order("created_at", { ascending: false });

  if (pRes.error) {
    alert("Nem sikerült betölteni a résztvevőket. Futtasd le a V6 SQL frissítést.");
    console.error(pRes.error);
    return;
  }

  participants = pRes.data || [];
  registrations = rRes.error ? [] : (rRes.data || []);

  updateStats();
  render(participants);
  renderDashboard();
  renderQuestions();
}

function updateStats() {
  const registrationIds = new Set(participants.map(p => p.registration_id).filter(Boolean));
  const checkedIn = participants.filter(p => p.checked_in).length;
  const paid = participants.filter(p => p.contribution_paid).length;
  const companions = participants.filter(p => String(p.type || "").toLowerCase().includes("kísér")).length;
  const cities = new Set(participants.map(p => clean(p.city)).filter(Boolean));

  document.getElementById("statParticipants").textContent = participants.length;
  document.getElementById("statCheckedIn").textContent = checkedIn;
  document.getElementById("statPaid").textContent = paid;
  document.getElementById("statCompanions").textContent = companions;
  document.getElementById("statSupport").textContent = (paid * 2000).toLocaleString("hu-HU") + " Ft";
  document.getElementById("statRegistrations").textContent = registrations.length || registrationIds.size;
  document.getElementById("statCities").textContent = cities.size;

  const childRegs = registrations.filter(r => String(r.has_children || "").toLowerCase() === "igen").length;
  document.getElementById("statChildren").textContent = childRegs;

  const percent = participants.length ? Math.round((checkedIn / participants.length) * 100) : 0;
  document.getElementById("checkinProgress").style.width = percent + "%";
  document.getElementById("checkinText").textContent = percent + "% beléptetve";
}

function renderDashboard() {
  renderCountList("cityList", countBy(participants.map(p => clean(p.city)).filter(Boolean)), "Még nincs településadat.");
  renderCountList("topicList", countArrayValues(registrations.map(r => r.topics)), "Még nincs témaadat.");
  renderCountList("questionForList", countBy(registrations.map(r => clean(r.question_for)).filter(Boolean)), "Még nincs névhez címzett kérdés.");
}

function renderCountList(id, entries, emptyText) {
  const el = document.getElementById(id);
  const top = entries.slice(0, 7);
  if (!top.length) {
    el.innerHTML = `<p class="hint">${emptyText}</p>`;
    return;
  }
  el.innerHTML = top.map(([name, count]) => `
    <div class="list-row">
      <span>${escapeHtml(name)}</span>
      <strong>${count}</strong>
    </div>
  `).join("");
}

function renderQuestions() {
  const el = document.getElementById("questionsList");
  const rows = registrations.filter(r => clean(r.speaker_question));
  if (!rows.length) {
    el.innerHTML = '<p class="hint">Még nincs beküldött kérdés.</p>';
    return;
  }
  el.innerHTML = rows.map(r => `
    <article class="question-card">
      <h3>${escapeHtml(r.main_name || "Névtelen")}</h3>
      ${r.question_for ? `<p><strong>Címzett:</strong> ${escapeHtml(r.question_for)}</p>` : ""}
      <p>${escapeHtml(r.speaker_question)}</p>
    </article>
  `).join("");
}

function render(rows) {
  body.innerHTML = "";
  rows.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHtml(p.name || "")}</strong></td>
      <td>${escapeHtml(p.type || "")}</td>
      <td><small>${escapeHtml(p.participant_code || "")}</small></td>
      <td>${escapeHtml(p.city || "")}</td>
      <td><button class="mini-button ${p.checked_in ? "ok" : ""}" data-action="checkin" data-id="${p.id}">${p.checked_in ? "Belépett" : "Beléptetés"}</button></td>
      <td><button class="mini-button ${p.contribution_paid ? "ok" : ""}" data-action="paid" data-id="${p.id}">${p.contribution_paid ? "Rendezve" : "Fizetendő"}</button></td>
      <td><button class="mini-button danger" data-action="delete" data-id="${p.id}">Törlés</button></td>
    `;
    body.appendChild(tr);
  });
}

body.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const p = participants.find(x => x.id === id);
  if (!p) return;

  if (btn.dataset.action === "delete") {
    await deleteParticipantOrRegistration(p);
    return;
  }

  const update = btn.dataset.action === "checkin"
    ? { checked_in: !p.checked_in, checked_in_at: !p.checked_in ? new Date().toISOString() : null }
    : { contribution_paid: !p.contribution_paid };

  const { error } = await client.from("participants").update(update).eq("id", id);
  if (error) {
    alert("Nem sikerült menteni. Futtasd le a V6 SQL frissítést.");
    console.error(error);
    return;
  }
  await loadData();
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();
  const filtered = participants.filter(p =>
    String(p.name || "").toLowerCase().includes(q) ||
    String(p.participant_code || "").toLowerCase().includes(q) ||
    String(p.city || "").toLowerCase().includes(q)
  );
  render(filtered);
});

document.getElementById("exportCsv").addEventListener("click", () => {
  const rows = [["Név","Típus","Kód","Település","Belépett","Hozzájárulás"]];
  participants.forEach(p => rows.push([p.name,p.type,p.participant_code,p.city,p.checked_in ? "igen" : "nem",p.contribution_paid ? "igen" : "nem"]));
  const csv = rows.map(r => r.map(cell => `"${String(cell || "").replaceAll('"','""')}"`).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "csatangolo_forum_resztvevok.csv";
  a.click();
  URL.revokeObjectURL(url);
});


const exportRegsBtn = document.getElementById("exportRegistrations");
if (exportRegsBtn) {
  exportRegsBtn.addEventListener("click", () => {
    const rows = [["Név","E-mail","Telefon","Település","Gyermekkel érkezik","Szállás","Bemutató érdeklődés","Kérdés címzettje","Kérdés","Témák","Szerepek","Regisztráció ideje"]];
    registrations.forEach(r => rows.push([
      r.main_name,
      r.email,
      r.phone,
      r.city,
      r.has_children,
      r.accommodation,
      r.demo_interest,
      r.question_for,
      r.speaker_question,
      arrText(r.topics),
      arrText(r.roles),
      r.created_at || ""
    ]));
    downloadCsv(rows, "csatangolo_forum_regisztraciok.csv");
  });
}

function downloadCsv(rows, filename) {
  const csv = rows.map(r => r.map(cell => `"${String(cell || "").replaceAll('"','""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function arrText(v) {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.join(", ");
    } catch {}
    return v;
  }
  return "";
}

function clean(v) {
  return String(v || "").trim();
}

function countBy(values) {
  const map = new Map();
  values.forEach(v => map.set(v, (map.get(v) || 0) + 1));
  return [...map.entries()].sort((a,b) => b[1] - a[1]);
}

function countArrayValues(values) {
  const all = [];
  values.forEach(v => {
    if (Array.isArray(v)) all.push(...v);
    else if (typeof v === "string" && v.trim()) {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) all.push(...parsed);
      } catch {
        all.push(v);
      }
    }
  });
  return countBy(all.map(clean).filter(Boolean));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
