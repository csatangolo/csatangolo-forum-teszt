const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_CODE = "Tigris97";

let participants = [];
let currentEditParticipant = null;

const loginBox = document.getElementById("loginBox");
const adminContent = document.getElementById("adminContent");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const body = document.getElementById("participantsBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editParticipantForm");
const editMessage = document.getElementById("editMessage");

function msg(text) {
  loginMessage.className = "form-message error";
  loginMessage.textContent = text;
}

loginButton.addEventListener("click", async () => {
  if (document.getElementById("adminCode").value !== ADMIN_CODE) {
    msg("Hibás admin kód.");
    return;
  }
  loginBox.classList.add("hidden");
  adminContent.classList.remove("hidden");
  await loadData();
});

document.getElementById("adminCode").addEventListener("keydown", e => {
  if (e.key === "Enter") loginButton.click();
});

async function loadData() {
  await loadAdminActiveEvent();
  setTableLoading("Betöltés...");
  const pRes = await client.from("participants").select("*").order("created_at", { ascending: true });

  if (pRes.error) {
    setTableLoading("Nem sikerült betölteni a résztvevőket.");
    alert("Nem sikerült betölteni a résztvevőket. Ellenőrizd a teszt Supabase jogosultságokat.");
    console.error(pRes.error);
    return;
  }

  participants = pRes.data || [];
  updateStats();
  render(getFilteredRows());
}

function setTableLoading(text) {
  if (body) body.innerHTML = `<tr><td colspan="8" class="muted-table-cell">${escapeHtml(text)}</td></tr>`;
}


async function loadAdminActiveEvent() {
  const event = await loadActiveEvent(client);
  const nameEl = document.getElementById("activeEventName");
  const metaEl = document.getElementById("activeEventMeta");
  if (!nameEl || !metaEl) return;

  if (!event) {
    nameEl.textContent = "Nincs aktív rendezvény";
    metaEl.textContent = "Nyisd meg a Rendezvény beállítások oldalt.";
    return;
  }

  nameEl.textContent = event.name || "Aktív rendezvény";
  const date = event.event_date ? formatEventDateHu(event.event_date) : "";
  const time = formatEventTimeRange(event);
  const place = event.location_name || event.location_address || "";
  const fee = event.contribution_amount ? formatFtHu(event.contribution_amount) : "";
  metaEl.textContent = [date, time, place, fee].filter(Boolean).join(" • ");
}

function updateStats() {
  const arrived = participants.filter(p => p.checked_in);
  const paid = participants.filter(p => p.contribution_paid);
  const unpaidArrived = participants.filter(p => p.checked_in && !p.contribution_paid);
  const speakers = participants.filter(p => roleText(p).includes("előadó"));
  const children = participants.filter(p => roleText(p).includes("gyermek"));

  document.getElementById("statParticipants").textContent = participants.length;
  document.getElementById("statCheckedIn").textContent = arrived.length;
  document.getElementById("statPaid").textContent = paid.length;
  document.getElementById("statUnpaidArrived").textContent = unpaidArrived.length;
  document.getElementById("statSpeakers").textContent = speakers.length;
  document.getElementById("statChildren").textContent = children.length;
}

function getFilteredRows() {
  const q = searchInput.value.toLowerCase().trim();
  const filter = statusFilter.value;

  return participants.filter(p => {
    const role = roleText(p);
    const searchOk =
      !q ||
      String(p.name || "").toLowerCase().includes(q) ||
      String(p.participant_code || "").toLowerCase().includes(q) ||
      String(p.city || "").toLowerCase().includes(q) ||
      String(p.type || "").toLowerCase().includes(q) ||
      String(p.email_contact || "").toLowerCase().includes(q) ||
      String(p.phone_contact || "").toLowerCase().includes(q);

    if (!searchOk) return false;

    if (filter === "arrived") return !!p.checked_in;
    if (filter === "not-arrived") return !p.checked_in;
    if (filter === "unpaid-arrived") return !!p.checked_in && !p.contribution_paid;
    if (filter === "paid") return !!p.contribution_paid;
    if (filter === "speaker") return role.includes("előadó");
    if (filter === "trainer") return role.includes("oktató") || role.includes("edző") || role.includes("lovasedző");
    if (filter === "guest") return role.includes("vendég") && !role.includes("gyermek");
    if (filter === "child") return role.includes("gyermek");
    return true;
  });
}

