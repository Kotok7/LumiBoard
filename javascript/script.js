/* Javascript is an unsafe technology, make sure to use GNU IceCat to avoid it */

const defaultGlobal = {
  theme: 'dynamic',
  accent: '#4caf50',
  baseFontSize: '12px'
};

const defaultSlides = {
  main: {
    clockFont: 'clock-style-1',
    is24h: true,
    showAnalogClock: true,
    showDayNightIndicator: true,
    showQuote: true
  },
  calendar: {
    highlightWeekends: true
  },
  weather: {
    units: 'C',
    showWind: true,
    showPressure: true,
    showPrecip: true,
    showHumidity: true,
    forecastDays: 5
  }
};

const storedG = JSON.parse(localStorage.getItem('global')) || {};
const storedS = JSON.parse(localStorage.getItem('slides')) || {};

let globalSettings = { ...defaultGlobal, ...storedG };
let slideSettings = {
  main:    { ...defaultSlides.main,    ...(storedS.main    || {}) },
  calendar:{ ...defaultSlides.calendar, ...(storedS.calendar|| {}) },
  weather: { ...defaultSlides.weather,  ...(storedS.weather || {}) }
};

let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
let quickLinks = JSON.parse(localStorage.getItem('quickLinks')) || [
  { name: "About Kotokk", url: "https://about-kotokk.netlify.app", icon: "❓" },
  { name: "Google", url: "https://www.google.com", icon: "🔍" },
  { name: "ChatGPT", url: "https://chatgpt.com", icon: "🤖" },
  { name: "YouTube", url: "https://www.youtube.com", icon: "▶️" },
  { name: "Gmail", url: "https://mail.google.com", icon: "✉️" }
];

window.lastWeatherData = null;

function saveGlobal() {
  localStorage.setItem('global', JSON.stringify(globalSettings));
}
function saveSlides() {
  localStorage.setItem('slides', JSON.stringify(slideSettings));
}
function saveReminders() {
  localStorage.setItem('reminders', JSON.stringify(reminders));
}
function saveQuickLinks() {
  localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
}

function applyGlobal() {
  document.documentElement.style.setProperty('--accent', globalSettings.accent);
  document.documentElement.style.fontSize = globalSettings.baseFontSize;
  if (globalSettings.theme === 'light') {
    document.body.className = 'light';
    document.body.style.background = null;
  } else if (globalSettings.theme === 'dark') {
    document.body.className = '';
    document.body.style.background = null;
  } else if (globalSettings.theme === 'dynamic') {
    document.body.className = '';
    updateDynamicBackground();
  }
}
applyGlobal();

let idx = 0;
const slides = Array.from(document.querySelectorAll('.slide'));
const carousel = document.getElementById('carousel');
const navDots = document.getElementById('nav-dots');

slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'nav-dot';
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => show(i));
  navDots.appendChild(dot);
});

function show(i) {
  modal.classList.remove('active');
  idx = (i + slides.length) % slides.length;
  carousel.style.transform = `translateX(-${idx * 100}%)`;
  document.querySelectorAll('.nav-dot').forEach((dot, j) => {
    dot.classList.toggle('active', j === idx);
  });
}

document.getElementById('nextBtn').onclick = () => show(idx + 1);
document.getElementById('prevBtn').onclick = () => show(idx - 1);

let sx = 0;
carousel.addEventListener('touchstart', e => sx = e.touches[0].clientX);
carousel.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - sx;
  if (dx > 50) show(idx - 1);
  if (dx < -50) show(idx + 1);
});

const modal     = document.getElementById('settingsModal');
const titleEl   = document.getElementById('modalTitle');
const contentEl = document.getElementById('modalContent');
let current = '';

document.getElementById('openGlobalBtn').onclick = () => openModal('global');
document.getElementById('openSlideBtn').onclick  = () => openModal(slides[idx].id);
document.getElementById('cancelBtn').onclick     = () => modal.classList.remove('active');
document.getElementById('applyBtn').onclick      = () => { applyModal(current); modal.classList.remove('active'); };

