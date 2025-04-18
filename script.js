// --- STATE & DEFAULTS ---
const defaultGlobal = {
  theme: 'dark',
  accent: '#4caf50',
  baseFontSize: '16px'
};
const defaultSlides = {
  main:    { clockFont: 'clock-style-1', is24h: false },
  calendar:{ startMonday: false, highlightWeekends: false },
  weather: { units:'C', showWind:true, showPressure:true, showPrecip:true, showHumidity:true, forecastDays:3 }
};

let globalSettings = JSON.parse(localStorage.getItem('global')) || defaultGlobal;
let slideSettings  = JSON.parse(localStorage.getItem('slides')) || defaultSlides;

// APPLY GLOBAL
function applyGlobal() {
  document.body.className = globalSettings.theme;
  document.documentElement.style.setProperty('--accent', globalSettings.accent);
  document.documentElement.style.fontSize = globalSettings.baseFontSize;
}
applyGlobal();

function saveGlobal(){ localStorage.setItem('global', JSON.stringify(globalSettings)); }
function saveSlides() { localStorage.setItem('slides', JSON.stringify(slideSettings)); }

// CAROUSEL
let idx=0;
const slides = [...document.querySelectorAll('.slide')];
const carousel = document.getElementById('carousel');
function show(i){ idx=(i+slides.length)%slides.length; carousel.style.transform=`translateX(-${idx*100}%)`; }
document.getElementById('nextBtn').onclick =()=>show(idx+1);
document.getElementById('prevBtn').onclick =()=>show(idx-1);
// swipe
let sx=0;
carousel.addEventListener('touchstart',e=>sx=e.touches[0].clientX);
carousel.addEventListener('touchend',e=>{
  let dx=e.changedTouches[0].clientX - sx;
  if(dx>50) show(idx-1); if(dx<-50) show(idx+1);
});

// SETTINGS MODAL
const modal      = document.getElementById('settingsModal');
const titleEl    = document.getElementById('modalTitle');
const contentEl  = document.getElementById('modalContent');
document.getElementById('openGlobalBtn').onclick =()=>openModal('global');
document.getElementById('openSlideBtn').onclick  =()=>openModal(slides[idx].id);
document.getElementById('cancelBtn').onclick     =()=>modal.classList.remove('active');
document.getElementById('applyBtn').onclick      =()=>{ applyModal(current); modal.classList.remove('active'); };

let current = '';
function openModal(id){
  current = id;
  buildModal(id);
  modal.classList.add('active');
}

function buildModal(id){
  contentEl.innerHTML = '';
  if(id==='global'){
    titleEl.textContent = 'Global Settings';
    contentEl.innerHTML = `
      <label>Theme:
        <select id="opt-theme"><option value="dark">Dark</option><option value="light">Light</option></select>
      </label>
      <label>Accent Color:
        <input type="color" id="opt-accent" />
      </label>
      <label>Base Font Size:
        <input type="number" id="opt-fontSize" min="12" max="24"/> px
      </label>
    `;
    document.getElementById('opt-theme').value    = globalSettings.theme;
    document.getElementById('opt-accent').value   = globalSettings.accent;
    document.getElementById('opt-fontSize').value = parseInt(globalSettings.baseFontSize);
  }
  else if(id==='main'){
    titleEl.textContent = 'Main Slide Settings';
    contentEl.innerHTML = `
      <label>Clock Font:
        <select id="opt-clockFont">
          <option value="clock-style-1">Monospace</option>
          <option value="clock-style-2">Serif</option>
          <option value="clock-style-3">Bold Sans</option>
        </select>
      </label>
      <label><input type="checkbox" id="opt-24h"> Use 24‑hour format</label>
    `;
    document.getElementById('opt-clockFont').value = slideSettings.main.clockFont;
    document.getElementById('opt-24h').checked      = slideSettings.main.is24h;
  }
  else if(id==='calendar'){
    titleEl.textContent = 'Calendar Settings';
    contentEl.innerHTML = `
      <label><input type="checkbox" id="opt-mon"> Week starts Monday</label>
      <label><input type="checkbox" id="opt-weekend"> Highlight weekends</label>
    `;
    document.getElementById('opt-mon').checked     = slideSettings.calendar.startMonday;
    document.getElementById('opt-weekend').checked = slideSettings.calendar.highlightWeekends;
  }
  else if(id==='weather'){
    titleEl.textContent = 'Weather Settings';
    contentEl.innerHTML = `
      <label>Units:
        <select id="opt-units"><option value="C">°C</option><option value="F">°F</option></select>
      </label>
      <label><input type="checkbox" id="opt-wind"> Show wind</label>
      <label><input type="checkbox" id="opt-pressure"> Show pressure</label>
      <label><input type="checkbox" id="opt-precip"> Show precipitation</label>
      <label><input type="checkbox" id="opt-humidity"> Show humidity</label>
      <label>Forecast days:
        <input type="number" id="opt-days" min="1" max="7"/>
      </label>
    `;
    const w = slideSettings.weather;
    document.getElementById('opt-units').value     = w.units;
    document.getElementById('opt-wind').checked    = w.showWind;
    document.getElementById('opt-pressure').checked= w.showPressure;
    document.getElementById('opt-precip').checked  = w.showPrecip;
    document.getElementById('opt-humidity').checked= w.showHumidity;
    document.getElementById('opt-days').value      = w.forecastDays;
  }
}

