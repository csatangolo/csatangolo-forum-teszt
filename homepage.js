const SUPABASE_URL = "https://ywkabsgazkzrjgjncbfc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DJvD1Hoou3Tn74T9BFx0ww_O6ObFlxY";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function setTextIfExists(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateCountdown() {
  const eventDate = new Date("2026-07-25T09:00:00+02:00");
  const now = new Date();
  const diff = eventDate - now;
  const minutesTotal = Math.max(0, Math.floor(diff / 1000 / 60));
  const days = Math.floor(minutesTotal / (60 * 24));
  const hours = Math.floor((minutesTotal - days * 60 * 24) / 60);
  const minutes = minutesTotal % 60;

  setTextIfExists("days", days);
  setTextIfExists("hours", hours);
  setTextIfExists("minutes", minutes);
}

async function loadParticipantCounter() {
  try {
    const { data, error } = await client.rpc("public_participant_count");
    if (error) throw error;
    const count = Number(data || 0);
    const wrapper = document.getElementById("participantCounter");
    const number = document.getElementById("participantCount") || document.getElementById("registeredCount") || document.getElementById("registrationCounter");
    if (!wrapper && !number) return;

    if (count >= 200) {
      if (number) number.textContent = "Már több mint " + count + " fő jelentkezett";
      if (wrapper) wrapper.classList.remove("hidden", "is-hidden-under-200");
    } else {
      if (wrapper) wrapper.classList.add("hidden", "is-hidden-under-200");
    }
  } catch (error) {
    console.log("Résztvevőszámláló nem elérhető:", error);
  }
}

updateCountdown();
setInterval(updateCountdown, 60000);
loadParticipantCounter();



// === ÉLES: főoldali előadók az új Előadókezelőből ===
(function(){
  let started = false;

  function escapeHtml(str){
    return String(str || "").replace(/[&<>"']/g, function(m){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m];
    });
  }

  async function loadActiveEventLocal(){
    try{
      const { data, error } = await client.from("events").select("*").eq("is_active", true).limit(1).maybeSingle();
      if(!error && data) return data;
    }catch(e){}
    try{
      const { data, error } = await client.from("events").select("*").order("event_date", { ascending:true }).limit(1).maybeSingle();
      if(!error && data) return data;
    }catch(e){}
    return null;
  }

  function renderCard(row){
    const p = row.people || {};
    const img = p.image_filename || "";
    const featured = !!row.is_featured;
    const title = row.talk_title || p.title || "Előadó";
    const city = p.city ? " • " + p.city : "";
    return `
      <article class="f33-speaker ${featured ? "featured" : ""}">
        <div class="f33-speaker-photo" ${img ? `style="background-image:url('${escapeHtml(img)}')"` : ""}></div>
        <div class="f33-speaker-body">
          <span>${featured ? "Kiemelt előadó" : "Előadó"}</span>
          <h3>${escapeHtml(p.name || "Előadó")}</h3>
          <p>${escapeHtml(title + city)}</p>
          <a href="eloadok.html">Részletek</a>
        </div>
      </article>
    `;
  }

  async function loadHomeSpeakers(){
    const strip = document.getElementById("speakerList");
    if(!strip || strip.dataset.liveSpeakersReady === "1") return;
    const fallback = strip.innerHTML;

    try{
      const activeEvent = await loadActiveEventLocal();
      if(!activeEvent) return;

      const { data, error } = await client
        .from("event_speakers")
        .select("id,talk_title,sort_order,is_visible,is_featured,people(id,name,title,city,bio,image_filename,gallery_images)")
        .eq("event_id", activeEvent.id)
        .eq("is_visible", true)
        .order("sort_order", { ascending:true });

      if(error) throw error;
      const rows = (data || []).filter(row => row.people);
      if(!rows.length) return;

      strip.dataset.liveSpeakersReady = "1";
      strip.innerHTML = rows.map(renderCard).join("");
      initAutoscroll();
    }catch(error){
      console.log("Éles főoldali előadók: marad a statikus lista.", error);
      strip.innerHTML = fallback;
    }
  }

  function initAutoscroll(){
    const strip = document.getElementById("speakerList");
    if(!strip || started) return;
    const cards = Array.from(strip.children);
    if(cards.length < 2) return;
    started = true;
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.classList.add("f33-speaker-clone");
      strip.appendChild(clone);
    });
    let paused = false;
    const speed = 0.38;
    strip.addEventListener("mouseenter", () => paused = true);
    strip.addEventListener("mouseleave", () => paused = false);
    strip.addEventListener("touchstart", () => paused = true, { passive:true });
    strip.addEventListener("touchend", () => setTimeout(() => paused = false, 2200), { passive:true });
    function tick(){
      if(!paused && strip.scrollWidth > strip.clientWidth){
        const half = strip.scrollWidth / 2;
        strip.scrollLeft += speed;
        if(strip.scrollLeft >= half) strip.scrollLeft -= half;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener("DOMContentLoaded", loadHomeSpeakers);
  window.addEventListener("load", () => setTimeout(loadHomeSpeakers, 400));
})();


// === v4.0 közösségi tér: stabil automatikus slider ===
(function(){
  function initCommunitySliderV4(){
    var slider = document.querySelector('.f33-community-slider');
    if(!slider) return;

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.f33-community-slide'));
    if(!slides.length) return;

    var caption = document.getElementById('communityCaption');
    var captions = [
      'Családi programok egész nap',
      'Csatangoló Lovas Büfé és Fröccsterasz',
      'Lovas élmények, gyerekprogramok, közösség'
    ];

    if(slider.dataset.v4Ready === '1') return;
    slider.dataset.v4Ready = '1';

    var i = slides.findIndex(function(s){ return s.classList.contains('is-active'); });
    if(i < 0) i = 0;

    function show(next){
      slides.forEach(function(slide, index){
        slide.classList.toggle('is-active', index === next);
      });
      if(caption) caption.textContent = captions[next] || captions[0];
      i = next;
    }

    show(i);
    window.setInterval(function(){
      show((i + 1) % slides.length);
    }, 4800);
  }

  document.addEventListener('DOMContentLoaded', initCommunitySliderV4);
  window.addEventListener('load', initCommunitySliderV4);
  setTimeout(initCommunitySliderV4, 500);
  setTimeout(initCommunitySliderV4, 1500);
})();

// FINAL2 közösségi tér: háromképes automatikus slider
(function(){
  function initCommunitySliderFinal(){
    var slider=document.querySelector('.f33-community-slider');
    if(!slider) return;
    var slides=Array.prototype.slice.call(slider.querySelectorAll('.f33-community-slide'));
    if(!slides.length) return;
    var caption=document.getElementById('communityCaption');
    var captions=['Családi programok egész nap','Csatangoló Lovas Büfé és Fröccsterasz','Lovas élmények, gyerekprogramok és közösség'];
    if(slider.dataset.finalSlider==='1') return;
    slider.dataset.finalSlider='1';
    var index=0;
    function show(i){slides.forEach(function(s,n){s.classList.toggle('is-active',n===i);}); if(caption) caption.textContent=captions[i]||captions[0]; index=i;}
    show(0);
    setInterval(function(){show((index+1)%slides.length);},4300);
  }
  document.addEventListener('DOMContentLoaded',initCommunitySliderFinal);
  window.addEventListener('load',initCommunitySliderFinal);
  setTimeout(initCommunitySliderFinal,500);
})();