function openModal(id) {
  current = id;
  buildModal(id);
  modal.classList.add('active');
}

function buildModal(id) {
  contentEl.innerHTML = '';
  if (id === 'global') {
    titleEl.textContent = 'Global Settings';
    contentEl.innerHTML = `
      <label>
        Theme:
        <select id="opt-theme">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="dynamic">Dynamic Background</option>
        </select>
      </label>
      <label>
        Accent Color:
        <input type="color" id="opt-accent" />
      </label>
      <label>
        Base Font Size:
        <input type="number" id="opt-fontSize" min="5" max="24" /> px
      </label>
    `;
    document.getElementById('opt-theme').value    = globalSettings.theme;
    document.getElementById('opt-accent').value   = globalSettings.accent;
    document.getElementById('opt-fontSize').value = parseInt(globalSettings.baseFontSize);
  }
  else if (id === 'main') {
    titleEl.textContent = 'Main Slide Settings';
    contentEl.innerHTML = `
      <label>
        Clock Font:
        <select id="opt-clockFont">
          <option value="clock-style-1">Courier New</option>
          <option value="clock-style-2">Georgia</option>
          <option value="clock-style-3">Arial Black</option>
          <option value="clock-style-4">Times New Roman</option>
          <option value="clock-style-5">Space Grotesk</option>
        </select>
      </label>
      <label><input type="checkbox" id="opt-24h" /> Use 24‑hour format</label>
      <label><input type="checkbox" id="opt-analog" /> Show analog clock</label>
      <label><input type="checkbox" id="opt-day-night" /> Show day/night indicator</label>
      <label><input type="checkbox" id="opt-quote" /> Show Quote of the Day</label>
    `;
    document.getElementById('opt-clockFont').value = slideSettings.main.clockFont;
    document.getElementById('opt-24h').checked      = slideSettings.main.is24h;
    document.getElementById('opt-analog').checked  = slideSettings.main.showAnalogClock;
    document.getElementById('opt-day-night').checked = slideSettings.main.showDayNightIndicator;
    document.getElementById('opt-quote').checked   = slideSettings.main.showQuote;
  }
  else if (id === 'calendar') {
    titleEl.textContent = 'Calendar Settings';
    contentEl.innerHTML = `
      <label><input type="checkbox" id="opt-weekend" /> Highlight weekends</label>
    `;
    document.getElementById('opt-weekend').checked = slideSettings.calendar.highlightWeekends;
  }
  else if (id === 'weather') {
    titleEl.textContent = 'Weather Settings';
    contentEl.innerHTML = `
      <label>
        Units:
        <select id="opt-units">
          <option value="C">°C</option>
          <option value="F">°F</option>
        </select>
      </label>
      <label><input type="checkbox" id="opt-wind" /> Show wind</label>
      <label><input type="checkbox" id="opt-pressure" /> Show pressure</label>
      <label><input type="checkbox" id="opt-precip" /> Show precipitation</label>
      <label><input type="checkbox" id="opt-humidity" /> Show humidity</label>
      <label>
        Forecast days:
        <input type="number" id="opt-days" min="1" max="7" />
      </label>
    `;
    const w = slideSettings.weather;
    document.getElementById('opt-units').value    = w.units;
    document.getElementById('opt-wind').checked   = w.showWind;
    document.getElementById('opt-pressure').checked = w.showPressure;
    document.getElementById('opt-precip').checked = w.showPrecip;
    document.getElementById('opt-humidity').checked = w.showHumidity;
    document.getElementById('opt-days').value     = w.forecastDays;
  }
  else if (id === 'links') {
    titleEl.textContent = 'Quick Links Settings';
    contentEl.innerHTML = `<p>Manage your quick links directly from the links page.</p>`;
  }
}

