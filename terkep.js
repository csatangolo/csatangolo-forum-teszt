const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_CODE = "csatangolo2026";

// Alap magyarországi település-koordináták.
// A lista bővíthető, ha az ellenőrző "nem azonosított települést" jelez.
const CITY_COORDS = {
  "budapest":[47.4979,19.0402],
  "kecskemét":[46.9062,19.6913],
  "kecskemet":[46.9062,19.6913],
  "kalocsa":[46.5290,18.9728],
  "öregcsertő":[46.5007,19.1116],
  "oregcserto":[46.5007,19.1116],
  "homokmégy":[46.4881,19.0740],
  "homokmegy":[46.4881,19.0740],
  "baja":[46.1829,18.9536],
  "szeged":[46.2530,20.1414],
  "debrecen":[47.5316,21.6273],
  "pécs":[46.0727,18.2323],
  "pecs":[46.0727,18.2323],
  "győr":[47.6875,17.6504],
  "gyor":[47.6875,17.6504],
  "miskolc":[48.1035,20.7784],
  "nyíregyháza":[47.9495,21.7244],
  "nyiregyhaza":[47.9495,21.7244],
  "székesfehérvár":[47.1860,18.4221],
  "szekesfehervar":[47.1860,18.4221],
  "szombathely":[47.2307,16.6218],
  "szolnok":[47.1621,20.1825],
  "tatabánya":[47.5692,18.4048],
  "tatabanya":[47.5692,18.4048],
  "kaposvár":[46.3594,17.7968],
  "kaposvar":[46.3594,17.7968],
  "békéscsaba":[46.6736,21.0877],
  "bekescsaba":[46.6736,21.0877],
  "eger":[47.9025,20.3772],
  "zalaegerszeg":[46.8417,16.8416],
  "veszprém":[47.1028,17.9093],
  "veszprem":[47.1028,17.9093],
  "sopron":[47.6817,16.5845],
  "hódmezővásárhely":[46.4181,20.3300],
  "hodmezovasarhely":[46.4181,20.3300],
  "dunaújváros":[46.9619,18.9355],
  "dunaujvaros":[46.9619,18.9355],
  "cegléd":[47.1727,19.7995],
  "cegled":[47.1727,19.7995],
  "nagykőrös":[47.0342,19.7786],
  "nagykoros":[47.0342,19.7786],
  "kiskőrös":[46.6214,19.2853],
  "kiskoros":[46.6214,19.2853],
  "kiskunhalas":[46.4319,19.4875],
  "kiskunfélegyháza":[46.7118,19.8446],
  "kiskunfelegyhaza":[46.7118,19.8446],
  "kiskunmajsa":[46.4902,19.7407],
  "soltvadkert":[46.5789,19.3937],
  "solt":[46.8010,19.0003],
  "dunapataj":[46.6425,18.9966],
  "harta":[46.6971,19.0306],
  "dusnok":[46.3907,18.9643],
  "fajsz":[46.4205,18.9222],
  "bátya":[46.4887,18.9548],
  "batya":[46.4887,18.9548],
  "sükösd":[46.2815,18.9957],
  "sukosd":[46.2815,18.9957],
  "hajós":[46.3984,19.1205],
  "hajos":[46.3984,19.1205],
  "nemesnádudvar":[46.3333,19.0500],
  "nemesnadudvar":[46.3333,19.0500],
  "császártöltés":[46.4213,19.1833],
  "csaszartoltes":[46.4213,19.1833],
  "mélykút":[46.2167,19.3833],
  "melykut":[46.2167,19.3833],
  "jánoshalma":[46.2981,19.3250],
  "janoshalma":[46.2981,19.3250],
  "dunavecse":[46.9148,18.9714],
  "kunszentmiklós":[47.0267,19.1256],
  "kunszentmiklos":[47.0267,19.1256],
  "lajosmizse":[47.0213,19.5617],
  "izsák":[46.8045,19.3511],
  "izsak":[46.8045,19.3511],
  "akásztó":[46.6917,19.2042],
  "akaszto":[46.6917,19.2042],
  "tabdi":[46.6822,19.3075],
  "kecel":[46.5257,19.2518],
  "csengőd":[46.7153,19.2686],
  "csengod":[46.7153,19.2686],
  "imrehegy":[46.4869,19.3044],
  "tázlár":[46.5489,19.5147],
  "tazlar":[46.5489,19.5147],
  "fülöpszállás":[46.8209,19.2372],
  "fulopszallas":[46.8209,19.2372],
  "szekszárd":[46.3474,18.7062],
  "szekszard":[46.3474,18.7062],
  "paks":[46.6229,18.8557],
  "tolna":[46.4268,18.7825],
  "mohács":[45.9931,18.6830],
  "mohacs":[45.9931,18.6830],
  "siófok":[46.9041,18.0580],
  "siofok":[46.9041,18.0580],
  "dombóvár":[46.3766,18.1360],
  "dombovar":[46.3766,18.1360],
  "gyöngyös":[47.7826,19.9280],
  "gyongyos":[47.7826,19.9280],
  "hatvan":[47.6667,19.6833],
  "gödöllő":[47.5970,19.3552],
  "godollo":[47.5970,19.3552],
  "vác":[47.7759,19.1361],
  "vac":[47.7759,19.1361],
  "esztergom":[47.7857,18.7403],
  "komárom":[47.7432,18.1191],
  "komarom":[47.7432,18.1191],
  "ajka":[47.1010,17.5522],
  "pápa":[47.3300,17.4674],
  "papa":[47.3300,17.4674],
  "mosonmagyaróvár":[47.8679,17.2699],
  "mosonmagyarovar":[47.8679,17.2699],
  "sárvár":[47.2530,16.9352],
  "sarvar":[47.2530,16.9352],
  "nagykanizsa":[46.4590,16.9897],
  "keszthely":[46.7681,17.2432],
  "salgótarján":[48.1030,19.8030],
  "salgotarjan":[48.1030,19.8030],
  "ózd":[48.2167,20.3000],
  "ozd":[48.2167,20.3000],
  "kazincbarcika":[48.2500,20.6333],
  "mezőkövesd":[47.8067,20.5717],
  "mezokovesd":[47.8067,20.5717],
  "szerencs":[48.1631,21.2050],
  "tokaj":[48.1167,21.4167],
  "mátészalka":[47.9553,22.3235],
  "mateszalka":[47.9553,22.3235],
  "kisvárda":[48.2167,22.0833],
  "kisvarda":[48.2167,22.0833],
  "hajdúböszörmény":[47.6667,21.5167],
  "hajduboszormeny":[47.6667,21.5167],
  "hajdúszoboszló":[47.4431,21.3917],
  "hajduszoboszlo":[47.4431,21.3917],
  "karcag":[47.3167,20.9333],
  "törökszentmiklós":[47.1833,20.4167],
  "torokszentmiklos":[47.1833,20.4167],
  "mezőtúr":[47.0000,20.6333],
  "mezotur":[47.0000,20.6333],
  "orosháza":[46.5667,20.6667],
  "oroshaza":[46.5667,20.6667],
  "gyula":[46.6500,21.2833],
  "szentes":[46.6500,20.2667],
  "makó":[46.2167,20.4833],
  "mako":[46.2167,20.4833],
  "csongrád":[46.7133,20.1422],
  "csongrad":[46.7133,20.1422]
};

