const FORUM_DATE = new Date("2026-07-25T09:00:00+02:00");
function flSet(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const next = String(value).padStart(2, "0");
  if (el.textContent !== next) {
    el.classList.remove("fl-pop");
    void el.offsetWidth;
    el.textContent = next;
    el.classList.add("fl-pop");
  }
}
function flCountdown() {
  let diff = Math.max(0, FORUM_DATE - new Date());
  const days = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000); diff %= 3600000;
  const minutes = Math.floor(diff / 60000);
  flSet("flDays", days);
  flSet("flHours", hours);
  flSet("flMinutes", minutes);
}
setInterval(flCountdown, 15000);
flCountdown();
