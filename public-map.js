const PUBLIC_MAP_SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const PUBLIC_MAP_SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;

const PUBLIC_CITY_COORDS = {
  "budapest":[47.4979,19.0402],"kecskemet":[46.9062,19.6913],"kalocsa":[46.5290,18.9728],"oregcserto":[46.5007,19.1116],"homokmegy":[46.4881,19.0740],"baja":[46.1829,18.9536],"szeged":[46.2530,20.1414],"debrecen":[47.5316,21.6273],"pecs":[46.0727,18.2323],"gyor":[47.6875,17.6504],"miskolc":[48.1035,20.7784],"nyiregyhaza":[47.9495,21.7244],"szekesfehervar":[47.1860,18.4221],"szolnok":[47.1621,20.1825],"kaposvar":[46.3594,17.7968],"paks":[46.6229,18.8557],"dunapataj":[46.6425,18.9966],"harta":[46.6971,19.0306],"dusnok":[46.3907,18.9643],"fajsz":[46.4205,18.9222],"batya":[46.4881,18.9548],"solt":[46.8010,19.0003],"kiskoros":[46.6214,19.2853],"kiskunhalas":[46.4319,19.4875],"kiskunfelegyhaza":[46.7118,19.8446],"szekszard":[46.3474,18.7062]
};
const PUBLIC_MAIN_CITIES = [["Budapest",47.4979,19.0402],["Kecskemét",46.9062,19.6913],["Kalocsa",46.5290,18.9728],["Öregcsertő",46.5007,19.1116],["Baja",46.1829,18.9536],["Szeged",46.2530,20.1414],["Pécs",46.0727,18.2323],["Szolnok",47.1621,20.1825],["Székesfehérvár",47.1860,18.4221]];
const PUBLIC_FALLBACK_PARTICIPANT_CITIES = [["Öregcsertő",[46.5007,19.1116]],["Kalocsa",[46.5290,18.9728]],["Kecskemét",[46.9062,19.6913]]];
function publicNormalizeCity(city){return String(city||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/^\d{4}\s*/,"").replace(/,.*$/g,"").replace(/\s+/g," ");}
function publicDisplayCity(city){const raw=String(city||"").trim().replace(/^\d{4}\s*/,"").replace(/,.*$/g,"");return raw?raw.charAt(0).toUpperCase()+raw.slice(1):"";}
function findCoords(city){return PUBLIC_CITY_COORDS[publicNormalizeCity(city)] || null;}
function makeCityLabel(name){return L.divIcon({className:"f33-real-map-label",html:`<span>${name}</span>`,iconSize:[140,26],iconAnchor:[70,13]});}
function makePin(city){return L.divIcon({className:"f33-real-map-pin",html:`<span></span><b>${city}</b>`,iconSize:[150,38],iconAnchor:[10,19]});}

async function collectPublicCities(){
  const cities = new Map();
  function addCity(name, coords){ if(name && coords) cities.set(publicNormalizeCity(name), {name: publicDisplayCity(name) || name, coords}); }
  try{
    if(typeof supabase !== "undefined"){
      const client=supabase.createClient(PUBLIC_MAP_SUPABASE_URL,PUBLIC_MAP_SUPABASE_ANON_KEY);
      const queries=[
        client.from("participants").select("city").not("city","is",null).limit(1000),
        client.from("registrations").select("city").not("city","is",null).limit(1000)
      ];
      const results=await Promise.allSettled(queries);
      results.forEach(res=>{
        if(res.status==="fulfilled" && res.value && !res.value.error){
          (res.value.data||[]).forEach(row=>{ const coords=findCoords(row.city); if(coords) addCity(row.city, coords); });
        }
      });
    }
  }catch(e){ console.warn("Publikus térkép adatbetöltési hiba:", e); }
  if(!cities.size){ PUBLIC_FALLBACK_PARTICIPANT_CITIES.forEach(([name,coords])=>addCity(name, coords)); }
  return cities;
}

async function initPublicForumMap(){
  const mapEl=document.getElementById("publicForumMap");
  const noteEl=document.getElementById("publicMapNote");
  if(!mapEl || typeof L==="undefined") return;
  if(mapEl.dataset.mapReady === "1") return;
  mapEl.dataset.mapReady = "1";
  mapEl.innerHTML="";
  const map=L.map(mapEl,{zoomControl:false,attributionControl:false,scrollWheelZoom:true,doubleClickZoom:true,dragging:true,touchZoom:true}).setView([46.62,19.18],8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:14}).addTo(map);
  L.control.zoom({position:"bottomright"}).addTo(map);

  PUBLIC_MAIN_CITIES.forEach(([name,lat,lng])=>L.marker([lat,lng],{icon:makeCityLabel(name),interactive:false,keyboard:false,zIndexOffset:100}).addTo(map));

  const cities=await collectPublicCities();
  if(noteEl) noteEl.textContent = cities.size ? "A pontok azt mutatják, mely településekről érkeznek résztvevők." : "A térkép a regisztrációk alapján frissül.";

  const bounds=[];
  cities.forEach(({name,coords})=>{
    bounds.push(coords);
    L.marker(coords,{icon:makePin(name),keyboard:false,zIndexOffset:900}).addTo(map).bindTooltip(name,{direction:"top",offset:[0,-12],className:"f33-real-tooltip"});
  });
  if(bounds.length>1) map.fitBounds(bounds,{padding:[42,42],maxZoom:9});
  setTimeout(()=>map.invalidateSize(),200);
  setTimeout(()=>map.invalidateSize(),900);
  setTimeout(()=>map.invalidateSize(),1800);
}

document.addEventListener("DOMContentLoaded",initPublicForumMap);
window.addEventListener("load",()=>setTimeout(initPublicForumMap,150));
