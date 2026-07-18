import axios from 'axios';

// Get API Key from environment variables
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// Check if the API key is valid (not default placeholder and not empty)
const isApiKeyValid = API_KEY && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';

/**
 * Standardize weather condition codes to simple categories
 */
const mapWeatherCondition = (id) => {
  if (id >= 200 && id < 300) return { main: 'Thunderstorm', description: 'Thunderstorm with Rain', icon: 'thunderstorm' };
  if (id >= 300 && id < 400) return { main: 'Drizzle', description: 'Light Drizzle', icon: 'drizzle' };
  if (id >= 500 && id < 600) return { main: 'Rain', description: 'Moderate Rain', icon: 'rain' };
  if (id >= 600 && id < 700) return { main: 'Snow', description: 'Snow Shower', icon: 'snow' };
  if (id >= 700 && id < 800) return { main: 'Atmosphere', description: 'Mist and Haze', icon: 'atmosphere' };
  if (id === 800) return { main: 'Clear', description: 'Clear Sky', icon: 'clear' };
  return { main: 'Clouds', description: 'Partly Cloudy', icon: 'clouds' };
};

/**
 * Get clothing recommendation based on weather conditions
 */
export const getClothingRecommendation = (tempCelsius, condition) => {
  const cond = condition.toLowerCase();
  
  if (tempCelsius >= 32) {
    return {
      clothing: "Light linen clothing, shorts, sunglasses, and a wide-brimmed hat.",
      activity: "Stay indoors in air conditioning or visit a pool. Limit outdoor exercise.",
      necessities: "Sunscreen SPF 50+, plenty of cold water, and electrolyte packets.",
      tip: "Dangerously hot. Seek shade and stay hydrated!"
    };
  } else if (tempCelsius >= 24) {
    return {
      clothing: "T-shirt, shorts, skirt, or light trousers. Breathable fabrics are best.",
      activity: "Perfect for outdoor walks, dining, or park activities.",
      necessities: "Sunglasses, sunscreen, and a reusable water bottle.",
      tip: "Warm and pleasant day! Enjoy the outdoors."
    };
  } else if (tempCelsius >= 15) {
    return {
      clothing: "Light sweater, long pants, or layering a t-shirt with a light denim jacket.",
      activity: "Excellent weather for running, cycling, or sightseeing.",
      necessities: "A light jacket to carry in case it gets breezy.",
      tip: "Mild and comfortable. Great for general travel!"
    };
  } else if (tempCelsius >= 6) {
    return {
      clothing: "Warm sweater, windbreaker or trench coat, and comfortable trousers.",
      activity: "Museum visits, light walks, or indoor dining.",
      necessities: "Lip balm and a thermos with warm drinks.",
      tip: "Cool breeze. Keep yourself layered."
    };
  } else {
    // Freezing / Very Cold
    return {
      clothing: "Heavy insulated winter coat, thermal inner wear, scarf, gloves, and a beanie.",
      activity: "Ice skating, cozying up indoors with a book, or visiting cafes.",
      necessities: "Thermal socks, moisturiser, and pocket hand warmers.",
      tip: "Freezing weather. Keep ears and hands covered!"
    };
  }
};

/**
 * Generate highly realistic mock data for fallback
 */
