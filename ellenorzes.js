const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_CODE = "csatangolo2026";

const requiredTables = [
  ["registrations", "Regisztrációk"],
  ["participants", "Résztvevők / QR-kódok"],
  ["speakers", "Előadók"],
  ["program_items", "Program"],
  ["videos", "YouTube videók"],
  ["news", "Hírek"],
  ["sponsors", "Támogatók"],
  ["gallery", "Galéria"],
  ["documents", "Dokumentumok"]
];

const features = [
  ["Regisztrációs oldal", "regisztracio.html"],
  ["Szervezői irányítópult", "szervezo.html"],
  ["Tartalomkezelő", "tartalom.html"],
  ["Teljes kapu", "kapu.html"],
  ["Egyszerű kapu", "kapu-egyszeru.html"],
  ["Résztvevői profil", "profil.html"],
  ["Tudástár", "tudastar.html"],
  ["Galéria", "galeria.html"]
];

document.getElementById("startCheck").addEventListener("click", async () => {
  const code = document.getElementById("checkCode").value;
  if (code !== ADMIN_CODE) {
    const msg = document.getElementById("loginMessage");
    msg.className = "form-message error";
    msg.textContent = "Hibás szervezői kód.";
    return;
  }
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("checkContent").classList.remove("hidden");
  await runChecks();
});

async function runChecks() {
  const tableResults = [];
  for (const [table, label] of requiredTables) {
    tableResults.push(await checkTable(table, label));
  }

  const storageBucket = await checkStorageBucket();
  const storageUpload = await checkStorageUpload();

  const featureResults = await Promise.all(features.map(([label, path]) => checkPage(label, path)));

  renderChecks("tableChecks", tableResults);
  renderChecks("storageChecks", [storageBucket, storageUpload]);
  renderChecks("featureChecks", featureResults);

  const failed = [...tableResults, storageBucket, storageUpload, ...featureResults].filter(x => !x.ok);
  renderTodos(failed);
  renderOverall(failed);
}

async function checkTable(table, label) {
  try {
    const { error } = await client.from(table).select("*").limit(1);
    return {
      ok: !error,
      label,
      detail: error ? error.message : "Elérhető"
    };
  } catch (e) {
    return { ok:false, label, detail:e.message };
  }
}

async function checkStorageBucket() {
  try {
    const { data, error } = await client.storage.from("forum-assets").list("", { limit: 1 });
    if (error) return { ok:false, label:"forum-assets Storage bucket", detail:error.message };
    return { ok:true, label:"forum-assets Storage bucket", detail:"Elérhető" };
  } catch (e) {
    return { ok:false, label:"forum-assets Storage bucket", detail:e.message };
  }
}

async function checkStorageUpload() {
  try {
    const fileName = `system-check-${Date.now()}.txt`;
    const testContent = new Blob(["Csatangolo Forum test"], { type: "text/plain" });
    const { error } = await client.storage.from("forum-assets").upload(fileName, testContent, { upsert: true });

    if (error) {
      return {
        ok:false,
        label:"Fájlfeltöltési jogosultság",
        detail:error.message.includes("Bucket not found")
          ? "A Storage bucket vagy a feltöltési jogosultság még nincs teljesen beállítva. Futtasd le a teljes 1.0.1 SQL fájlt."
          : error.message
      };
    }

    await client.storage.from("forum-assets").remove([fileName]);
    return { ok:true, label:"Fájlfeltöltési jogosultság", detail:"Működik" };
  } catch (e) {
    return { ok:false, label:"Fájlfeltöltési jogosultság", detail:e.message };
  }
}

async function checkPage(label, path) {
  try {
    const res = await fetch(path, { method: "HEAD", cache: "no-store" });
    return { ok: res.ok, label, detail: res.ok ? "Elérhető" : `HTTP ${res.status}` };
  } catch (e) {
    return { ok:false, label, detail:e.message };
  }
}

function renderChecks(id, results) {
  const el = document.getElementById(id);
  el.innerHTML = results.map(r => `
    <div class="check-row ${r.ok ? "ok" : "bad"}">
      <span>${r.ok ? "✅" : "❌"}</span>
      <div>
        <strong>${escapeHtml(r.label)}</strong>
        <small>${escapeHtml(r.detail)}</small>
      </div>
    </div>
  `).join("");
}

function renderTodos(failed) {
  const el = document.getElementById("todoList");
  if (!failed.length) {
    el.innerHTML = `<div class="check-row ok"><span>🟢</span><div><strong>A rendszer naprakész.</strong><small>Nincs teendő.</small></div></div>`;
    return;
  }

  const tableFails = failed.filter(f => requiredTables.some(t => t[1] === f.label));
  const storageFails = failed.filter(f => f.label.includes("Storage") || f.label.includes("Fájlfeltöltési"));

  el.innerHTML = `
    ${tableFails.length ? `<div class="check-row bad"><span>1</span><div><strong>Hiányzó adatbázis táblák</strong><small>Futtasd le: supabase_csatangolo_cms_1_0_1_teljes.sql</small></div></div>` : ""}
    ${storageFails.length ? `<div class="check-row bad"><span>2</span><div><strong>Storage / feltöltés javítása</strong><small>Futtasd le ugyanazt: supabase_csatangolo_cms_1_0_1_teljes.sql</small></div></div>` : ""}
    <div class="check-row bad"><span>3</span><div><strong>Ha oldal hiányzik</strong><small>Töltsd fel újra GitHubra a ZIP összes fájlját.</small></div></div>
  `;
}

function renderOverall(failed) {
  const title = document.getElementById("overallStatus");
  const text = document.getElementById("overallText");
  if (!failed.length) {
    title.textContent = "🟢 A rendszer teljesen naprakész";
    text.textContent = "Minden fontos tábla, feltöltési jogosultság és oldal elérhető.";
  } else {
    title.textContent = `🟠 ${failed.length} ellenőrzési pont figyelmet kér`;
    text.textContent = "Nézd meg a Teendők részt. A legtöbb hiba az 1.0.1 teljes SQL lefuttatásával javítható.";
  }
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
