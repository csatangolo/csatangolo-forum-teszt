
const F33_DATE = new Date("2026-07-25T09:00:00+02:00");
function f33Set(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const next = String(value).padStart(2, "0");
  if (el.textContent !== next) {
    el.classList.remove("f33-pop");
    void el.offsetWidth;
    el.textContent = next;
    el.classList.add("f33-pop");
  }
}
function f33Countdown() {
  let diff = Math.max(0, F33_DATE - new Date());
  const days = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000); diff %= 3600000;
  const minutes = Math.floor(diff / 60000);
  f33Set("f33Days", days);
  f33Set("f33Hours", hours);
  f33Set("f33Minutes", minutes);
}
setInterval(f33Countdown, 15000);
f33Countdown();
