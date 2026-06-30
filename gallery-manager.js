const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const MANAGER_PIN = "Tigris97";
const GALLERY_BUCKET = "gallery";

let activeEvent = null;
let albums = [];
let images = [];
let selectedAlbum = null;

document.getElementById("galleryUnlock").addEventListener("click", unlockGallery);
document.getElementById("galleryPin").addEventListener("keydown", e => {
  if (e.key === "Enter") unlockGallery();
});
document.getElementById("reloadGalleryBtn").addEventListener("click", loadGalleryData);
document.getElementById("newAlbumBtn").addEventListener("click", resetAlbumForm);
document.getElementById("resetAlbumForm").addEventListener("click", resetAlbumForm);
document.getElementById("albumForm").addEventListener("submit", saveAlbum);
document.getElementById("uploadImagesBtn").addEventListener("click", uploadImages);

function unlockGallery() {
  const message = document.getElementById("galleryLoginMessage");
  if (document.getElementById("galleryPin").value !== MANAGER_PIN) {
    message.className = "form-message error";
    message.textContent = "Hibás PIN.";
    return;
  }

  document.getElementById("galleryLogin").classList.add("hidden");
  document.getElementById("galleryContent").classList.remove("hidden");
  loadGalleryData();
}

async function loadGalleryData() {
  activeEvent = await loadActiveEvent(client);
  const meta = document.getElementById("galleryEventMeta");

  if (!activeEvent) {
    meta.textContent = "Nincs aktív rendezvény. Előbb állítsd be a Rendezvény oldalon.";
    return;
  }

  meta.textContent = [activeEvent.name, activeEvent.event_date ? formatEventDateHu(activeEvent.event_date) : ""].filter(Boolean).join(" • ");

  const { data: albumData, error: albumError } = await client
    .from("gallery_albums")
    .select("*")
    .eq("event_id", activeEvent.id)
    .order("sort_order", { ascending: true });

  if (albumError) {
    console.error(albumError);
    document.getElementById("albumList").innerHTML = `<p class="hint">Nem sikerült betölteni. Futtasd le a v1.8 SQL kódot a TESZT Supabase-ben.</p>`;
    return;
  }

  albums = albumData || [];
  renderAlbums();

  if (selectedAlbum) {
    const stillExists = albums.find(a => a.id === selectedAlbum.id);
    if (stillExists) selectAlbum(stillExists.id);
    else {
      selectedAlbum = null;
      renderImages();
    }
  }
}

function renderAlbums() {
  const list = document.getElementById("albumList");
  if (!albums.length) {
    list.innerHTML = `<p class="hint">Még nincs album. Hozz létre egyet.</p>`;
    return;
  }

  list.innerHTML = albums.map(album => `
    <button type="button" class="album-row ${selectedAlbum?.id === album.id ? "active" : ""}" data-id="${album.id}">
      <strong>${escapeHtml(album.title || "")}</strong>
      <span>${album.description ? escapeHtml(album.description) : "Nincs leírás"}</span>
    </button>
  `).join("");

  list.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => selectAlbum(btn.dataset.id));
  });
}

async function selectAlbum(id) {
  selectedAlbum = albums.find(a => String(a.id) === String(id));
  if (!selectedAlbum) return;

  document.getElementById("albumId").value = selectedAlbum.id;
  document.getElementById("albumTitle").value = selectedAlbum.title || "";
  document.getElementById("albumDescription").value = selectedAlbum.description || "";
  document.getElementById("selectedAlbumTitle").textContent = selectedAlbum.title || "Album";

  renderAlbums();
  await loadImages();
}

async function loadImages() {
  if (!selectedAlbum) return;

  const { data, error } = await client
    .from("gallery_items")
    .select("*")
    .eq("album_id", selectedAlbum.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    document.getElementById("galleryImageGrid").innerHTML = `<p class="hint">Nem sikerült betölteni a képeket.</p>`;
    return;
  }

  images = data || [];
  renderImages();
}

