const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
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


// Premium előadói sor: automatikus, finom lapozás
(function(){
  function initSpeakerAutoscroll(){
    var strip = document.getElementById('speakerList');
    if(!strip || strip.dataset.autoscrollReady === '1') return;
    strip.dataset.autoscrollReady = '1';
    var paused = false;
    strip.addEventListener('mouseenter', function(){ paused = true; });
    strip.addEventListener('mouseleave', function(){ paused = false; });
    strip.addEventListener('touchstart', function(){ paused = true; }, {passive:true});
    strip.addEventListener('touchend', function(){ setTimeout(function(){ paused = false; }, 2500); }, {passive:true});
    setInterval(function(){
      if(paused || strip.scrollWidth <= strip.clientWidth) return;
      var card = strip.querySelector('.f33-speaker, .speaker-premium-card');
      var step = card ? (card.getBoundingClientRect().width + 20) : 320;
      if(strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 20){
        strip.scrollTo({left:0, behavior:'smooth'});
      }else{
        strip.scrollBy({left:step, behavior:'smooth'});
      }
    }, 4200);
  }
  document.addEventListener('DOMContentLoaded', initSpeakerAutoscroll);
  window.addEventListener('load', initSpeakerAutoscroll);
  setTimeout(initSpeakerAutoscroll, 1200);
})();


// Premium v1.7 előadói sor: folyamatos, körbeforduló lapozás
(function(){
  function initInfiniteSpeakers(){
    var strip = document.getElementById('speakerList');
    if(!strip || strip.dataset.infiniteSpeakers === '1') return;
    strip.dataset.infiniteSpeakers = '1';

    var originalCards = Array.prototype.slice.call(strip.children);
    if(originalCards.length < 2) return;

    originalCards.forEach(function(card){
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('f33-speaker-clone');
      strip.appendChild(clone);
    });

    var paused = false;
    var speed = 0.42;

    strip.addEventListener('mouseenter', function(){ paused = true; });
    strip.addEventListener('mouseleave', function(){ paused = false; });
    strip.addEventListener('touchstart', function(){ paused = true; }, {passive:true});
    strip.addEventListener('touchend', function(){ setTimeout(function(){ paused = false; }, 2200); }, {passive:true});

    function halfWidth(){
      return strip.scrollWidth / 2;
    }

    function tick(){
      if(!paused && strip.scrollWidth > strip.clientWidth){
        strip.scrollLeft += speed;
        if(strip.scrollLeft >= halfWidth()){
          strip.scrollLeft = strip.scrollLeft - halfWidth();
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener('DOMContentLoaded', initInfiniteSpeakers);
  window.addEventListener('load', initInfiniteSpeakers);
  setTimeout(initInfiniteSpeakers, 1000);
})();


// Premium v1.8: előadói körlapozás frissítése a plusz kártya után
(function(){
  function refreshSpeakerCarousel(){
    var strip = document.getElementById('speakerList');
    if(!strip) return;
    if(!strip.querySelector('.f33-speaker-apply')){
      var card = document.createElement('article');
      card.className = 'f33-speaker f33-speaker-apply';
      card.innerHTML = '<div class="f33-speaker-photo"></div><div class="f33-speaker-body"><span>Nyitott lehetőség</span><h3>Jelentkezz te is előadónak</h3><p>Kerülj fel hamarosan az előadók közé.</p><a href="kapcsolat.html">Kapcsolatfelvétel</a></div>';
      strip.appendChild(card);
    }
  }
  window.addEventListener('load', function(){
    setTimeout(refreshSpeakerCarousel, 1200);
    setTimeout(refreshSpeakerCarousel, 2600);
  });
})();


// Premium v1.9: előadói kártyák folyamatos, körbeforduló mozgása
(function(){
  function ensureApplyCard(strip){
    if(!strip || strip.querySelector('.f33-speaker-apply')) return;
    var card = document.createElement('article');
    card.className = 'f33-speaker f33-speaker-apply';
    card.innerHTML = '<div class="f33-speaker-photo"></div><div class="f33-speaker-body"><span>Nyitott lehetőség</span><h3>Jelentkezz te is előadónak</h3><p>Kerülj fel hamarosan az előadók közé.</p><a href="kapcsolat.html">Kapcsolatfelvétel</a></div>';
    strip.appendChild(card);
  }

  function initInfiniteSpeakersV19(){
    var strip = document.getElementById('speakerList');
    if(!strip || strip.dataset.infiniteSpeakersV19 === '1') return;

    ensureApplyCard(strip);

    var cards = Array.prototype.slice.call(strip.children).filter(function(card){
      return !card.classList.contains('f33-speaker-clone');
    });
    if(cards.length < 2) return;

    strip.dataset.infiniteSpeakersV19 = '1';

    cards.forEach(function(card){
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('f33-speaker-clone');
      strip.appendChild(clone);
    });

    var paused = false;
    var speed = 0.38;

    strip.addEventListener('mouseenter', function(){ paused = true; });
    strip.addEventListener('mouseleave', function(){ paused = false; });
    strip.addEventListener('touchstart', function(){ paused = true; }, {passive:true});
    strip.addEventListener('touchend', function(){ setTimeout(function(){ paused = false; }, 2200); }, {passive:true});

    function tick(){
      if(!paused && strip.scrollWidth > strip.clientWidth){
        var half = strip.scrollWidth / 2;
        strip.scrollLeft += speed;
        if(strip.scrollLeft >= half){
          strip.scrollLeft = strip.scrollLeft - half;
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener('DOMContentLoaded', function(){ setTimeout(initInfiniteSpeakersV19, 700); });
  window.addEventListener('load', function(){ setTimeout(initInfiniteSpeakersV19, 1200); });
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
