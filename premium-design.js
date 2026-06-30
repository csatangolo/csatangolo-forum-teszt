const EVENT_DATE = new Date("2026-07-25T09:00:00+02:00");

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const next = String(value).padStart(2, "0");
  if (el.textContent !== next) {
    el.classList.remove("flip-change");
    void el.offsetWidth;
    el.textContent = next;
    el.classList.add("flip-change");
  }
}
function updateCountdown() {
  const now = new Date();
  let diff = Math.max(0, EVENT_DATE - now);
  const days = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000); diff %= 3600000;
  const minutes = Math.floor(diff / 60000); diff %= 60000;
  const seconds = Math.floor(diff / 1000);
  setText("cdDays", days);
  setText("cdHours", hours);
  setText("cdMinutes", minutes);
  setText("cdSeconds", seconds);
}
setInterval(updateCountdown, 1000);
updateCountdown();

window.addEventListener("load", () => {
  const intro = document.getElementById("introScreen");
  if (!intro) return;
  setTimeout(() => intro.classList.add("hide-intro"), 1000);
  setTimeout(() => intro.remove(), 1900);
});

const themeBtn = document.getElementById("themeToggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-premium");
    themeBtn.textContent = document.body.classList.contains("dark-premium") ? "☀️" : "🌙";
  });
}