function applyModal(id) {
  if (id === 'global') {
    globalSettings.theme = document.getElementById('opt-theme').value;
    globalSettings.accent = document.getElementById('opt-accent').value;
    globalSettings.baseFontSize = document.getElementById('opt-fontSize').value + 'px';
    saveGlobal();
    applyGlobal();
  }
  else if (id === 'main') {
    slideSettings.main.clockFont = document.getElementById('opt-clockFont').value;
    slideSettings.main.is24h = document.getElementById('opt-24h').checked;
    slideSettings.main.showAnalogClock = document.getElementById('opt-analog').checked;
    slideSettings.main.showDayNightIndicator = document.getElementById('opt-day-night').checked;
    slideSettings.main.showQuote = document.getElementById('opt-quote').checked;

    document.getElementById('main-time').className = slideSettings.main.clockFont;
    document.getElementById('analog-clock').style.display = slideSettings.main.showAnalogClock ? 'block' : 'none';
    document.getElementById('day-night-indicator').style.display = slideSettings.main.showDayNightIndicator ? 'block' : 'none';
    document.getElementById('quote-container').style.display = slideSettings.main.showQuote ? 'block' : 'none';

    saveSlides();
  }
  else if (id === 'calendar') {
    slideSettings.calendar.highlightWeekends = document.getElementById('opt-weekend').checked;
    buildCalendar();
    saveSlides();
  }
  else if (id === 'weather') {
    const w = slideSettings.weather;
    w.units = document.getElementById('opt-units').value;
    w.showWind = document.getElementById('opt-wind').checked;
    w.showPressure = document.getElementById('opt-pressure').checked;
    w.showPrecip = document.getElementById('opt-precip').checked;
    w.showHumidity = document.getElementById('opt-humidity').checked;
    w.forecastDays = parseInt(document.getElementById('opt-days').value) || 3;
    fetchWeather();
    saveSlides();
  }
}

