// Csatangoló Fórum – időjárás és lovas ajánló
// Forrás: Open-Meteo nyílt időjárás API, kulcs nélkül használható.

const WEATHER_LAT = 46.5007;
const WEATHER_LON = 19.1116;

const weatherCodes = {
  0: "derült",
  1: "többnyire derült",
  2: "változóan felhős",
  3: "borult",
  45: "ködös",
  48: "zúzmarás köd",
  51: "gyenge szitálás",
  53: "szitálás",
  55: "erős szitálás",
  61: "gyenge eső",
  63: "eső",
  65: "erős eső",
  71: "gyenge havazás",
  73: "havazás",
  75: "erős havazás",
  80: "zápor",
  81: "erős zápor",
  82: "heves zápor",
  95: "zivatar",
  96: "zivatar jégesővel",
  99: "erős zivatar jégesővel"
};

function ridingAdvice(temp, wind, precip, code) {
  if ([95, 96, 99].includes(code)) {
    return {
      level: "warning",
      title: "Zivatarveszély",
      text: "Lovas programhoz nem ideális. Ilyenkor érdemes a fedeles lovardára és beltéri programokra készülni."
    };
  }
  if (precip >= 2 || [63, 65, 80, 81, 82].includes(code)) {
    return {
      level: "caution",
      title: "Csapadékos idő",
      text: "Lovas program lehetséges, de csúszós talajra, esőkabátra és fedett helyszínre érdemes készülni."
    };
  }
  if (wind >= 35) {
    return {
      level: "caution",
      title: "Szeles idő",
      text: "Figyelni kell a lovak érzékenységére, a zászlókra, ponyvákra és a könnyebb dekorációkra."
    };
  }
  if (temp >= 30) {
    return {
      level: "caution",
      title: "Meleg idő",
      text: "Lovasoknak és lovaknak is fontos az árnyék, a víz, a rövidebb terhelés és a pihenők."
    };
  }
  if (temp <= 5) {
    return {
      level: "caution",
      title: "Hideg idő",
      text: "Réteges öltözet és alapos bemelegítés ajánlott. A lovaknak is több idő kell a bemelegedéshez."
    };
  }
  return {
    level: "ok",
    title: "Lovas programhoz kedvező",
    text: "Az időjárás jelenleg alkalmasnak tűnik szabadtéri lovas programokhoz is. A fedeles lovarda természetesen biztonsági tartalék."
  };
}

async function loadWeather() {
  const box = document.getElementById("weatherBox");
  if (!box) return;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Europe%2FBudapest&forecast_days=3`;
    const res = await fetch(url);
    const data = await res.json();

    const current = data.current || {};
    const temp = Math.round(current.temperature_2m);
    const wind = Math.round(current.wind_speed_10m);
    const precip = Number(current.precipitation || 0);
    const code = Number(current.weather_code || 0);
    const advice = ridingAdvice(temp, wind, precip, code);

    const days = (data.daily?.time || []).map((date, i) => ({
      date,
      max: Math.round(data.daily.temperature_2m_max[i]),
      min: Math.round(data.daily.temperature_2m_min[i]),
      rain: data.daily.precipitation_sum[i],
      code: data.daily.weather_code[i]
    }));

    box.innerHTML = `
      <div class="weather-current">
        <div>
          <strong>${temp}°C</strong>
          <span>${weatherCodes[code] || "időjárás"}</span>
        </div>
        <div>
          <strong>${wind} km/h</strong>
          <span>szél</span>
        </div>
        <div>
          <strong>${precip} mm</strong>
          <span>csapadék</span>
        </div>
      </div>

      <div class="weather-advice ${advice.level}">
        <h3>${advice.title}</h3>
        <p>${advice.text}</p>
      </div>

      <div class="weather-days">
        ${days.map(d => `
          <div>
            <strong>${new Date(d.date).toLocaleDateString("hu-HU", { weekday: "short", month: "short", day: "numeric" })}</strong>
            <span>${d.min}–${d.max}°C</span>
            <small>${weatherCodes[d.code] || ""}, ${d.rain} mm</small>
          </div>
        `).join("")}
      </div>

      <p class="weather-note">Az adatok tájékoztató jellegűek, automatikusan frissülnek.</p>
    `;
  } catch (error) {
    console.error(error);
    box.innerHTML = `<p class="hint">Az időjárás most nem tölthető be, de a rendezvény időjárási körülményektől függetlenül, fedeles lovardában is megtartható.</p>`;
  }
}

loadWeather();