document.getElementById("startMap").addEventListener("click", async () => {
  const code = document.getElementById("mapCode").value;
  if (code !== ADMIN_CODE) {
    const msg = document.getElementById("mapMessage");
    msg.className = "form-message error";
    msg.textContent = "Hibás szervezői kód.";
    return;
  }
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("mapContent").classList.remove("hidden");
  await loadMapData();
});

function normalizeCity(city) {
  return String(city || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/,.*$/, "")
    .replace(/^\d{4}\s*/, "");
}

function displayCity(city) {
  const c = String(city || "").trim().replace(/^\d{4}\s*/, "");
  return c ? c.charAt(0).toUpperCase() + c.slice(1) : "";
}

async function loadMapData() {
  const { data, error } = await client.from("participants").select("city,name,type");
  if (error) {
    alert("Nem sikerült betölteni a településadatokat.");
    console.error(error);
    return;
  }

  const counts = new Map();
  (data || []).forEach(row => {
    const key = normalizeCity(row.city);
    if (!key) return;
    const current = counts.get(key) || { city: displayCity(row.city), count: 0 };
    current.count += 1;
    counts.set(key, current);
  });

  const known = [];
  const unknown = [];

  counts.forEach((value, key) => {
    const coords = CITY_COORDS[key] || CITY_COORDS[removeAccents(key)];
    if (coords) known.push({ ...value, key, coords });
    else unknown.push(value);
  });

  renderMap(known);
  renderTopCities([...counts.values()].sort((a,b) => b.count - a.count));
  renderSummary(known, unknown);
}

function removeAccents(str) {
  return String(str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function renderMap(points) {
  const map = L.map("hungaryMap", { scrollWheelZoom: true }).setView([47.1, 19.4], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  points.forEach(p => {
    const radius = Math.min(26, 7 + p.count * 2.2);
    L.circleMarker(p.coords, {
      radius,
      color: "#5E3C26",
      weight: 2,
      fillColor: "#C99A51",
      fillOpacity: 0.72
    })
    .addTo(map)
    .bindPopup(`<strong>${escapeHtml(p.city)}</strong><br>👥 ${p.count} résztvevő`);
  });

  if (points.length) {
    const bounds = L.latLngBounds(points.map(p => p.coords));
    map.fitBounds(bounds.pad(0.25));
  }
}

function renderTopCities(cities) {
  const el = document.getElementById("topCities");
  if (!cities.length) {
    el.innerHTML = '<p class="hint">Még nincs településadat.</p>';
    return;
  }

  el.innerHTML = cities.slice(0, 20).map(c => `
    <div class="list-row">
      <span>${escapeHtml(c.city)}</span>
      <strong>${c.count}</strong>
    </div>
  `).join("");
}

function renderSummary(known, unknown) {
  document.getElementById("sumParticipants").textContent = known.reduce((sum, x) => sum + x.count, 0);
  document.getElementById("sumCities").textContent = known.length;
  document.getElementById("unknownCities").textContent = unknown.length;

  if (unknown.length) {
    document.getElementById("unknownBox").classList.remove("hidden");
    document.getElementById("unknownList").innerHTML = unknown.map(u => `<span>${escapeHtml(u.city)} (${u.count})</span>`).join("");
  }
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
