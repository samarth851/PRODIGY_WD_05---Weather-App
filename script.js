const apiKey = "f674ea3d1050246afb061ddc3ed47260"; 

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const errorMsg = document.getElementById("errorMsg");
const bgVideo = document.getElementById("bgVideo");

const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const cityEl = document.getElementById("cityName");
const dateEl = document.getElementById("date");
const iconEl = document.getElementById("weatherIcon");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const visibilityEl = document.getElementById("visibility");

function setDate() {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function cleanName(name) {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function changePageBackground(isDay) {
    if (isDay) {
        document.body.style.backgroundColor = "#1076d03f"; 
    } else {
        document.body.style.backgroundColor = "#030303ea";
    }
}

function changeTheme(condition, iconCode) {
    const body = document.body;
    body.classList.remove('weather-day', 'weather-night'); 

    if (iconCode.includes('n')) {
        body.classList.add('weather-night'); 
    } else {
        body.classList.add('weather-day');
    }
}

function changeBackgroundVideo(data) {
    const weather = data.weather[0].main.toLowerCase();
    const currentTime = data.dt;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    const isDay = currentTime > sunrise && currentTime < sunset;

    changePageBackground(isDay);

    let videoSrc = "";

    if (weather.includes("rain") || weather.includes("drizzle") || weather.includes("thunder")) {
        videoSrc = "videos/Rainy sky.mp4";
    } else if (weather.includes("cloud") || weather.includes("smoke") || weather.includes("haze") || weather.includes("mist") || weather.includes("fog")) {
        if (isDay) videoSrc = "videos/cloudy sky.mp4";
        else videoSrc = "videos/night sky cloudy.mp4";
    } else if (weather.includes("clear")) {
        if (isDay) videoSrc = "videos/clear sunny sky.mp4";
        else videoSrc = "videos/clear night sky.mp4";
    } else {
        if (isDay) videoSrc = "videos/cloudy sky.mp4";
        else videoSrc = "videos/night sky cloudy.mp4";
    }

    const currentSrc = bgVideo.getAttribute("src");
    if (decodeURIComponent(currentSrc).includes(videoSrc) === false) {
        bgVideo.src = videoSrc;
        bgVideo.load();
        bgVideo.play();
    }
}

async function fetchWeather(url) {
    errorMsg.textContent = "";
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Location not found! Try another city.");
        const data = await res.json();
        updateUI(data);
    } catch (err) {
        errorMsg.textContent = err.message;
    }
}

function updateUI(data) {
    const simpleCityName = cleanName(data.name);
    cityEl.textContent = `${simpleCityName}, ${data.sys.country}`;
    tempEl.textContent = `${Math.round(data.main.temp)}°`;

    let displayWeather = data.weather[0].main;
    if (displayWeather === "Smoke" || displayWeather === "Haze" || displayWeather === "Mist") {
        displayWeather = "Clouds";
    }
    conditionEl.textContent = displayWeather;
    
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${data.wind.speed} km/h`;
    visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    const iconCode = data.weather[0].icon; 
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`; 
    
    setDate();
    changeTheme(displayWeather, iconCode);
    changeBackgroundVideo(data);
}

searchBtn.addEventListener("click", () => {
    if(cityInput.value.trim()) {
        fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput.value}&units=metric&appid=${apiKey}`);
    }
});

locBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);
        }, () => {
            errorMsg.textContent = "Location permission denied";
        });
    }
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchBtn.click();
});

fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=Pune&units=metric&appid=${apiKey}`);