function render(rows) {
  body.innerHTML = "";
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="8" class="muted-table-cell">Nincs találat.</td></tr>`;
    return;
  }

  rows.forEach(p => {
    const tr = document.createElement("tr");
    tr.className = rowClass(p);
    tr.dataset.participantId = p.id;

    const contact = [
      p.email_contact ? `<small class="admin-contact">✉️ ${escapeHtml(p.email_contact)}</small>` : "",
      p.phone_contact ? `<small class="admin-contact">☎️ ${escapeHtml(p.phone_contact)}</small>` : ""
    ].join("");

    tr.innerHTML = `
      <td>
        <strong>${escapeHtml(p.name || "")}</strong>
        ${contact}
      </td>
      <td><span class="role-chip">${escapeHtml(p.type || "Vendég")}</span></td>
      <td><small>${escapeHtml(p.participant_code || "")}</small></td>
      <td>${escapeHtml(p.city || "")}</td>
      <td><button class="admin-toggle ${p.checked_in ? "on" : ""}" data-action="checkin" data-id="${p.id}"><b>${p.checked_in ? "✓" : ""}</b><span>${p.checked_in ? "Itt van" : "Nincs itt"}</span></button></td>
      <td><button class="admin-toggle ${p.contribution_paid ? "on" : ""}" data-action="paid" data-id="${p.id}"><b>${p.contribution_paid ? "✓" : ""}</b><span>${p.contribution_paid ? "Fizetett" : "Nem fizetett"}</span></button></td>
      <td>${p.checked_in_at ? escapeHtml(new Date(p.checked_in_at).toLocaleString("hu-HU")) : ""}</td>
      <td>
        <div class="admin-action-group">
          <button class="mini-button edit" data-action="edit" data-id="${p.id}">Szerkesztés</button>
          <button class="mini-button danger delete-participant-btn" data-action="delete" data-id="${p.id}">Törlés</button>
        </div>
      </td>
    `;
    body.appendChild(tr);
  });
}

function rowClass(p) {
  const role = roleText(p);
  if (p.checked_in && p.contribution_paid) return "row-ok";
  if (p.checked_in && !p.contribution_paid) return "row-warn";
  if (role.includes("előadó")) return "row-speaker";
  if (role.includes("oktató") || role.includes("edző")) return "row-trainer";
  return "";
}

function roleText(p) {
  return String(p.type || "").toLowerCase();
}

body.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.dataset.id;
  const p = participants.find(x => String(x.id) === String(id));
  if (!p) return;

  if (btn.dataset.action === "delete") {
    await deleteParticipant(p, btn);
    return;
  }

  if (btn.dataset.action === "edit") {
    openEditModal(p);
    return;
  }

  await toggleParticipantStatus(p, btn.dataset.action, btn);
});

async function toggleParticipantStatus(p, action, btn) {
  btn.disabled = true;
  btn.classList.add("is-working");

  const update = action === "checkin"
    ? { checked_in: !p.checked_in, checked_in_at: !p.checked_in ? new Date().toISOString() : null }
    : { contribution_paid: !p.contribution_paid };

  const { error } = await client.from("participants").update(update).eq("id", p.id);
  if (error) {
    btn.disabled = false;
    btn.classList.remove("is-working");
    alert("Nem sikerült menteni. Ellenőrizd az UPDATE jogosultságot a teszt Supabase-ben.");
    console.error(error);
    return;
  }

  Object.assign(p, update);
  updateStats();
  render(getFilteredRows());
}

async function deleteParticipant(p, btn) {
  const ok = confirm(
    `Biztosan törlöd ezt a résztvevőt?\n\n` +
    `Név: ${p.name || ""}\n` +
    `Kód: ${p.participant_code || ""}\n` +
    `Titulus: ${p.type || "Vendég"}\n` +
    `Megérkezett: ${p.checked_in ? "igen" : "nem"}\n` +
    `Fizetett: ${p.contribution_paid ? "igen" : "nem"}\n\n` +
    `A törlés után a QR-kódja nem lesz érvényes.`
  );
  if (!ok) return;

  btn.disabled = true;
  btn.textContent = "Törlés...";
  btn.classList.add("is-working");

  const { error } = await client.from("participants").delete().eq("id", p.id);
  if (error) {
    btn.disabled = false;
    btn.textContent = "Törlés";
    btn.classList.remove("is-working");
    alert("Nem sikerült törölni. Ellenőrizd a DELETE jogosultságot a teszt Supabase-ben.");
    console.error(error);
    return;
  }

  participants = participants.filter(x => String(x.id) !== String(p.id));
  updateStats();
  render(getFilteredRows());
}

function openEditModal(p) {
  currentEditParticipant = p;
  document.getElementById("editId").value = p.id || "";
  document.getElementById("editName").value = p.name || "";
  document.getElementById("editType").value = p.type || "Vendég";
  document.getElementById("editCity").value = p.city || "";
  document.getElementById("editEmail").value = p.email_contact || "";
  document.getElementById("editPhone").value = p.phone_contact || "";
  document.getElementById("editNote").value = p.note || "";
  document.getElementById("editCheckedIn").checked = !!p.checked_in;
  document.getElementById("editPaid").checked = !!p.contribution_paid;
  document.getElementById("editModalTitle").textContent = p.name || "Résztvevő adatai";
  editMessage.textContent = "";

  editModal.classList.remove("hidden");
  editModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeEditModal() {
  currentEditParticipant = null;
  editModal.classList.add("hidden");
  editModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

if (editModal) {
  editModal.addEventListener("click", (event) => {
    if (event.target.dataset.modalClose) closeEditModal();
  });
}

if (editForm) {
  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!currentEditParticipant) return;

    editMessage.className = "form-message";
    editMessage.textContent = "Mentés folyamatban...";

    const checkedIn = document.getElementById("editCheckedIn").checked;
    const wasCheckedIn = !!currentEditParticipant.checked_in;

    const update = {
      name: document.getElementById("editName").value.trim(),
      type: document.getElementById("editType").value,
      city: document.getElementById("editCity").value.trim(),
      email_contact: document.getElementById("editEmail").value.trim(),
      phone_contact: document.getElementById("editPhone").value.trim(),
      note: document.getElementById("editNote").value.trim(),
      checked_in: checkedIn,
      checked_in_at: checkedIn ? (wasCheckedIn && currentEditParticipant.checked_in_at ? currentEditParticipant.checked_in_at : new Date().toISOString()) : null,
      contribution_paid: document.getElementById("editPaid").checked
    };

    if (!update.name) {
      editMessage.className = "form-message error";
      editMessage.textContent = "A név megadása kötelező.";
      return;
    }

    const { data, error } = await client.from("participants").update(update).eq("id", currentEditParticipant.id).select("*").single();

    if (error) {
      editMessage.className = "form-message error";
      editMessage.textContent = "Nem sikerült menteni. Ellenőrizd az UPDATE jogosultságot.";
      console.error(error);
      return;
    }

    const index = participants.findIndex(p => String(p.id) === String(currentEditParticipant.id));
    if (index !== -1) participants[index] = data || { ...currentEditParticipant, ...update };

    editMessage.className = "form-message success";
    editMessage.textContent = "Mentve.";
    updateStats();
    render(getFilteredRows());

    setTimeout(closeEditModal, 350);
  });
}

searchInput.addEventListener("input", () => render(getFilteredRows()));
statusFilter.addEventListener("change", () => render(getFilteredRows()));

document.getElementById("exportCsv").addEventListener("click", () => {
  const rows = [["Név","Titulus","Kód","Település","E-mail","Telefon","Megérkezett","Fizetett","Érkezés ideje","Megjegyzés"]];
  getFilteredRows().forEach(p => rows.push([
    p.name,
    p.type,
    p.participant_code,
    p.city,
    p.email_contact,
    p.phone_contact,
    p.checked_in ? "igen" : "nem",
    p.contribution_paid ? "igen" : "nem",
    p.checked_in_at || "",
    p.note || ""
  ]));
  downloadCsv(rows, "csatangolo_forum_jelentkezok.csv");
});

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

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}



// === Helyszíni gyors regisztráció ===
const onsiteForm = document.getElementById("onsiteForm");
const onsiteMessage = document.getElementById("onsiteMessage");
const onsiteTicketBox = document.getElementById("onsiteTicketBox");

function makeOnsiteCode() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HELYSZIN-2026-${random}`;
}

