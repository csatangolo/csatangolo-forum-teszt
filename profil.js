const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const holder = document.getElementById("profileTickets");
const msg = document.getElementById("profileMessage");

function getQueryCode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

function localTickets() {
  return JSON.parse(localStorage.getItem("forumTickets") || "[]");
}

function renderTickets(tickets) {
  holder.innerHTML = "";
  if (!tickets.length) {
    msg.textContent = "Ezen az eszközön még nincs elmentett belépő. A regisztráció után automatikusan itt jelennek meg.";
    return;
  }
  msg.textContent = "A belépőket érdemes képernyőfotóként is elmenteni.";
  tickets.forEach((ticket, index) => {
    const card = document.createElement("div");
    card.className = "ticket-card premium-ticket large-ticket";
    card.innerHTML = `
      <span class="ticket-label">Digitális belépő</span>
      <h3>${escapeHtml(ticket.name || "")}</h3>
      <p>${escapeHtml(ticket.type || "Résztvevő")}</p>
      <div id="profile-qr-${index}" class="qr-box"></div>
      <p class="code">${escapeHtml(ticket.participant_code || "")}</p>
      <div class="ticket-status">
        <span>${ticket.checked_in ? "✅ Belépett" : "🎟️ Belépésre vár"}</span>
        <span>${ticket.contribution_paid ? "✅ Hozzájárulás rendezve" : "💰 Helyszínen fizetendő"}</span>
      </div>
    `;
    holder.appendChild(card);
    new QRCode(document.getElementById(`profile-qr-${index}`), {
      text: ticket.participant_code,
      width: 180,
      height: 180
    });
  });
}

async function load() {
  const code = getQueryCode();
  if (code) {
    const { data, error } = await client.from("participants").select("*").eq("participant_code", code).single();
    if (!error && data) {
      renderTickets([data]);
      return;
    }
  }

  renderTickets(localTickets());
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

load();