const generateMockWeatherData = (city, units = 'metric') => {
  const normCity = city.trim().toLowerCase();
  const isFahrenheit = units === 'imperial';
  
  // Base profiles for famous cities to make them feel authentic
  const cityProfiles = {
    london: { baseTemp: 14, condition: 'Rain', description: 'Light rain and drizzle', humidity: 82, wind: 18 },
    dubai: { baseTemp: 40, condition: 'Clear', description: 'Sunny and hot', humidity: 25, wind: 12 },
    tokyo: { baseTemp: 21, condition: 'Clouds', description: 'Scattered clouds', humidity: 60, wind: 10 },
    newyork: { baseTemp: 18, condition: 'Clouds', description: 'Overcast clouds', humidity: 70, wind: 15 },
    paris: { baseTemp: 15, condition: 'Clouds', description: 'Broken clouds', humidity: 75, wind: 14 },
    sydney: { baseTemp: 19, condition: 'Clear', description: 'Sunny intervals', humidity: 55, wind: 22 },
    reykjavik: { baseTemp: 1, condition: 'Snow', description: 'Light snow showers', humidity: 88, wind: 28 },
    mumbai: { baseTemp: 31, condition: 'Thunderstorm', description: 'Heavy monsoon storm', humidity: 90, wind: 24 }
  };
  
  // Clean up input for profiling
  const profileKey = normCity.replace(/\s+/g, '');
  const profile = cityProfiles[profileKey] || {
    // Generate pseudorandom values based on city name length/hash
    baseTemp: 15 + (city.length % 15),
    condition: city.length % 3 === 0 ? 'Clear' : city.length % 3 === 1 ? 'Clouds' : 'Rain',
    description: city.length % 3 === 0 ? 'Sunny sky' : city.length % 3 === 1 ? 'Scattered clouds' : 'Intermittent showers',
    humidity: 50 + (city.length * 3) % 40,
    wind: 8 + (city.length * 2) % 20
  };

  // Convert temp based on units
  const toUnitTemp = (celsius) => {
    return isFahrenheit ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
  };

  const currentTemp = toUnitTemp(profile.baseTemp);
  const tempMin = currentTemp - 4 - (city.length % 3);
  const tempMax = currentTemp + 5 + (city.length % 4);
  const feelsLike = currentTemp + (profile.condition === 'Clear' ? 1 : -2);

  // Generate 24 hour forecast
  const hourly = [];
  const startHour = new Date().getHours();
  for (let i = 0; i < 24; i++) {
    const hour = (startHour + i) % 24;
    // Temperature curve: cooler at night, warmer in afternoon
    const hourFactor = Math.sin(((hour - 6) / 24) * 2 * Math.PI); // ranges from -1 to 1
    const hourTemp = currentTemp + Math.round(hourFactor * 4);
    
    // Add variations to conditions
    let hrCond = profile.condition;
    if (i > 6 && i < 15 && profile.condition === 'Rain') hrCond = 'Clouds'; // rain cleared up
    if (i > 18 && profile.condition === 'Clear') hrCond = 'Clear';
    
    hourly.push({
      time: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`,
      temp: hourTemp,
      condition: hrCond,
      rainChance: hrCond === 'Rain' || hrCond === 'Thunderstorm' ? Math.min(95, 40 + i * 2) : hrCond === 'Clouds' ? 20 : 0
    });
  }

  // Generate 7 day forecast
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const daily = [];
  
  for (let i = 0; i < 7; i++) {
    const dayName = days[(todayIndex + i) % 7];
    const tempVar = Math.sin(i) * 2;
    const dMin = tempMin + Math.round(tempVar);
    const dMax = tempMax + Math.round(tempVar);
    
    let dCond = profile.condition;
    if (i === 2 || i === 5) dCond = 'Clear';
    if (i === 4 && profile.condition === 'Rain') dCond = 'Thunderstorm';
    if (i === 1) dCond = 'Clouds';

    daily.push({
      day: i === 0 ? 'Today' : dayName,
      tempMin: dMin,
      tempMax: dMax,
      condition: dCond,
      humidity: profile.humidity + Math.round(tempVar * 3)
    });
  }

  // Air Quality
  const aqiMap = {
    'Clear': 1,
    'Clouds': 2,
    'Rain': 2,
    'Thunderstorm': 3,
    'Snow': 1,
    'Atmosphere': 4
  };
  const aqiVal = aqiMap[profile.condition] || 2;
  const aqiInfo = [
    { label: 'Good', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
    { label: 'Moderate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', desc: 'Air quality is acceptable. However, there may be risk for some people.' },
    { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', desc: 'Members of sensitive groups may experience health effects.' },
    { label: 'Unhealthy', color: 'text-red-400 bg-red-500/10 border-red-500/20', desc: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.' },
    { label: 'Very Unhealthy', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', desc: 'Health alert: The risk of health effects is increased for everyone.' }
  ][aqiVal - 1];

  // Alerts
  const alerts = [];
  if (profile.baseTemp >= 38) {
    alerts.push({
      event: 'Extreme Heat Warning',
      sender: 'National Meteorological Service',
      description: `An extreme heatwave is affecting ${city}. Outdoor activities should be restricted between 10:00 AM and 4:00 PM. Drink plenty of fluids and monitor vulnerable family members.`,
      severity: 'Extreme'
    });
  } else if (profile.condition === 'Thunderstorm') {
    alerts.push({
      event: 'Severe Thunderstorm Watch',
      sender: 'Severe Weather Warning Center',
      description: 'Atmospheric conditions are favorable for the development of severe thunderstorms capable of producing damaging winds, large hail, and torrential rainfall.',
      severity: 'Severe'
    });
  } else if (profile.baseTemp <= 0) {
    alerts.push({
      event: 'Freeze Warning',
      sender: 'Arctic Weather Monitoring Team',
      description: 'Sub-freezing temperatures are expected. Take steps now to protect tender plants, keep pets indoors, and prevent outdoor water pipes from freezing.',
      severity: 'Moderate'
    });
  }

  const capitalizedCity = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const cityCoordinates = {
    london: { lat: 51.5074, lon: -0.1278 },
    dubai: { lat: 25.2048, lon: 55.2708 },
    tokyo: { lat: 35.6762, lon: 139.6503 },
    newyork: { lat: 40.7128, lon: -74.0060 },
    paris: { lat: 48.8566, lon: 2.3522 },
    sydney: { lat: -33.8688, lon: 151.2093 },
    reykjavik: { lat: 64.1466, lon: -21.9426 },
    mumbai: { lat: 19.0760, lon: 72.8777 }
  };
  
  const coords = cityCoordinates[profileKey] || {
    lat: 10 + (city.length * 7) % 50,
    lon: -60 + (city.length * 13) % 180
  };

  return {
    isMock: true,
    city: capitalizedCity,
    country: profileKey === 'london' ? 'GB' : profileKey === 'dubai' ? 'AE' : profileKey === 'tokyo' ? 'JP' : profileKey === 'newyork' ? 'US' : profileKey === 'paris' ? 'FR' : profileKey === 'sydney' ? 'AU' : profileKey === 'reykjavik' ? 'IS' : profileKey === 'mumbai' ? 'IN' : 'LOC',
    coordinates: coords,
    current: {
      temp: currentTemp,
      feelsLike: feelsLike,
      tempMin: tempMin,
      tempMax: tempMax,
      humidity: profile.humidity,
      pressure: 1013 + (city.length % 5),
      windSpeed: profile.wind,
      windDeg: 180 + (city.length * 15) % 180,
      uvIndex: profile.condition === 'Clear' ? 8 : profile.condition === 'Clouds' ? 4 : 1,
      visibility: profile.condition === 'Atmosphere' ? 2 : 10,
      sunrise: '06:05 AM',
      sunset: '08:24 PM',
      condition: profile.condition,
      description: profile.description,
      dt: Math.floor(Date.now() / 1000)
    },
    hourly: hourly,
    daily: daily,
    aqi: {
      value: aqiVal,
      label: aqiInfo.label,
      color: aqiInfo.color,
      description: aqiInfo.desc,
      pm25: Math.round(10 + (aqiVal * 12) + (city.length % 5)),
      pm10: Math.round(18 + (aqiVal * 18) + (city.length % 7)),
      no2: Math.round(5 + (aqiVal * 8) + (city.length % 3)),
      o3: Math.round(20 + (aqiVal * 15) + (city.length % 9))
    },
    alerts: alerts
  };
};

/**
 * Fetch Weather Data by City Name
 */
export const getWeatherData = async (city, units = 'metric') => {
  if (!isApiKeyValid) {
    console.log(`WeatherNow: Using simulated weather data for "${city}" (API key not configured).`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockWeatherData(city, units));
      }, 600); // Simulate network latency
    });
  }

  const lang = 'en';
  try {
    // 1. Fetch Current Weather
    const currentRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: { q: city, units, appid: API_KEY, lang }
      }
    );

    const { lat, lon } = currentRes.data.coord;

    // 2. Fetch 5-day / 3-hour Forecast
    const forecastRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: { lat, lon, units, appid: API_KEY, lang }
      }
    );

    // 3. Fetch Air Quality Index (AQI)
    let aqiData = null;
    try {
      const aqiRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution`,
        {
          params: { lat, lon, appid: API_KEY }
        }
      );
      if (aqiRes.data && aqiRes.data.list && aqiRes.data.list.length > 0) {
        const component = aqiRes.data.list[0];
        const aqiVal = component.main.aqi;
        const aqiInfo = [
          { label: 'Good', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
          { label: 'Moderate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', desc: 'Air quality is acceptable. However, there may be risk for some people.' },
          { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', desc: 'Members of sensitive groups may experience health effects.' },
          { label: 'Unhealthy', color: 'text-red-400 bg-red-500/10 border-red-500/20', desc: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.' },
          { label: 'Very Unhealthy', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', desc: 'Health alert: The risk of health effects is increased for everyone.' }
        ][aqiVal - 1] || { label: 'Unknown', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', desc: 'Air quality data is currently unavailable.' };
        
        aqiData = {
          value: aqiVal,
          label: aqiInfo.label,
          color: aqiInfo.color,
          description: aqiInfo.desc,
          pm25: Math.round(component.components.pm2_5),
          pm10: Math.round(component.components.pm10),
          no2: Math.round(component.components.no2),
          o3: Math.round(component.components.o3)
        };
      }
    } catch (e) {
      console.warn('Could not fetch air quality data', e);
    }

    // Process hourly forecast from 5-day / 3-hour data (take first 8 items for 24h)
    const hourly = forecastRes.data.list.slice(0, 8).map((item) => {
      const date = new Date(item.dt * 1000);
      const hour = date.getHours();
      const conditionGroup = mapWeatherCondition(item.weather[0].id);
      return {
        time: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`,
        temp: Math.round(item.main.temp),
        condition: conditionGroup.main,
        rainChance: Math.round((item.pop || 0) * 100)
      };
    });

    // Process daily forecast: openweathermap gives 5-day/3-hour forecast.
    // Let's group items by day and find min/max
    const dailyMap = {};
    forecastRes.data.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dayKey = date.toDateString();

      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = {
          day: dayKey === new Date().toDateString() ? 'Today' : dayName,
          temps: [],
          conditions: [],
          humidities: []
        };
      }
      dailyMap[dayKey].temps.push(item.main.temp);
      dailyMap[dayKey].conditions.push(mapWeatherCondition(item.weather[0].id).main);
      dailyMap[dayKey].humidities.push(item.main.humidity);
    });

    const daily = Object.values(dailyMap).slice(0, 7).map((dayGroup) => {
      const tMin = Math.round(Math.min(...dayGroup.temps));
      const tMax = Math.round(Math.max(...dayGroup.temps));
      // Mode of conditions
      const condCounts = dayGroup.conditions.reduce((acc, c) => {
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {});
      const primaryCondition = Object.keys(condCounts).reduce((a, b) => condCounts[a] > condCounts[b] ? a : b);
      const avgHumidity = Math.round(dayGroup.humidities.reduce((a, b) => a + b, 0) / dayGroup.humidities.length);

      return {
        day: dayGroup.day,
        tempMin: tMin,
        tempMax: tMax,
        condition: primaryCondition,
        humidity: avgHumidity
      };
    });

    const currentCondition = mapWeatherCondition(currentRes.data.weather[0].id);

    // Format Sunrise / Sunset times
    const formatTime = (timestamp) => {
      const date = new Date(timestamp * 1000);
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      return `${hours}:${minutes} ${ampm}`;
    };

    return {
      isMock: false,
      city: currentRes.data.name,
      country: currentRes.data.sys.country,
      coordinates: { lat, lon },
      current: {
        temp: Math.round(currentRes.data.main.temp),
        feelsLike: Math.round(currentRes.data.main.feels_like),
        tempMin: Math.round(currentRes.data.main.temp_min),
        tempMax: Math.round(currentRes.data.main.temp_max),
        humidity: currentRes.data.main.humidity,
        pressure: currentRes.data.main.pressure,
        windSpeed: Math.round(currentRes.data.wind.speed * 3.6), // convert m/s to km/h
        windDeg: currentRes.data.wind.deg,
        uvIndex: 5, // OpenWeather free api does not provide UV index in basic current call, default to 5
        visibility: Math.round((currentRes.data.visibility || 10000) / 1000), // convert m to km
        sunrise: formatTime(currentRes.data.sys.sunrise),
        sunset: formatTime(currentRes.data.sys.sunset),
        condition: currentCondition.main,
        description: currentRes.data.weather[0].description,
        dt: currentRes.data.dt
      },
      hourly: hourly,
      daily: daily,
      aqi: aqiData || {
        value: 2,
        label: 'Moderate',
        color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        description: 'Air quality is acceptable. However, there may be risk for some people.',
        pm25: 15,
        pm10: 25,
        no2: 8,
        o3: 45
      },
      alerts: [] // Free API doesn't return alerts easily, return empty array
    };

  } catch (error) {
    console.error('Error fetching live weather, falling back to simulated data:', error.message);
    return generateMockWeatherData(city, units);
  }
};

/**
 * Fetch Weather Data by Coordinates
 */
export const getWeatherDataByCoords = async (lat, lon, units = 'metric') => {
  if (!isApiKeyValid) {
    console.log(`WeatherNow: Using simulated weather data for coordinates ${lat}, ${lon} (API key not configured).`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockWeatherData('My Location', units));
      }, 600);
    });
  }

  const lang = 'en';
  try {
    // Reverse geocode to get city name
    const geoRes = await axios.get(
      `https://api.openweathermap.org/geo/1.0/reverse`,
      {
        params: { lat, lon, limit: 1, appid: API_KEY }
      }
    );
    const cityName = (geoRes.data && geoRes.data.length > 0) ? geoRes.data[0].name : 'My Location';
    return getWeatherData(cityName, units);
  } catch (e) {
    console.error('Coordinates weather fetch failed, using fallback:', e.message);
    return generateMockWeatherData('My Location', units);
  }
};
