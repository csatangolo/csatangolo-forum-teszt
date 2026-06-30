const publicEventClient = supabase.createClient(window.CSATANGOLO_SUPABASE_URL, window.CSATANGOLO_SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const event = await loadActiveEvent(publicEventClient);
  if (!event) return;

  const title = document.getElementById("publicEventTitle");
  const date = document.getElementById("publicEventDate");
  const time = document.getElementById("publicEventTime");
  const location = document.getElementById("publicEventLocation");
  const regButton = document.getElementById("publicRegistrationButton");

  if (title && event.name) {
    title.textContent = event.name;
  }

  if (date && event.event_date) {
    date.textContent = "📅 " + formatEventDateHu(event.event_date);
  }

  const timeText = formatEventTimeRange(event);
  if (time && timeText) {
    time.textContent = "🕘 " + timeText;
  }

  const locationText = event.location_address || event.location_name;
  if (location && locationText) {
    location.textContent = "📍 " + locationText;
  }

  if (regButton && event.registration_url) {
    regButton.href = event.registration_url;
  }

  if (event.event_date) {
    updateCountdownTarget(event.event_date, event.start_time || "09:00");
  }
});

function updateCountdownTarget(dateValue, timeValue) {
  const target = new Date(`${dateValue}T${timeValue || "09:00"}:00`);
  const daysEl = document.getElementById("f33Days");
  const hoursEl = document.getElementById("f33Hours");
  const minutesEl = document.getElementById("f33Minutes");
  if (!daysEl || !hoursEl || !minutesEl || Number.isNaN(target.getTime())) return;

  function tick() {
    const now = new Date();
    const diff = Math.max(0, target - now);
    const minutes = Math.floor(diff / 60000);
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes - days * 60 * 24) / 60);
    const mins = minutes % 60;

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(mins).padStart(2, "0");
  }

  tick();
  setInterval(tick, 60000);
}
