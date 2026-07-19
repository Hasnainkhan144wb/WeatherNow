import axios from 'axios';

/**
 * Standardize WMO weather codes to simple categories
 */
const mapWmoCodeToCondition = (code) => {
  if (code === 0) return { main: 'Clear', description: 'Clear sky' };
  if ([1, 2, 3].includes(code)) {
    const desc = code === 1 ? 'Mainly clear' : code === 2 ? 'Partly cloudy' : 'Overcast';
    return { main: 'Clouds', description: desc };
  }
  if ([45, 48].includes(code)) return { main: 'Atmosphere', description: 'Fog' };
  if ([51, 53, 55, 56, 57].includes(code)) return { main: 'Drizzle', description: 'Drizzle' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { main: 'Rain', description: 'Rain' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { main: 'Snow', description: 'Snow fall' };
  if ([95, 96, 99].includes(code)) return { main: 'Thunderstorm', description: 'Thunderstorm' };
  return { main: 'Clouds', description: 'Partly cloudy' };
};

/**
 * Map US EPA AQI index to a 1-5 scale
 */
const mapUsAqiTo1to5 = (usAqi) => {
  if (usAqi <= 50) return 1;
  if (usAqi <= 100) return 2;
  if (usAqi <= 150) return 3;
  if (usAqi <= 200) return 4;
  return 5;
};

/**
 * Format ISO datetime string (e.g., "2026-07-18T05:08") to AM/PM format (e.g., "5:08 AM")
 */
const formatTimeStr = (isoStr) => {
  if (!isoStr) return '';
  const parts = isoStr.split('T');
  if (parts.length < 2) return '';
  const timePart = parts[1];
  const [hourStr, minStr] = timePart.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minStr} ${ampm}`;
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
      activity: "Cozying up indoors with a book, or visiting cafes.",
      necessities: "Thermal socks, moisturiser, and pocket hand warmers.",
      tip: "Freezing weather. Keep ears and hands covered!"
    };
  }
};

/**
 * Reverse geocode latitude and longitude to a city name
 */
const reverseGeocode = async (lat, lon) => {
  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: { lat, lon, format: 'json', 'accept-language': 'en' },
        headers: { 'User-Agent': 'WeatherNow-App' }
      }
    );
    if (res.data && res.data.address) {
      const addr = res.data.address;
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Current Location';
      const country = addr.country || '';
      const countryCode = (addr.country_code || 'LOC').toUpperCase();
      return { city, country, countryCode };
    }
  } catch (e) {
    console.warn('Reverse geocoding failed, falling back to coords name:', e.message);
  }
  return { city: 'Current Location', country: '', countryCode: 'LOC' };
};

/**
 * Core fetcher to request forecast and air quality data for specific coordinates
 */
const fetchWeatherForCoordinates = async (lat, lon, cityName, countryCode, units = 'metric') => {
  const tempUnitParam = units === 'imperial' ? '&temperature_unit=fahrenheit' : '';

  // 1. Fetch weather forecast and current weather
  const forecastRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7${tempUnitParam}`
  );

  // 2. Fetch air quality data
  const aqiRes = await axios.get(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone`
  );

  const forecast = forecastRes.data;
  const aq = aqiRes.data;

  // Process hourly forecast (align to next 24 hours at 3-hour intervals: 8 items total)
  const hourly = [];
  const currentHour = new Date().getHours();
  for (let i = 0; i < 24; i += 3) {
    const index = currentHour + i;
    if (index < forecast.hourly.time.length) {
      const timeStr = forecast.hourly.time[index];
      const tempVal = Math.round(forecast.hourly.temperature_2m[index]);
      const codeVal = forecast.hourly.weather_code[index];
      const rainChance = Math.round(forecast.hourly.precipitation_probability[index]);
      
      const hourPart = parseInt(timeStr.split('T')[1].split(':')[0], 10);
      const ampm = hourPart >= 12 ? 'PM' : 'AM';
      const formattedHour = hourPart % 12 || 12;

      hourly.push({
        time: `${formattedHour} ${ampm}`,
        temp: tempVal,
        condition: mapWmoCodeToCondition(codeVal).main,
        rainChance: rainChance
      });
    }
  }

  // Process 7-day daily forecast
  const daily = [];
  for (let i = 0; i < 7; i++) {
    const timeStr = forecast.daily.time[i];
    const date = new Date(timeStr + 'T00:00:00');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    daily.push({
      day: i === 0 ? 'Today' : dayName,
      tempMin: Math.round(forecast.daily.temperature_2m_min[i]),
      tempMax: Math.round(forecast.daily.temperature_2m_max[i]),
      condition: mapWmoCodeToCondition(forecast.daily.weather_code[i]).main,
      humidity: forecast.current.relative_humidity_2m
    });
  }

  // Map WMO weather code to standard condition categories
  const conditionGroup = mapWmoCodeToCondition(forecast.current.weather_code);

  // Map AQI and build pollutant metrics
  const usAqi = aq.current.us_aqi || 50;
  const aqiVal = mapUsAqiTo1to5(usAqi);
  const aqiInfo = [
    { label: 'Good', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
    { label: 'Moderate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', desc: 'Air quality is acceptable. However, there may be risk for some people.' },
    { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', desc: 'Members of sensitive groups may experience health effects.' },
    { label: 'Unhealthy', color: 'text-red-400 bg-red-500/10 border-red-500/20', desc: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.' },
    { label: 'Very Unhealthy', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', desc: 'Health alert: The risk of health effects is increased for everyone.' }
  ][aqiVal - 1];

  // Procedurally generate severe weather alerts based on real-time metrics
  const alerts = [];
  const tempCelsius = units === 'imperial'
    ? ((forecast.current.temperature_2m - 32) * 5) / 9
    : forecast.current.temperature_2m;

  if (tempCelsius >= 38) {
    alerts.push({
      event: 'Extreme Heat Warning',
      sender: 'National Weather Intelligence Service',
      description: `An extreme heatwave is currently affecting ${cityName}. Stay indoors, keep cool, and drink plenty of water.`,
      severity: 'Extreme'
    });
  } else if (conditionGroup.main === 'Thunderstorm') {
    alerts.push({
      event: 'Severe Thunderstorm Watch',
      sender: 'National Weather Intelligence Service',
      description: 'Severe weather systems capable of generating lightning, heavy rain, and microbursts are in the area.',
      severity: 'Severe'
    });
  } else if (tempCelsius <= 0) {
    alerts.push({
      event: 'Freeze Warning',
      sender: 'National Weather Intelligence Service',
      description: 'Sub-freezing temperatures are expected. Protect tender vegetation and prevent pipe freeze hazards.',
      severity: 'Moderate'
    });
  }

  return {
    isMock: false,
    city: cityName,
    country: countryCode,
    coordinates: { lat, lon },
    current: {
      temp: Math.round(forecast.current.temperature_2m),
      feelsLike: Math.round(forecast.current.apparent_temperature),
      tempMin: Math.round(forecast.daily.temperature_2m_min[0]),
      tempMax: Math.round(forecast.daily.temperature_2m_max[0]),
      humidity: forecast.current.relative_humidity_2m,
      pressure: Math.round(forecast.current.pressure_msl),
      windSpeed: Math.round(forecast.current.wind_speed_10m),
      windDeg: forecast.current.wind_direction_10m,
      uvIndex: Math.round(forecast.daily.uv_index_max[0]),
      visibility: Math.round((forecast.current.visibility || 10000) / 1000),
      sunrise: formatTimeStr(forecast.daily.sunrise[0]),
      sunset: formatTimeStr(forecast.daily.sunset[0]),
      condition: conditionGroup.main,
      description: conditionGroup.description,
      dt: Math.floor(Date.now() / 1000)
    },
    hourly,
    daily,
    aqi: {
      value: aqiVal,
      label: aqiInfo.label,
      color: aqiInfo.color,
      description: aqiInfo.desc,
      pm25: Math.round(aq.current.pm2_5),
      pm10: Math.round(aq.current.pm10),
      no2: Math.round(aq.current.nitrogen_dioxide),
      o3: Math.round(aq.current.ozone)
    },
    alerts
  };
};

/**
 * Fetch Weather Data by City Name (with forward geocoding)
 */
export const getWeatherData = async (city, units = 'metric') => {
  const geoRes = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );

  if (!geoRes.data.results || geoRes.data.results.length === 0) {
    throw new Error('City not found');
  }

  const result = geoRes.data.results[0];
  const countryCode = result.country_code || result.country || 'LOC';
  
  return fetchWeatherForCoordinates(
    result.latitude,
    result.longitude,
    result.name,
    countryCode,
    units
  );
};

/**
 * Fetch Weather Data by Coordinates (with reverse geocoding)
 */
export const getWeatherDataByCoords = async (lat, lon, units = 'metric') => {
  const { city, country, countryCode } = await reverseGeocode(lat, lon);
  const data = await fetchWeatherForCoordinates(
    lat,
    lon,
    city,
    countryCode,
    units
  );
  data.fullName = country ? `${city}, ${country}` : city;
  return data;
};
