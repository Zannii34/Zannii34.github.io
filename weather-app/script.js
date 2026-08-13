// script.js

const apiKey = "24cb847f061f495ab6a2f3f1fefd955a";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");

const hourlyContainer =
document.getElementById("hourlyForecast");

// Search Weather By Area/Suburb
async function getWeather(area){

  try{

    const apiUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${area}&appid=${apiKey}&units=metric`;

    const response = await fetch(apiUrl);

    const data = await response.json();

    if(data.cod === "404"){

      alert("Area not found");
      return;

    }

    updateUI(data);

    getHourlyForecast(
      data.coord.lat,
      data.coord.lon
    );

    speakWeather(data);

  }catch(error){

    console.log(error);
    alert("Something went wrong");

  }

}

// Detect Current GPS Area/Suburb
async function getWeatherByCoords(lat, lon){

  try{

    // Weather Data
    const weatherUrl =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const weatherResponse =
    await fetch(weatherUrl);

    const weatherData =
    await weatherResponse.json();

    // Reverse Geocoding
    const geoUrl =
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

    const geoResponse =
    await fetch(geoUrl);

    const geoData =
    await geoResponse.json();

    // Detect suburb
    let suburb = weatherData.name;

    if(geoData.length > 0){

      suburb =
      geoData[0].name ||
      weatherData.name;

    }

    weatherData.name = suburb;

    updateUI(weatherData);

    // Hourly Forecast
    getHourlyForecast(lat, lon);

    // Voice Narration
    speakWeather(weatherData);

  }catch(error){

    console.log(error);

  }

}

// Hourly Forecast
async function getHourlyForecast(lat, lon){

  try{

    const apiUrl =
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await fetch(apiUrl);

    const data = await response.json();

    hourlyContainer.innerHTML = "";

    data.list.slice(0, 8).forEach(item => {

      const time =
      item.dt_txt.split(" ")[1].slice(0,5);

      const temp =
      Math.round(item.main.temp);

      hourlyContainer.innerHTML += `

        <div class="hour-box">

          <p>${time}</p>

          <h3>${temp}°C</h3>

        </div>

      `;

    });

  }catch(error){

    console.log(error);

  }

}

// Update UI
function updateUI(data){

  cityName.innerText = data.name;

  temperature.innerText =
  Math.round(data.main.temp);

  description.innerText =
  data.weather[0].description;

  humidity.innerText =
  data.main.humidity + "%";

  wind.innerText =
  data.wind.speed + " km/h";

  const iconCode =
  data.weather[0].icon;

  weatherIcon.src =
  `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

}

// Voice Weather Narrator
function speakWeather(data){

  const speech =
  new SpeechSynthesisUtterance(

    `The weather in ${data.name}
    is currently
    ${Math.round(data.main.temp)}
    degrees Celsius with
    ${data.weather[0].description}.
    Wind speed is
    ${data.wind.speed}
    kilometers per hour.`

  );

  speech.lang = "en-US";

  window.speechSynthesis.cancel();

  window.speechSynthesis.speak(speech);

}

// Detect User Location Automatically
function detectLocation(){

  if(navigator.geolocation){

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const lat =
        position.coords.latitude;

        const lon =
        position.coords.longitude;

        await getWeatherByCoords(
          lat,
          lon
        );

      },

      (error) => {

        console.log(error);

        getWeather("Johannesburg");

      },

      {
        enableHighAccuracy:true,
        timeout:10000,
        maximumAge:0
      }

    );

  }else{

    alert("Geolocation not supported");

    getWeather("Johannesburg");

  }

}

// Search Button
searchBtn.addEventListener("click", () => {

  const area =
  cityInput.value.trim();

  if(area !== ""){

    getWeather(area);

  }

});

// Enter Key Search
cityInput.addEventListener("keypress", (e) => {

  if(e.key === "Enter"){

    const area =
    cityInput.value.trim();

    if(area !== ""){

      getWeather(area);

    }

  }

});

// Start App Automatically
detectLocation();