function renderImages() {
  const grid = document.getElementById("galleryImageGrid");

  if (!selectedAlbum) {
    grid.innerHTML = `<p class="hint">Válassz albumot a bal oldalon.</p>`;
    return;
  }

  if (!images.length) {
    grid.innerHTML = `<p class="hint">Ebben az albumban még nincs kép.</p>`;
    return;
  }

  grid.innerHTML = images.map(img => `
    <article class="gallery-image-card ${img.is_visible ? "" : "hidden-image"} ${img.is_featured ? "featured-image" : ""}">
      <img src="${escapeHtml(img.public_url)}" alt="${escapeHtml(img.caption || "")}" loading="lazy">
      <div class="gallery-image-actions">
        <button type="button" data-action="featured" data-id="${img.id}">${img.is_featured ? "⭐ Kiemelt" : "☆ Kiemelés"}</button>
        <button type="button" data-action="visible" data-id="${img.id}">${img.is_visible ? "👁️ Látható" : "🙈 Rejtett"}</button>
        <button type="button" data-action="delete" data-id="${img.id}">🗑️ Törlés</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", () => handleImageAction(btn.dataset.action, btn.dataset.id));
  });
}

async function saveAlbum(event) {
  event.preventDefault();
  const msg = document.getElementById("albumMessage");

  if (!activeEvent) {
    msg.className = "form-message error";
    msg.textContent = "Nincs aktív rendezvény.";
    return;
  }

  const row = {
    event_id: activeEvent.id,
    title: document.getElementById("albumTitle").value.trim(),
    description: document.getElementById("albumDescription").value.trim(),
    sort_order: albums.length + 1,
    is_visible: true
  };

  if (!row.title) {
    msg.className = "form-message error";
    msg.textContent = "Az album neve kötelező.";
    return;
  }

  msg.className = "form-message";
  msg.textContent = "Mentés folyamatban...";

  const albumId = document.getElementById("albumId").value;
  const query = albumId
    ? client.from("gallery_albums").update({ title: row.title, description: row.description }).eq("id", albumId).select("*").single()
    : client.from("gallery_albums").insert(row).select("*").single();

  const { data, error } = await query;

  if (error) {
    console.error(error);
    msg.className = "form-message error";
    msg.textContent = "Nem sikerült menteni az albumot.";
    return;
  }

  msg.className = "form-message success";
  msg.textContent = "Album mentve.";
  await loadGalleryData();
  if (data?.id) await selectAlbum(data.id);
}

function resetAlbumForm() {
  selectedAlbum = null;
  document.getElementById("albumForm").reset();
  document.getElementById("albumId").value = "";
  document.getElementById("selectedAlbumTitle").textContent = "Válassz albumot";
  document.getElementById("albumMessage").textContent = "";
  images = [];
  renderAlbums();
  renderImages();
}

async function uploadImages() {
  const msg = document.getElementById("uploadMessage");
  const files = Array.from(document.getElementById("galleryFiles").files || []);

  if (!selectedAlbum) {
    msg.className = "form-message error";
    msg.textContent = "Előbb válassz albumot.";
    return;
  }

  if (!files.length) {
    msg.className = "form-message error";
    msg.textContent = "Válassz ki legalább egy képet.";
    return;
  }

  msg.className = "form-message";
  msg.textContent = `Feltöltés: 0/${files.length}`;

  let uploaded = 0;

  for (const file of files) {
    const safeName = makeSafeFileName(file.name);
    const path = `${activeEvent.id}/${selectedAlbum.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await client.storage
      .from(GALLERY_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error(uploadError);
      msg.className = "form-message error";
      msg.textContent = `Hiba feltöltés közben: ${file.name}`;
      return;
    }

    const { data: publicData } = client.storage.from(GALLERY_BUCKET).getPublicUrl(path);

    const { error: insertError } = await client.from("gallery_items").insert({
      album_id: selectedAlbum.id,
      event_id: activeEvent.id,
      storage_path: path,
      public_url: publicData.publicUrl,
      caption: "",
      sort_order: images.length + uploaded + 1,
      is_visible: true,
      is_featured: false
    });

    if (insertError) {
      console.error(insertError);
      msg.className = "form-message error";
      msg.textContent = `A kép feltöltődött, de az adatbázis mentése nem sikerült: ${file.name}`;
      return;
    }

    uploaded++;
    msg.textContent = `Feltöltés: ${uploaded}/${files.length}`;
  }

  msg.className = "form-message success";
  msg.textContent = `${uploaded} kép feltöltve.`;
  document.getElementById("galleryFiles").value = "";
  await loadImages();
}

async function handleImageAction(action, id) {
  const img = images.find(x => String(x.id) === String(id));
  if (!img) return;

  if (action === "featured") {
    const { error } = await client.from("gallery_items").update({ is_featured: !img.is_featured }).eq("id", id);
    if (error) return alert("Nem sikerült módosítani.");
  }

  if (action === "visible") {
    const { error } = await client.from("gallery_items").update({ is_visible: !img.is_visible }).eq("id", id);
    if (error) return alert("Nem sikerült módosítani.");
  }

  if (action === "delete") {
    const ok = confirm("Biztosan törlöd ezt a képet az albumból?");
    if (!ok) return;

    await client.storage.from(GALLERY_BUCKET).remove([img.storage_path]);
    const { error } = await client.from("gallery_items").delete().eq("id", id);
    if (error) return alert("Nem sikerült törölni.");
  }

  await loadImages();
}

function makeSafeFileName(name) {
  return String(name || "image.jpg")
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
