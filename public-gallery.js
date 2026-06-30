const galleryClient = supabase.createClient(window.CSATANGOLO_SUPABASE_URL, window.CSATANGOLO_SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("dynamicGallery");
  if (!container) return;

  const event = await loadActiveEvent(galleryClient);
  if (!event) {
    container.innerHTML = `<p class="hint">A galéria hamarosan elérhető lesz.</p>`;
    return;
  }

  const { data, error } = await galleryClient
    .from("gallery_items")
    .select("*, gallery_albums(title)")
    .eq("event_id", event.id)
    .eq("is_visible", true)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error || !data || !data.length) {
    container.innerHTML = `<p class="hint">A galéria hamarosan bővül.</p>`;
    return;
  }

  container.innerHTML = data.map(item => `
    <article class="public-gallery-card ${item.is_featured ? "featured" : ""}">
      <img src="${escapeHtml(item.public_url)}" alt="${escapeHtml(item.caption || item.gallery_albums?.title || "Galéria kép")}" loading="lazy">
      ${item.is_featured ? "<span>⭐ Kiemelt</span>" : ""}
    </article>
  `).join("");
});

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