function splitContact(contact) {
  const text = String(contact || "").trim();
  if (!text) return { email: "", phone: "" };
  if (text.includes("@")) return { email: text, phone: "" };
  return { email: "", phone: text };
}

if (onsiteForm) {
  onsiteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    onsiteMessage.className = "form-message";
    onsiteMessage.textContent = "Rögzítés folyamatban...";

    const name = document.getElementById("onsiteName").value.trim();
    const type = document.getElementById("onsiteType").value;
    const city = document.getElementById("onsiteCity").value.trim();
    const contact = splitContact(document.getElementById("onsiteContact").value);
    const arrived = document.getElementById("onsiteArrived").checked;
    const paid = document.getElementById("onsitePaid").checked;

    if (!name) {
      onsiteMessage.className = "form-message error";
      onsiteMessage.textContent = "A név megadása kötelező.";
      return;
    }

    const duplicate = participants.find(p => {
      const sameName = String(p.name || "").toLowerCase().trim() === name.toLowerCase();
      const sameContact = contact.email && String(p.email_contact || "").toLowerCase() === contact.email.toLowerCase()
        || contact.phone && String(p.phone_contact || "").replace(/\s+/g,"") === contact.phone.replace(/\s+/g,"");
      return sameName || sameContact;
    });

    if (duplicate) {
      const ok = confirm(`Úgy tűnik, ez a résztvevő már szerepelhet a listában:\n\n${duplicate.name}\n${duplicate.participant_code}\n\nBiztosan létrehozol egy új helyszíni belépőt?`);
      if (!ok) {
        onsiteMessage.className = "form-message";
        onsiteMessage.textContent = "Rögzítés megszakítva.";
        return;
      }
    }

    const row = {
      participant_code: makeOnsiteCode(),
      name,
      type,
      city,
      email_contact: contact.email,
      phone_contact: contact.phone,
      checked_in: arrived,
      checked_in_at: arrived ? new Date().toISOString() : null,
      contribution_paid: paid
    };

    const { data, error } = await client.from("participants").insert(row).select("*").single();

    if (error) {
      console.error(error);
      onsiteMessage.className = "form-message error";
      onsiteMessage.textContent = "Nem sikerült rögzíteni. Ellenőrizd a Supabase INSERT jogosultságot.";
      return;
    }

    onsiteMessage.className = "form-message success";
    onsiteMessage.textContent = "Helyszíni résztvevő rögzítve.";
    onsiteForm.reset();
    document.getElementById("onsiteArrived").checked = true;
    document.getElementById("onsitePaid").checked = false;

    await loadData();
    showOnsiteTicket(data);
  });
}

