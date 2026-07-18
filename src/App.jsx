import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  IoSearch, 
  IoLocation, 
  IoThermometer, 
  IoEye, 
  IoSpeedometer,
  IoAlertCircle,
  IoShirt,
  IoSunny,
  IoTrendingUp,
  IoCloseCircle,
  IoInformationCircle,
  IoMap
} from 'react-icons/io5';
import { BsWind } from 'react-icons/bs';

import { getWeatherData, getWeatherDataByCoords, getClothingRecommendation } from './services/weatherService';
import { WeatherChart } from './components/WeatherChart';
import { FavoritesWidget } from './components/FavoritesWidget';
import { WeatherIcon } from './components/WeatherIcon';

function App() {
  const [cityInput, setCityInput] = useState('');
  const [currentCity, setCurrentCity] = useState('New York');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUnit, setActiveUnit] = useState('C'); // 'C' or 'F'
  const [localTime, setLocalTime] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const popularCities = ['New York', 'London', 'Tokyo', 'Dubai', 'Paris', 'Sydney', 'Mumbai', 'Reykjavik'];

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit' 
      };
      setLocalTime(new Date().toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather data
  const fetchWeather = async (city) => {
    setLoading(true);
    try {
      const units = activeUnit === 'C' ? 'metric' : 'imperial';
      const data = await getWeatherData(city, units);
      setWeatherData(data);
      setCurrentCity(data.city);
      setCityInput('');
      setShowSearchSuggestions(false);
      
      if (data.isMock) {
        toast('Showing simulated weather data. Add your OpenWeather API key in .env to enable real-time tracking!', {
          icon: 'ℹ️',
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          },
          duration: 5000,
        });
      } else {
        toast.success(`Updated weather for ${data.city}!`);
      }
    } catch (error) {
      toast.error('Could not fetch weather data. Please check spelling.');
    } finally {
      setLoading(false);
    }
  };

  // Get user location
  const handleLocationFetch = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    toast.loading('Fetching location...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLoading(true);
        try {
          const units = activeUnit === 'C' ? 'metric' : 'imperial';
          const data = await getWeatherDataByCoords(latitude, longitude, units);
          setWeatherData(data);
          setCurrentCity(data.city);
          toast.success(`Found location: ${data.city}!`, { id: 'geo' });
        } catch (e) {
          toast.error('Failed to resolve location weather.', { id: 'geo' });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        toast.error('Permission denied or location unavailable.', { id: 'geo' });
        setLoading(false);
      }
    );
  };

  // Initial fetch
  useEffect(() => {
    fetchWeather(currentCity);
  }, [activeUnit]);

  // Handle unit switch
  const toggleUnit = (unit) => {
    if (activeUnit !== unit) {
      setActiveUnit(unit);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeather(cityInput.trim());
    }
  };

  // Dynamic Theme Gradients based on weather condition
  const getThemeGradient = () => {
    if (!weatherData) return 'from-slate-950 via-[#0f172a] to-[#1e293b]';
    const cond = weatherData.current.condition.toLowerCase();

    switch (cond) {
      case 'clear':
        return 'from-slate-950 via-[#0e1a35] to-[#252210]'; // warm sun glow
      case 'rain':
      case 'drizzle':
        return 'from-slate-950 via-[#0a1e35] to-[#0c1f24]'; // rain slate
      case 'clouds':
        return 'from-slate-950 via-[#101b2d] to-[#1c222c]'; // cloudy navy
      case 'thunderstorm':
        return 'from-slate-950 via-[#130f2b] to-[#121622]'; // stormy dark purple
      case 'snow':
        return 'from-slate-950 via-[#112338] to-[#182a3c]'; // cold ice blue
      default:
        return 'from-slate-950 via-[#0f172a] to-[#1e293b]';
    }
  };

  const clothingRec = weatherData 
    ? getClothingRecommendation(
        activeUnit === 'C' ? weatherData.current.temp : Math.round(((weatherData.current.temp - 32) * 5) / 9), 
        weatherData.current.condition
      ) 
    : null;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeGradient()} text-gray-100 transition-all duration-1000 flex flex-col font-sans relative overflow-hidden pb-12`}>
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      
      <Toaster position="top-right" />

      {/* Landing Navbar / Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-20">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Logo & Clock */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-tight font-outfit bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
                WeatherNow
              </h1>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                Real-time Weather Intelligence
              </span>
            </div>
            {/* Clock for smaller screens */}
            <div className="md:hidden text-right">
              <span className="block text-xs text-blue-400 font-semibold font-outfit">
                {localTime ? localTime.split(',')[1] : ''}
              </span>
              <span className="block text-[10px] text-slate-400">
                {localTime ? localTime.split(',')[0] : ''}
              </span>
            </div>
          </div>

          {/* Search bar & actions */}
          <div className="flex items-center gap-3 w-full md:w-auto max-w-md z-30 relative">
            <form onSubmit={handleSearchSubmit} className="relative flex-grow">
              <input
                type="text"
                placeholder="Search city, country..."
                value={cityInput}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full glass-input text-sm text-white pl-10 pr-4 py-2.5 rounded-full outline-none transition-all duration-300 font-outfit"
              />
              <IoSearch className="absolute left-3.5 top-3.5 text-slate-400 text-base" />
              
              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showSearchSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl overflow-hidden border border-white/10 z-50 shadow-2xl"
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-white/5 bg-slate-950/40">
                      Popular Locations
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-2 bg-slate-900/90 backdrop-blur-md">
                      {popularCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onMouseDown={() => fetchWeather(city)}
                          className="text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-150"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Geolocation Button */}
            <button
              onClick={handleLocationFetch}
              className="p-3 rounded-full glass-panel hover:bg-blue-600/20 hover:border-blue-500/30 text-blue-400 transition-all duration-300 shadow-md"
              title="Locate me"
            >
              <IoLocation className="text-lg" />
            </button>

            {/* C/F Unit Switcher */}
            <div className="flex bg-slate-900/50 border border-white/10 rounded-full p-1 shadow-inner">
              <button
                onClick={() => toggleUnit('C')}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeUnit === 'C'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => toggleUnit('F')}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeUnit === 'F'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>

            {/* Clock for medium/large screens */}
            <div className="hidden md:flex flex-col text-right pl-3 border-l border-white/10 min-w-[130px]">
              <span className="text-sm font-semibold font-outfit text-blue-400">
                {localTime ? localTime.split(',')[1] : ''}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {localTime ? localTime.split(',')[0] : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow z-10">
        
        {/* Banner indicating demo data */}
        {weatherData?.isMock && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl glass-panel border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <IoInformationCircle size={22} />
              </div>
              <div>
                <h4 className="font-outfit font-semibold text-sm text-amber-200">Simulation &amp; Demo Mode Active</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Currently showcasing simulated data. To activate real-time local updates, edit the <code className="bg-slate-950/60 px-1 py-0.5 rounded text-amber-400 font-mono">.env</code> file in your workspace root and set <code className="bg-slate-950/60 px-1 py-0.5 rounded text-amber-400 font-mono">VITE_WEATHER_API_KEY</code>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          /* Sleek Loader Skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse mt-8">
            <div className="lg:col-span-2 h-[380px] bg-slate-900/30 rounded-3xl border border-white/5" />
            <div className="h-[380px] bg-slate-900/30 rounded-3xl border border-white/5" />
            <div className="lg:col-span-3 h-[200px] bg-slate-900/30 rounded-3xl border border-white/5" />
          </div>
        ) : (
          weatherData && (
            <div className="flex flex-col gap-6 mt-4">
              
              {/* Severe Weather Alerts (If any) */}
              <AnimatePresence>
                {weatherData.alerts && weatherData.alerts.length > 0 && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="p-5 rounded-3xl bg-red-950/40 border border-red-500/30 relative overflow-hidden"
                  >
                    {/* Pulsing indicator */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl animate-pulse">
                        <IoAlertCircle size={26} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <span className="font-outfit font-extrabold text-sm uppercase tracking-wider text-red-400">
                            {weatherData.alerts[0].severity} alert
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                        </div>
                        <h3 className="font-outfit font-bold text-lg text-white mt-1">
                          {weatherData.alerts[0].event}
                        </h3>
                        <p className="text-sm text-red-200/80 mt-1.5 leading-relaxed">
                          {weatherData.alerts[0].description}
                        </p>
                        <span className="inline-block text-[11px] text-red-400/60 font-semibold mt-3">
                          Issued by {weatherData.alerts[0].sender}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Weather Information Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* HERO CARD: Current weather display */}
                <div className="lg:col-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[380px] shadow-xl">
                  {/* Atmospheric Weather Overlay */}
                  <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header info */}
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-outfit font-extrabold text-3xl text-white">
                          {weatherData.city}
                        </h2>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300 font-bold uppercase border border-white/5 mt-1">
                          {weatherData.country}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        Coordinates: {weatherData.coordinates.lat.toFixed(2)}°N, {weatherData.coordinates.lon.toFixed(2)}°E
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                        Current Weather
                      </span>
                      <span className="text-xs font-medium text-blue-400 mt-1 block">
                        Updated just now
                      </span>
                    </div>
                  </div>

                  {/* Temperature & Large Icon details */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 my-6 z-10">
                    <div className="flex items-center gap-6">
                      <div className="animate-float">
                        <WeatherIcon 
                          condition={weatherData.current.condition} 
                          size={110} 
                          className="filter drop-shadow-[0_8px_16px_rgba(59,130,246,0.3)]"
                        />
                      </div>
                      <div>
                        <span className="font-outfit font-black text-7xl md:text-8xl text-white tracking-tight relative flex">
                          {weatherData.current.temp}
                          <span className="text-4xl md:text-5xl font-light text-blue-400 absolute right-[-24px] top-1">°</span>
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-base font-semibold font-outfit text-white capitalize">
                            {weatherData.current.description}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          <span className="text-xs text-slate-400 font-medium">
                            Feels like {weatherData.current.feelsLike}°
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick limits */}
                    <div className="flex gap-4 border border-white/5 bg-slate-950/20 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-center min-w-[70px]">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">High</span>
                        <span className="font-outfit font-bold text-lg text-rose-400 mt-0.5 block">{weatherData.current.tempMax}°</span>
                      </div>
                      <div className="w-px h-8 bg-white/10 my-auto" />
                      <div className="text-center min-w-[70px]">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Low</span>
                        <span className="font-outfit font-bold text-lg text-sky-400 mt-0.5 block">{weatherData.current.tempMin}°</span>
                      </div>
                    </div>
                  </div>

                  {/* Core statistics strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-6 border-t border-white/5 z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                        <IoThermometer size={20} />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Humidity</span>
                        <span className="font-outfit font-extrabold text-sm text-white">{weatherData.current.humidity}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                        <BsWind size={20} />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Wind Speed</span>
                        <span className="font-outfit font-extrabold text-sm text-white">{weatherData.current.windSpeed} km/h</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                        <IoSunny size={20} />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">UV Index</span>
                        <span className="font-outfit font-extrabold text-sm text-white">{weatherData.current.uvIndex} / 10</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <IoEye size={20} />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Visibility</span>
                        <span className="font-outfit font-extrabold text-sm text-white">{weatherData.current.visibility} km</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7-DAY FORECAST WIDGET */}
                <div className="glass-panel rounded-3xl p-6 flex flex-col shadow-xl">
                  <h3 className="font-outfit font-semibold text-lg text-white mb-4 flex items-center gap-2">
                    <IoTrendingUp className="text-blue-400" />
                    7-Day Forecast
                  </h3>

                  <div className="flex flex-col gap-3 flex-grow justify-between">
                    {weatherData.daily.map((day, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                        {/* Day Name */}
                        <span className="w-20 font-medium text-slate-300 truncate">
                          {day.day}
                        </span>

                        {/* Condition Icon */}
                        <div className="flex items-center gap-2 justify-center w-8">
                          <WeatherIcon condition={day.condition} size={22} />
                        </div>

                        {/* Temperature Bar comparison */}
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-slate-400 w-6 text-right font-medium">
                            {day.tempMin}°
                          </span>
                          
                          {/* Visual slider representing difference */}
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                            <div 
                              className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-rose-400" 
                              style={{ 
                                left: '20%', 
                                right: '20%' 
                              }}
                            />
                          </div>

                          <span className="text-xs text-white font-bold w-6 text-right">
                            {day.tempMax}°
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lower Section: Charts, AQI, Clothing recommendations & Favorites */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* HOURLY GRAPH WIDGET (Span 2 columns on larger screens) */}
                <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-outfit font-semibold text-lg text-white flex items-center gap-2">
                        <IoSpeedometer className="text-blue-400" />
                        Hourly Forecast
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Next 24 hours temperature and precipitation trends</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Temp Curve
                    </div>
                  </div>

                  {/* Interactive Custom SVG Chart */}
                  <WeatherChart hourlyData={weatherData.hourly} unit={activeUnit} />
                </div>

                {/* AIR QUALITY INDEX WIDGET */}
                <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <h3 className="font-outfit font-semibold text-lg text-white flex items-center gap-2">
                      <IoMap className="text-emerald-400" />
                      Air Quality Index (AQI)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Pollutants and local environmental metrics</p>
                  </div>

                  <div className="my-6">
                    <div className="flex items-center gap-4">
                      {/* Large numerical AQI level */}
                      <div className="w-16 h-16 rounded-2xl flex flex-col justify-center items-center bg-slate-950/40 border border-white/5">
                        <span className="font-outfit font-black text-2xl text-white">
                          {weatherData.aqi.value}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">AQI</span>
                      </div>
                      
                      {/* Title description */}
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-outfit border uppercase ${weatherData.aqi.color}`}>
                          {weatherData.aqi.label}
                        </span>
                        <p className="text-xs text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                          {weatherData.aqi.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pollutant breakdown bar grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">PM 2.5</span>
                        <span className="text-white font-bold">{weatherData.aqi.pm25} µg/m³</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${Math.min(100, (weatherData.aqi.pm25 / 75) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">PM 10</span>
                        <span className="text-white font-bold">{weatherData.aqi.pm10} µg/m³</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${Math.min(100, (weatherData.aqi.pm10 / 150) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Ozone (O₃)</span>
                        <span className="text-white font-bold">{weatherData.aqi.o3} µg/m³</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full" 
                          style={{ width: `${Math.min(100, (weatherData.aqi.o3 / 180) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Nitrogen (NO₂)</span>
                        <span className="text-white font-bold">{weatherData.aqi.no2} µg/m³</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${Math.min(100, (weatherData.aqi.no2 / 200) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Favorites and Clothing recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* FAVORITES WIDGET (Span 2 columns on larger screens) */}
                <div className="lg:col-span-2">
                  <FavoritesWidget 
                    currentCity={weatherData.city} 
                    onSelectCity={fetchWeather} 
                    activeUnit={activeUnit} 
                  />
                </div>

                {/* CLOTHING AND OUTDOOR TIPS */}
                <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <h3 className="font-outfit font-semibold text-lg text-white flex items-center gap-2">
                      <IoShirt className="text-sky-400" />
                      Smart Wardrobe &amp; Gear
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Recommendations suited to current outdoor weather</p>
                  </div>

                  {clothingRec && (
                    <div className="flex flex-col gap-4 my-6">
                      {/* Outfit detail */}
                      <div className="flex gap-3">
                        <span className="text-xs bg-sky-500/10 text-sky-400 px-2 py-1 h-fit rounded font-bold uppercase tracking-wider border border-sky-500/10">Clothing</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {clothingRec.clothing}
                        </p>
                      </div>

                      {/* Best Activity */}
                      <div className="flex gap-3">
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 h-fit rounded font-bold uppercase tracking-wider border border-emerald-500/10">Activity</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {clothingRec.activity}
                        </p>
                      </div>

                      {/* Daily Necessities */}
                      <div className="flex gap-3">
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 h-fit rounded font-bold uppercase tracking-wider border border-amber-500/10">Gear</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {clothingRec.necessities}
                        </p>
                      </div>
                    </div>
                  )}

                  {clothingRec && (
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                      <p className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                        <IoInformationCircle size={15} />
                        {clothingRec.tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sun Cycle Details & Astronomy */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="glass-panel rounded-3xl p-5 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sunrise</span>
                    <span className="font-outfit font-extrabold text-lg text-white mt-1 block">{weatherData.current.sunrise}</span>
                  </div>
                  <div className="text-amber-400 text-3xl font-light font-outfit animate-pulse">
                    🌅
                  </div>
                </div>

                <div className="glass-panel rounded-3xl p-5 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sunset</span>
                    <span className="font-outfit font-extrabold text-lg text-white mt-1 block">{weatherData.current.sunset}</span>
                  </div>
                  <div className="text-indigo-400 text-3xl font-light font-outfit animate-pulse">
                    🌇
                  </div>
                </div>

                <div className="glass-panel rounded-3xl p-5 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Atmospheric Pressure</span>
                    <span className="font-outfit font-extrabold text-lg text-white mt-1 block">{weatherData.current.pressure} hPa</span>
                  </div>
                  <div className="text-blue-400 text-3xl font-light font-outfit">
                    🧬
                  </div>
                </div>

                <div className="glass-panel rounded-3xl p-5 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Wind Direction</span>
                    <span className="font-outfit font-extrabold text-lg text-white mt-1 block">{weatherData.current.windDeg}°</span>
                  </div>
                  {/* Rotating Wind Needle */}
                  <div className="w-10 h-10 rounded-full border border-blue-500/20 bg-blue-500/10 flex items-center justify-center relative">
                    <div 
                      className="w-1 h-6 bg-blue-400 rounded-full transition-transform duration-500"
                      style={{ transform: `rotate(${weatherData.current.windDeg}deg)` }}
                    />
                    <span className="absolute text-[8px] top-0.5 text-blue-300 font-bold">N</span>
                  </div>
                </div>

              </div>

            </div>
          )
        )}
      </main>

      {/* SEO Friendly & Aesthetic Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium z-10">
        <div>
          &copy; {new Date().getFullYear()} WeatherNow. All rights reserved. Created with Vite, React, &amp; Tailwind CSS.
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
          <span className="text-white/10">&bull;</span>
          <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
          <span className="text-white/10">&bull;</span>
          <a href="#" className="hover:text-blue-400 transition-colors font-semibold">Documentation</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