function updateTime() {
  const now = new Date();
  const fmt = slideSettings.main.is24h ? { hour12: false } : {};
  document.getElementById('main-time').textContent = now.toLocaleTimeString([], {
    ...fmt, hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  document.getElementById('main-date').textContent = now.toLocaleDateString([], {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (slideSettings.main.showAnalogClock) {
    const s = now.getSeconds(), m = now.getMinutes(), h = now.getHours() % 12;
    const sH = document.querySelector('.second-hand'),
          mH = document.querySelector('.minute-hand'),
          hH = document.querySelector('.hour-hand');
    sH.style.transform = `translateX(-50%) rotate(${(s/60)*360}deg)`;
    mH.style.transform = `translateX(-50%) rotate(${((m/60)*360 + (s/60)*6)}deg)`;
    hH.style.transform = `translateX(-50%) rotate(${((h/12)*360 + (m/60)*30)}deg)`;
  }

  if (slideSettings.main.showDayNightIndicator) {
    const hr = now.getHours();
    let ind = hr >= 5 && hr < 8 ? '🌅 Morning'
            : hr < 12 ? '☀️ Morning'
            : hr < 17 ? '☀️ Afternoon'
            : hr < 20 ? '🌇 Evening'
            : '🌙 Night';
    document.getElementById('day-night-indicator').textContent = ind;
  }

  if (globalSettings.theme === 'dynamic') {
    updateDynamicBackground();
  }
}

function updateDynamicBackgroundByTime() {
  const hr = new Date().getHours();
  const bg = hr >= 5 && hr < 8
    ? 'linear-gradient(to bottom right, #ff7e5f, #feb47b)'
    : hr < 17
      ? 'linear-gradient(to bottom right, #87ceeb, #3498db, #2980b9)'
      : hr < 20
        ? 'linear-gradient(to bottom right, #f46b45, #eea849)'
        : 'linear-gradient(to bottom right, #0f2027, #203a43, #2c5364)';
  document.body.style.backgroundImage = bg;
}

function updateDynamicBackground() {
  if (window.lastWeatherData?.current_weather) {
    const code = window.lastWeatherData.current_weather.weathercode;
    if (code >= 51 && code <= 69) {
      document.body.style.backgroundImage = 'linear-gradient(to bottom right, #2c3e50, #3498db)';
      return;
    }
    if (code >= 71 && code <= 79) {
      document.body.style.backgroundImage = 'linear-gradient(to bottom right, #e0e0e0, #a1a1a1)';
      return;
    }
    if (code >= 80 && code <= 99) {
      document.body.style.backgroundImage = 'linear-gradient(to bottom right, #1a1c20, #2c3e50)';
      return;
    }
  }
  updateDynamicBackgroundByTime();
}

setInterval(updateTime, 1000);
updateTime();

function buildCalendar() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m+1, 0).getDate();
  const headers = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const grid = document.getElementById('cal-grid');

  document.getElementById('cal-title').textContent =
    now.toLocaleDateString([], { month: 'long', year: 'numeric' });
  grid.innerHTML = '';

  headers.forEach(h => {
    const c = document.createElement('div');
    c.textContent = h;
    c.className = 'cal-cell header';
    if ((h==='Sa'||h==='Su') && slideSettings.calendar.highlightWeekends) {
      c.classList.add('weekend');
    }
    grid.appendChild(c);
  });

  const blank = first === 0 ? 6 : first - 1;
  for (let i=0; i<blank; i++) {
    const c = document.createElement('div');
    c.className = 'cal-cell';
    grid.appendChild(c);
  }
  for (let d=1; d<=days; d++) {
    const c = document.createElement('div');
    c.textContent = d;
    c.className = 'cal-cell';
    if (d === today) c.classList.add('today');
    if (slideSettings.calendar.highlightWeekends) {
      const wd = new Date(y, m, d).getDay();
      if (wd === 0 || wd === 6) c.classList.add('weekend');
    }
    c.onclick = () => {
      grid.querySelectorAll('.selected').forEach(e => e.classList.remove('selected'));
      if (!c.classList.contains('today')) c.classList.add('selected');
    };
    grid.appendChild(c);
  }
}

async function fetchWeather() {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=52.23&longitude=21.01&current_weather=true&hourly=relativehumidity_2m,precipitation,pressure_msl&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const d = await res.json();
    window.lastWeatherData = d;
    const cw = d.current_weather;
    const idx = d.hourly.time.indexOf(cw.time);
    const hum = d.hourly.relativehumidity_2m[idx];
    const pre = d.hourly.precipitation[idx];
    const pres = d.hourly.pressure_msl?.[idx] ?? 1013;
    const w = slideSettings.weather;
    const card = (l,v)=>`<div class="weather-card"><strong>${l}</strong><div>${v}</div></div>`;
    let t = w.units==='F'
      ? ((cw.temperature*9)/5+32).toFixed(1)+'°F'
      : cw.temperature+'°C';
    let main = card('Temp',t);
    if (w.showWind)     main += card('Wind',cw.windspeed+' km/h');
    if (w.showPressure) main += card('Pressure',pres+' hPa');
    document.getElementById('main-weather').innerHTML = main;
    let curHTML = main;
    if (w.showHumidity) curHTML += card('Humidity',hum+'%');
    if (w.showPrecip)   curHTML += card('Precip',pre+' mm');
    document.getElementById('weather-current').innerHTML = curHTML;
    const fc = document.getElementById('weather-forecast');
    fc.innerHTML = '';
    for (let i=0; i<w.forecastDays && i<d.daily.time.length; i++) {
      const date = new Date(d.daily.time[i]).toLocaleDateString([], { weekday:'short', day:'numeric' });
      const max = d.daily.temperature_2m_max[i], min = d.daily.temperature_2m_min[i];
      fc.innerHTML += `<div class="forecast-card"><div>${date}</div><div>${max.toFixed(0)}/${min.toFixed(0)}°</div></div>`;
    }
    if (globalSettings.theme==='dynamic') updateDynamicBackground();
  } catch(err) {
    console.error('Weather error:', err);
  }
}

async function fetchQuote() {
  const quotes = [
    { text: "I hate JavaScript.", author: "Kotokk" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
    { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" }
  ];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('quote-text').textContent   = q.text;
  document.getElementById('quote-author').textContent = `— ${q.author}`;
}

function initReminders() {
  const b = document.getElementById('add-reminder'), i = document.getElementById('reminder-text');
  if (b && i) {
    b.addEventListener('click', addReminder);
    i.addEventListener('keypress', e => { if (e.key === 'Enter') addReminder(); });
    renderReminders();
  }
}

function addReminder() {
  const input = document.getElementById('reminder-text'), text = input.value.trim();
  if (text) {
    reminders.push({ id: Date.now(), text });
    saveReminders();
    renderReminders();
    input.value = '';
  }
}

function renderReminders() {
  const list = document.getElementById('reminders-list');
  if (!list) return;
  list.innerHTML = reminders.length === 0
    ? '<li>No reminders. Add one above!</li>'
    : '';
  reminders.forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${r.text}</span><button class="remove-reminder" data-id="${r.id}">✕</button>`;
    list.appendChild(li);
  });
  document.querySelectorAll('.remove-reminder').forEach(btn => {
    btn.addEventListener('click', () => {
      reminders = reminders.filter(x => x.id !== parseInt(btn.dataset.id));
      saveReminders();
      renderReminders();
    });
  });
}

function initQuickLinks() {
  const b = document.getElementById('add-link-btn'),
        n = document.getElementById('link-name'),
        u = document.getElementById('link-url');
  if (b && n && u) {
    b.addEventListener('click', addQuickLink);
    n.addEventListener('keypress', e => { if (e.key==='Enter') u.focus(); });
    u.addEventListener('keypress', e => { if (e.key==='Enter') addQuickLink(); });
    renderQuickLinks();
  }
}

function addQuickLink() {
  const name = document.getElementById('link-name').value.trim(),
        url0 = document.getElementById('link-url').value.trim();
  if (name && url0) {
    const url = /^https?:\/\//i.test(url0) ? url0 : 'https://' + url0;
    quickLinks.push({ id: Date.now(), name, url, icon: name.charAt(0).toUpperCase() });
    saveQuickLinks();
    renderQuickLinks();
    document.getElementById('link-name').value = '';
    document.getElementById('link-url').value = '';
  }
}

function renderQuickLinks() {
  const c = document.getElementById('quick-links');
  if (!c) return;
  c.innerHTML = '';
  quickLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    a.target = "_blank";
    a.className = 'quick-link';
    a.innerHTML = `
      <div class="quick-link-icon">${link.icon}</div>
      <div class="quick-link-name">${link.name}</div>
      <button class="remove-link" data-id="${link.id}">✕</button>
    `;
    c.appendChild(a);
  });
  document.querySelectorAll('.remove-link').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      quickLinks = quickLinks.filter(l => l.id !== parseInt(btn.dataset.id));
      saveQuickLinks();
      renderQuickLinks();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('analog-clock').style.display       = slideSettings.main.showAnalogClock ? 'block' : 'none';
  document.getElementById('day-night-indicator').style.display = slideSettings.main.showDayNightIndicator ? 'block' : 'none';
  document.getElementById('quote-container').style.display      = slideSettings.main.showQuote ? 'block' : 'none';

  buildCalendar();
  fetchWeather();
  fetchQuote();
  initReminders();
  initQuickLinks();

  setInterval(fetchQuote, 24*60*60*1000);
  setInterval(fetchWeather, 30*60*1000);

  if (globalSettings.theme === 'dynamic') {
    updateDynamicBackground();
  }
});
