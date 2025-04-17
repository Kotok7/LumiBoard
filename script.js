    let index = 0;
    const carousel = document.getElementById('carousel');
    const slides = document.querySelectorAll('.slide');

    function showSlide(idx) {
      index = idx % slides.length;
      if (index < 0) index = slides.length - 1;
      carousel.style.transform = `translateX(-${index * 100}%)`;
    }
    function nextSlide() { showSlide(index + 1); }
    function prevSlide() { showSlide(index - 1); }

    function updateTime() {
      const now = new Date();
      document.getElementById('main-time').textContent = now.toLocaleTimeString();
      document.getElementById('main-date').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    setInterval(updateTime, 1000);
    updateTime();

    function openModal() {
      document.getElementById('settingsModal').classList.add('active');
    }
    function applySettings() {
      const style = document.getElementById('clock-style').value;
      const clock = document.getElementById('main-time');
      clock.className = style;
      document.getElementById('settingsModal').classList.remove('active');
    }

    async function fetchWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=52.23&longitude=21.01&current=temperature_2m,weathercode,windspeed_10m,surface_pressure&timezone=Europe%2FWarsaw');
        const data = await res.json();
        const { weathercode, temperature_2m, windspeed_10m, surface_pressure } = data.current;
        const icon = getIcon(weathercode);

        document.getElementById('main-icon').src = icon;
        document.getElementById('main-icon').alt = weathercode;
        document.getElementById('weather-temp').textContent = `${temperature_2m}°C`;
        document.getElementById('weather-wind').textContent = `Wind: ${windspeed_10m} km/h`;
        document.getElementById('weather-pressure').textContent = `Pressure: ${surface_pressure} hPa`;

        document.getElementById('weather-content').innerHTML = `
          <img src="${icon}" />
          <div>${temperature_2m}°C</div>
          <div>Wind: ${windspeed_10m} km/h</div>
          <div>Pressure: ${surface_pressure} hPa</div>`;
      } catch (e) {
        document.getElementById('main-weather').innerHTML = 'Error loading weather';
        document.getElementById('weather-content').innerHTML = 'Error loading weather';
      }
    }
    function getIcon(code) {
      if (code === 0) return 'https://openweathermap.org/img/wn/01d.png';
      if (code < 4) return 'https://openweathermap.org/img/wn/02d.png';
      if (code < 50) return 'https://openweathermap.org/img/wn/03d.png';
      return 'https://openweathermap.org/img/wn/04d.png';
    }
    fetchWeather();
    setInterval(fetchWeather, 600000);

    function buildCalendar() {
      const now = new Date();
      const today = now.getDate();
      const month = now.getMonth();
      const year = now.getFullYear();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const headers = ['Su','Mo','Tu','We','Th','Fr','Sa'];

      document.getElementById('cal-title').textContent = now.toLocaleString('en-EN', { month: 'long', year: 'numeric' });
      const grid = document.getElementById('cal-grid');
      grid.innerHTML = '';

      headers.forEach(day => {
        const cell = document.createElement('div');
        cell.textContent = day;
        cell.classList.add('cal-cell', 'header');
        grid.appendChild(cell);
      });

      for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cal-cell');
        grid.appendChild(cell);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.textContent = d;
        cell.classList.add('cal-cell');
        if (d === today) cell.classList.add('today');
        cell.addEventListener('click', () => {
          document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
          if (!cell.classList.contains('today')) cell.classList.add('selected');
        });
        grid.appendChild(cell);
      }
    }
    buildCalendar();
