const tickets = JSON.parse(localStorage.getItem("forumTickets") || "[]");
const holder = document.getElementById("ticketCards");
const empty = document.getElementById("ticketEmpty");

function safe(text) {
  return String(text || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

if (!tickets.length) {
  empty.hidden = false;
} else {
  tickets.forEach((ticket, index) => {
    const card = document.createElement("article");
    card.className = "entry-ticket-card";
    card.innerHTML = `
      <div class="entry-ticket-top">
        <div class="ticket-logo-mark">♞</div>
        <div>
          <strong>Csatangoló Lovarda</strong>
          <span>Digitális QR-belépő</span>
        </div>
      </div>

      <div class="entry-ticket-main">
        <div>
          <small>Név</small>
          <h2>${safe(ticket.name)}</h2>
          <p>${safe(ticket.type)}</p>
        </div>
        <div id="ticketQr${index}" class="entry-ticket-qr"></div>
      </div>

      <div class="entry-ticket-details">
        <p><b>Rendezvény:</b> I. Országos Belovagló és Lókiképző Szakmai Fórum</p>
        <p><b>Időpont:</b> 2026. július 25. • 9.00-tól</p>
        <p><b>Helyszín:</b> Csatangoló Lovarda – Öregcsertő, Homokmégyi u. 39.</p>
        <p><b>Hozzájárulás:</b> 2 000 Ft / fő, helyszínen fizethető</p>
      </div>

      <div class="entry-ticket-code">${safe(ticket.participant_code)}</div>
    `;
    holder.appendChild(card);

    new QRCode(document.getElementById(`ticketQr${index}`), {
      text: ticket.participant_code,
      width: 150,
      height: 150
    });
  });
}
