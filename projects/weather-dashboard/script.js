const codeText=c=>({0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Fog',51:'Drizzle',53:'Drizzle',55:'Drizzle',61:'Rain',63:'Rain',65:'Heavy rain',71:'Snow',80:'Showers',95:'Thunderstorm'}[c]||'Mixed conditions');
const getJSON=async url=>{const r=await fetch(url);if(!r.ok)throw new Error(`Weather service error (${r.status})`);return r.json()};
function showError(message,retry){
  const status=document.getElementById('status');
  status.innerHTML=`<span>${message}</span> <button id="retryWeather" type="button">Try Again</button>`;
  document.getElementById('retryWeather')?.addEventListener('click',retry);
}
function renderWeather(label,w){
  if(!w.current||!w.daily)throw new Error('Weather data was incomplete');
  document.getElementById('current').innerHTML=`<div><div class="meta">${label}</div><div class="temp">${Math.round(w.current.temperature_2m)}°C</div><h2>${codeText(w.current.weather_code)}</h2></div><div class="stats"><div class="stat">Feels like<br><b>${Math.round(w.current.apparent_temperature)}°C</b></div><div class="stat">Humidity<br><b>${w.current.relative_humidity_2m}%</b></div><div class="stat">Wind<br><b>${Math.round(w.current.wind_speed_10m)} km/h</b></div><div class="stat">Updated<br><b>${new Date(w.current.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</b></div></div>`;
  document.getElementById('forecast').innerHTML=w.daily.time.slice(0,5).map((d,i)=>`<article class="day"><span>${new Date(d+'T00:00').toLocaleDateString([], {weekday:'short'})}</span><strong>${Math.round(w.daily.temperature_2m_max[i])}°</strong><span>${codeText(w.daily.weather_code[i])}<br>Low ${Math.round(w.daily.temperature_2m_min[i])}°</span></article>`).join('');
  document.getElementById('status').textContent='';
}
async function load(city){
  const status=document.getElementById('status');status.textContent='Loading weather…';
  try{
    const g=await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if(!g.results?.length)throw new Error('City not found');
    const p=g.results[0];
    const w=await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
    renderWeather(`${p.name}${p.admin1?', '+p.admin1:''}, ${p.country}`,w);
  }catch(e){showError(e.message==='City not found'?'City not found. Try a different spelling.':'Weather data could not be loaded. Check your connection and try again.',()=>load(city))}
}
async function loadCoords(lat,lon){
  document.getElementById('status').textContent='Loading weather for your location…';
  try{
    const w=await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
    renderWeather('Your current location',w);
  }catch(e){showError('Could not load weather for this location.',()=>loadCoords(lat,lon))}
}
document.getElementById('search').onsubmit=e=>{e.preventDefault();const city=document.getElementById('city').value.trim();if(city)load(city)};
document.getElementById('location').onclick=()=>{if(!navigator.geolocation){showError('Geolocation is not supported in this browser.',()=>load('Johannesburg'));return}navigator.geolocation.getCurrentPosition(p=>loadCoords(p.coords.latitude,p.coords.longitude),()=>showError('Location access was not available. Search for a city instead.',()=>load('Johannesburg')),{timeout:8000})};
load('Johannesburg');