function applyModal(id){
  if(id==='global'){
    globalSettings.theme        = document.getElementById('opt-theme').value;
    globalSettings.accent       = document.getElementById('opt-accent').value;
    globalSettings.baseFontSize = document.getElementById('opt-fontSize').value + 'px';
    saveGlobal(); applyGlobal();
  }
  else if(id==='main'){
    slideSettings.main.clockFont = document.getElementById('opt-clockFont').value;
    slideSettings.main.is24h     = document.getElementById('opt-24h').checked;
    document.getElementById('main-time').className = slideSettings.main.clockFont;
    saveSlides();
  }
  else if(id==='calendar'){
    slideSettings.calendar.startMonday      = document.getElementById('opt-mon').checked;
    slideSettings.calendar.highlightWeekends= document.getElementById('opt-weekend').checked;
    buildCalendar(); saveSlides();
  }
  else if(id==='weather'){
    const w = slideSettings.weather;
    w.units        = document.getElementById('opt-units').value;
    w.showWind     = document.getElementById('opt-wind').checked;
    w.showPressure = document.getElementById('opt-pressure').checked;
    w.showPrecip   = document.getElementById('opt-precip').checked;
    w.showHumidity = document.getElementById('opt-humidity').checked;
    w.forecastDays = parseInt(document.getElementById('opt-days').value) || 3;
    fetchWeather(); saveSlides();
  }
}

// CLOCK & DATE
function updateTime(){
  const now = new Date();
  const fmt = slideSettings.main.is24h ? { hour12:false } : {};
  document.getElementById('main-time').textContent = now.toLocaleTimeString([],{...fmt,hour:'2-digit',minute:'2-digit',second:'2-digit'});
  document.getElementById('main-date').textContent = now.toLocaleDateString([], { weekday:'long',year:'numeric',month:'long',day:'numeric' });
}
setInterval(updateTime,1000);
updateTime();

// CALENDAR
function buildCalendar(){
  const now=new Date(), y=now.getFullYear(), m=now.getMonth(), today=now.getDate();
  const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate();
  const headers = slideSettings.calendar.startMonday
    ? ['Mo','Tu','We','Th','Fr','Sa','Su']
    : ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const grid = document.getElementById('cal-grid');
  document.getElementById('cal-title').textContent = now.toLocaleDateString([], { month:'long',year:'numeric' });
  grid.innerHTML = '';
  headers.forEach(h=>{
    let c=document.createElement('div');
    c.textContent=h; c.className='cal-cell header';
    grid.appendChild(c);
  });
  const blank = slideSettings.calendar.startMonday? (first+6)%7 : first;
  for(let i=0;i<blank;i++){
    let c=document.createElement('div'); c.className='cal-cell'; grid.appendChild(c);
  }
  for(let d=1; d<=days; d++){
    let c=document.createElement('div'); c.textContent=d; c.className='cal-cell';
    if(d===today) c.classList.add('today');
    if(slideSettings.calendar.highlightWeekends){
      let wd=(blank+d-1)%7;
      if(wd===0||wd===6) c.classList.add('weekend');
    }
    c.onclick=()=>{
      grid.querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));
      if(!c.classList.contains('today')) c.classList.add('selected');
    };
    grid.appendChild(c);
  }
}
buildCalendar();

// WEATHER
async function fetchWeather(){
  try {
    const url = 'https://api.open-meteo.com/v1/forecast'
      +'?latitude=52.23&longitude=21.01&current_weather=true'
      +`&hourly=relativehumidity_2m,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res=await fetch(url), d=await res.json();
    const cw=d.current_weather;
    const idxTime = d.hourly.time.indexOf(cw.time);
    const humidity = d.hourly.relativehumidity_2m[idxTime];
    const precip   = d.hourly.precipitation[idxTime];
    const wset     = slideSettings.weather;

    // helper
    const makeCard = (label,val)=>`
      <div class="weather-card">
        <div><strong>${label}</strong></div>
        <div>${val}</div>
      </div>`;

    // MAIN SLIDE WEATHER
    const mainW = document.getElementById('main-weather');
    mainW.innerHTML = '';
    let temp = wset.units==='F'
      ? (cw.temperature*9/5+32).toFixed(1)+'°F'
      : cw.temperature+'°C';
    mainW.innerHTML += makeCard('Temp', temp);
    if(wset.showWind)     mainW.innerHTML += makeCard('Wind', cw.windspeed+' km/h');
    if(wset.showPressure) mainW.innerHTML += makeCard('Pressure', cw.pressure+' hPa');

    // WEATHER SLIDE CURRENT
    const cur = document.getElementById('weather-current');
    cur.innerHTML = mainW.innerHTML;
    if(wset.showHumidity) cur.innerHTML += makeCard('Humidity', humidity+'%');
    if(wset.showPrecip)   cur.innerHTML += makeCard('Precip', precip+' mm');

    // FORECAST
    const fc = document.getElementById('weather-forecast');
    fc.innerHTML = '';
    for(let i=0;i<wset.forecastDays && i<d.daily.time.length;i++){
      const date = new Date(d.daily.time[i]).toLocaleDateString([], {weekday:'short',day:'numeric'});
      const tmax = d.daily.temperature_2m_max[i], tmin = d.daily.temperature_2m_min[i];
      fc.innerHTML += `
        <div class="forecast-card">
          <div>${date}</div>
          <div>${tmax.toFixed(0)}/${tmin.toFixed(0)}°</div>
        </div>`;
    }
  } catch(e){ console.error('weather error', e); }
}
fetchWeather();
setInterval(fetchWeather, 600000);
