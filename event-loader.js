// Csatangoló Manager v1.6.1 – aktív rendezvény betöltése
async function loadActiveEvent(client) {
  try {
    const { data, error } = await client
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("Aktív rendezvény nem tölthető be:", error);
      return null;
    }
    return data || null;
  } catch (error) {
    console.warn("Aktív rendezvény betöltési hiba:", error);
    return null;
  }
}

function formatEventDateHu(value) {
  if (!value) return "";
  const date = new Date(value + "T00:00:00");
  return date.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" });
}

function formatEventTimeRange(event) {
  if (!event) return "";
  const start = event.start_time ? String(event.start_time).slice(0,5).replace(":", ".") : "";
  const end = event.end_time ? String(event.end_time).slice(0,5).replace(":", ".") : "";
  if (start && end) return `${start}–${end}`;
  if (start) return `${start}-tól`;
  return "";
}

function formatFtHu(value) {
  if (value === null || value === undefined || value === "") return "";
  return new Intl.NumberFormat("hu-HU").format(Number(value)) + " Ft";
}
