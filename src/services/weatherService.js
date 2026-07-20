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
  // 1. Try Open-Meteo Reverse Geocoding API
  try {
    const res = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`
    );
    if (res.data && res.data.results && res.data.results.length > 0) {
      const result = res.data.results[0];
      const city = result.name || result.city || result.admin1;
      const country = result.country || 'Pakistan';
      const countryCode = (result.country_code || 'PK').toUpperCase();
      if (city && city.toLowerCase() !== 'current location') {
        return { city, country, countryCode };
      }
    }
  } catch (e) {
    console.warn('Open-Meteo reverse geocoding failed:', e.message);
  }

  // 2. Try Nominatim Reverse Geocoding API
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
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.district || addr.state_district;
      const country = addr.country || 'Pakistan';
      const countryCode = (addr.country_code || 'PK').toUpperCase();
      if (city && city.toLowerCase() !== 'current location') {
        return { city, country, countryCode };
      }
    }
  } catch (e) {
    console.warn('Nominatim reverse geocoding failed:', e.message);
  }

  // 3. Smart Proximity Fallback to Pakistani cities (e.g. Vehari, Lahore, Karachi, Islamabad, Multan)
  let fallbackCity = 'Vehari';
  if (Math.abs(lat - 31.5497) < 0.8 && Math.abs(lon - 74.3436) < 0.8) fallbackCity = 'Lahore';
  else if (Math.abs(lat - 24.8607) < 0.8 && Math.abs(lon - 67.0011) < 0.8) fallbackCity = 'Karachi';
  else if (Math.abs(lat - 33.6844) < 0.8 && Math.abs(lon - 73.0479) < 0.8) fallbackCity = 'Islamabad';
  else if (Math.abs(lat - 30.1575) < 0.5 && Math.abs(lon - 71.5249) < 0.5) fallbackCity = 'Multan';
  else if (Math.abs(lat - 30.0452) < 0.8 && Math.abs(lon - 72.3489) < 0.8) fallbackCity = 'Vehari';

  return { city: fallbackCity, country: 'Pakistan', countryCode: 'PK' };
};

/**
 * Core fetcher to request forecast and air quality data for specific coordinates
 */
const fetchWeatherForCoordinates = async (lat, lon, cityName, countryCode, units = 'metric') => {
  const tempUnitParam = units === 'imperial' ? '&temperature_unit=fahrenheit' : '';

  // 1. Fetch weather forecast and current weather
  const forecastRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=7${tempUnitParam}`
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

    const rainProb = forecast.daily.precipitation_probability_max
      ? Math.round(forecast.daily.precipitation_probability_max[i] ?? 0)
      : (forecast.daily.precipitation_sum ? Math.min(100, Math.round(forecast.daily.precipitation_sum[i] * 10)) : 0);

    daily.push({
      day: i === 0 ? 'Today' : dayName,
      tempMin: Math.round(forecast.daily.temperature_2m_min[i]),
      tempMax: Math.round(forecast.daily.temperature_2m_max[i]),
      condition: mapWmoCodeToCondition(forecast.daily.weather_code[i]).main,
      humidity: forecast.current.relative_humidity_2m,
      rainChance: rainProb
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
  const windKmh = Math.round(forecast.current.wind_speed_10m);
  const precipitation = forecast.current.precipitation || 0;
  const visibilityKm = Math.round((forecast.current.visibility || 10000) / 1000);
  const uvMax = Math.round(forecast.daily.uv_index_max[0] || 0);

  // 1. Extreme Heat & Heat Wave
  if (tempCelsius >= 38) {
    alerts.push({
      id: 'heat-extreme',
      event: '🔥 Extreme Heat Warning',
      icon: '🔥',
      severity: 'Extreme',
      description: `Dangerous heatwave in ${cityName} with temperatures reaching ${Math.round(tempCelsius)}°C. Stay indoors, avoid direct sunlight, and remain hydrated.`,
      time: 'Issued today • Active'
    });
  } else if (tempCelsius >= 34) {
    alerts.push({
      id: 'heat-wave',
      event: '🌡 Heat Wave Advisory',
      icon: '🌡',
      severity: 'High',
      description: `Elevated temperatures in ${cityName} causing high heat stress (${Math.round(tempCelsius)}°C). Limit strenuous outdoor activities.`,
      time: 'Issued today • Active'
    });
  }

  // 2. Thunderstorm & Heavy Rain
  if (conditionGroup.main === 'Thunderstorm') {
    alerts.push({
      id: 'thunderstorm',
      event: '⛈ Severe Thunderstorm Warning',
      icon: '⛈',
      severity: 'High',
      description: `Severe thunderstorm system active near ${cityName}. Expect gusty winds, frequent lightning, and localized heavy downpours.`,
      time: 'Issued recently • Active'
    });
  }

  if (conditionGroup.main === 'Rain' || precipitation > 5) {
    alerts.push({
      id: 'heavy-rain',
      event: '⚠ Heavy Rain Warning',
      icon: '⚠',
      severity: 'High',
      description: `Heavy rainfall expected during the next 6 hours in ${cityName}. Stay indoors and avoid unnecessary road travel.`,
      time: 'Issued recently • Active'
    });

    if (precipitation > 10) {
      alerts.push({
        id: 'flood-watch',
        event: '🌊 Urban Flood Watch',
        icon: '🌊',
        severity: 'Extreme',
        description: `Rapid accumulation of rainwater may cause waterlogging and urban flooding in low-lying areas of ${cityName}.`,
        time: 'Issued recently • Active'
      });
    }
  }

  // 3. High Wind Advisory
  if (windKmh >= 25) {
    alerts.push({
      id: 'high-wind',
      event: '🌪 High Wind Advisory',
      icon: '🌬',
      severity: 'Moderate',
      description: `Strong surface winds of ${windKmh} km/h detected in ${cityName}. Secure loose outdoor items and exercise caution while driving.`,
      time: 'Issued today • Active'
    });
  }

  // 4. Fog Advisory
  if (visibilityKm <= 2 || conditionGroup.main === 'Atmosphere') {
    alerts.push({
      id: 'dense-fog',
      event: '🌫 Dense Fog Advisory',
      icon: '🌫',
      severity: 'Moderate',
      description: `Reduced visibility (${visibilityKm} km) due to fog/haze in ${cityName}. Drive slowly with fog lights enabled.`,
      time: 'Issued early morning • Active'
    });
  }

  // 5. Cold Wave / Freeze Warning
  if (tempCelsius <= 0) {
    alerts.push({
      id: 'freeze-warning',
      event: '❄ Freeze Warning',
      icon: '❄',
      severity: 'High',
      description: `Sub-freezing temperatures (${Math.round(tempCelsius)}°C) in ${cityName}. Protect pipes and vulnerable crops from frost damage.`,
      time: 'Issued today • Active'
    });
  } else if (tempCelsius <= 5) {
    alerts.push({
      id: 'cold-wave',
      event: '🥶 Cold Wave Warning',
      icon: '🥶',
      severity: 'Moderate',
      description: `Sharply lower temperatures in ${cityName} (${Math.round(tempCelsius)}°C). Dress in layers and keep warm.`,
      time: 'Issued today • Active'
    });
  }

  // 6. Extreme UV Alert
  if (uvMax >= 8) {
    alerts.push({
      id: 'uv-extreme',
      event: '☀ High UV Warning',
      icon: '☀',
      severity: 'Moderate',
      description: `Very high UV Index level (${uvMax}/10) expected today in ${cityName}. Wear SPF 30+ sunscreen, sunglasses, and protective headwear.`,
      time: 'Peak hours 11:00 AM - 4:00 PM'
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
