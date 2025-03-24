function getWeatherIcon(temperature) {
    if (temperature < 0) return "❄️"; // Freezing
    if (temperature < 10) return "🥶"; // Cold
    if (temperature < 20) return "☁️"; // Cool
    if (temperature < 30) return "☀️"; // Warm
    return "🔥"; // Hot
}

//to get day name
function getDayName(dateString) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateString);
    return days[date.getDay()];
}

//dom elements
const citySearch = document.getElementById('city-search');
const suggestionsList = document.getElementById('suggestions-list');
const currentLocation = document.getElementById('current-location');
const loadingIndicator = document.getElementById('loading');
const errorIndicator = document.getElementById('error');
const weatherInfo = document.getElementById('weather-info');
const temperatureIcon = document.getElementById('temperature-icon');
const temperatureText = document.getElementById('temperature-text');
const windDetail = document.getElementById('wind-detail');
const forecastContainer = document.getElementById('forecast-container');

//State
let currentLocationData = { 
    lat: 40.7128, 
    lon: -74.0060, 
    name: "New York City" 
};

// Location Suggestions
citySearch.addEventListener('input', async () => {
    const query = citySearch.value;
    suggestionsList.innerHTML = '';

    if (query.length < 2) return;

    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
        );

        if (!response.ok) {
            throw new Error("Location search failed");
        }

        const data = await response.json();
        data.results?.forEach(location => {
            const li = document.createElement('li');
            li.textContent = `📍${location.name}, ${location.country}`;
            li.addEventListener('click', () => selectLocation(location));
            suggestionsList.appendChild(li);
        });
    } catch (err) {
        console.error(err);
    }
});

// Select Location
function selectLocation(location) {
    currentLocationData = {
        lat: location.latitude,
        lon: location.longitude,
        name: `${location.name}, ${location.country}`
    };
    citySearch.value = '';
    suggestionsList.innerHTML = '';
    fetchWeather();
}

// Fetch Weather
async function fetchWeather() {
    loadingIndicator.style.display = 'block';
    errorIndicator.style.display = 'none';
    weatherInfo.style.display = 'none';

    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${currentLocationData.lat}&longitude=${currentLocationData.lon}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max&current_weather=true&timezone=auto&forecast_days=5`
        );

        if (!response.ok) {
            throw new Error("Weather data could not be fetched");
        }

        const data = await response.json();
        updateUI(data);
    } catch (err) {
        errorIndicator.textContent = `❌ ${err.message}`;
        errorIndicator.style.display = 'block';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Update UI
function updateUI(weatherData) {
    // Update current location
    currentLocation.innerHTML = `📍 ${currentLocationData.name}`;

    // Current weather
    const currentWeather = weatherData.current_weather;
    temperatureIcon.textContent = getWeatherIcon(currentWeather.temperature);
    temperatureText.textContent = `${currentWeather.temperature}°C`;
    windDetail.textContent = `💨 Wind: ${currentWeather.windspeed} km/h`;

    // 5-day forecast
    forecastContainer.innerHTML = '';
    weatherData.daily.time.forEach((date, index) => {
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('daily-item');
        forecastItem.innerHTML = `
            <span class="day-label">${getDayName(date)}</span>
            <div class="daily-item-details">
                <span class="day-temp">
                    ${getWeatherIcon(weatherData.daily.temperature_2m_max[index])}
                    <span class="temp-text">
                        ${weatherData.daily.temperature_2m_max[index]}°C / ${weatherData.daily.temperature_2m_min[index]}°C
                    </span>
                </span>
                <span class="wind-speed">
                    💨 ${weatherData.daily.windspeed_10m_max[index]} km/h
                </span>
            </div>
        `;
        forecastContainer.appendChild(forecastItem);
    });

    //Show weather info
    weatherInfo.style.display = 'flex';
}

// Initial weather fetch
fetchWeather();