function showOnsiteTicket(p) {
  if (!onsiteTicketBox) return;
  onsiteTicketBox.classList.remove("hidden");
  onsiteTicketBox.innerHTML = `
    <div class="onsite-ticket-actions">
      <button class="button" type="button" id="saveOnsiteTicket">Kártya mentése képként</button>
      <button class="button ghost dark" type="button" onclick="window.print()">Nyomtatás</button>
    </div>

    <article id="onsiteTicketCard" class="premium-guest-card onsite-ticket-card">
      <div class="guest-card-header">
        <div class="guest-logo-mark"><img src="Photoroom_20250216_213349.png" alt="Csatangoló Lovarda logó"></div>
        <div>
          <strong>Csatangoló Lovarda</strong>
          <span>Helyszíni vendégkártya</span>
        </div>
      </div>

      <div class="guest-role-ribbon"><span>🎟️</span><b>${escapeHtml(p.type || "Vendég")}</b></div>

      <div class="guest-card-main">
        <div class="guest-person">
          <small>Helyszíni regisztráció</small>
          <h2>${escapeHtml(p.name || "")}</h2>
          <p>${p.contribution_paid ? "Fizetés rendezve" : "Fizetésre vár"}</p>
        </div>
        <div class="guest-qr-shell">
          <div id="onsiteQr" class="guest-qr"></div>
          <span>QR belépőkód</span>
        </div>
      </div>

      <div class="guest-card-footer">
        <div><span>Időpont</span><b>2026. július 25. • 9:00-tól</b></div>
        <div><span>Helyszín</span><b>Csatangoló Lovarda, Öregcsertő</b></div>
        <div><span>Belépőkód</span><b>${escapeHtml(p.participant_code || "")}</b></div>
      </div>
    </article>
  `;

  if (window.QRCode) {
    new QRCode(document.getElementById("onsiteQr"), {
      text: p.participant_code,
      width: 150,
      height: 150,
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  const saveBtn = document.getElementById("saveOnsiteTicket");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => downloadOnsiteTicket(p));
  }
}

async function downloadOnsiteTicket(p) {
  const card = document.getElementById("onsiteTicketCard");
  if (!card || !window.html2canvas) {
    alert("A képként mentés nem elérhető ezen az eszközön.");
    return;
  }

  const canvas = await html2canvas(card, {
    backgroundColor: null,
    scale: Math.min(3, window.devicePixelRatio || 2),
    useCORS: true,
    allowTaint: true
  });

  const cleanName = String(p.name || "helyszini-vendeg")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const link = document.createElement("a");
  link.download = `csatangolo-helyszini-vendegkartya-${cleanName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
