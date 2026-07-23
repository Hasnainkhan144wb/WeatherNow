import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoStar, IoStarOutline, IoTrashOutline, IoLocationSharp, IoCheckmarkCircle, IoRainyOutline, IoReloadOutline } from 'react-icons/io5';
import { getWeatherData, getWeatherDataByCoords } from '../services/weatherService';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache TTL

const getCityName = (item) => {
  if (!item) return 'Vehari';
  let raw = typeof item === 'string' ? item : item.city;
  if (!raw) return 'Vehari';
  return raw
    .replace(/\s+District$/i, '')
    .replace(/\s+Division$/i, '')
    .replace(/\s+Tehsil$/i, '')
    .replace(/^Current Location$/i, 'Vehari')
    .trim() || 'Vehari';
};

const getItemId = (item) => {
  if (typeof item === 'object' && item && item.id) return String(item.id);
  return getCityName(item);
};

export const FavoritesWidget = ({ currentCity, weatherData, onSelectCity, activeUnit }) => {
  const [favorites, setFavorites] = useState([]);
  const [favData, setFavData] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const cacheRef = useRef({}); // In-memory cache: { [city_unit]: { data, timestamp } }

  // Load favorites from localstorage on mount & normalize names
  useEffect(() => {
    const saved = localStorage.getItem('weathernow_favorites');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize items
          const seen = new Set();
          const normalized = [];
          for (const item of parsed) {
            const name = getCityName(item);
            const lower = name.toLowerCase();
            if (!seen.has(lower)) {
              seen.add(lower);
              if (typeof item === 'object' && item !== null) {
                normalized.push({ ...item, city: name });
              } else {
                normalized.push(name);
              }
            }
          }
          setFavorites(normalized);
          localStorage.setItem('weathernow_favorites', JSON.stringify(normalized));
          return;
        }
      } catch (e) {
        console.warn('Failed parsing favorites from localStorage', e);
      }
    }
    const defaults = ['Lahore', 'Karachi', 'Islamabad', 'Multan'];
    setFavorites(defaults);
    localStorage.setItem('weathernow_favorites', JSON.stringify(defaults));
  }, []);

  // Fetch live weather data for favorite cities
  const fetchFavWeather = async (forceRefresh = false) => {
    if (favorites.length === 0) return;

    const unit = activeUnit === 'C' ? 'metric' : 'imperial';
    const now = Date.now();
    const newFavData = { ...favData };
    const newLoadingMap = {};
    const newErrorMap = {};

    // Determine items that need fetching
    const itemsToFetch = favorites.filter((item) => {
      const cityName = getCityName(item);
      const cacheKey = `${cityName.toLowerCase()}_${unit}`;
      const cached = cacheRef.current[cacheKey];
      if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
        newFavData[cityName] = cached.data;
        return false;
      }
      newLoadingMap[cityName] = true;
      return true;
    });

    setFavData({ ...newFavData });
    setLoadingMap(newLoadingMap);

    if (itemsToFetch.length === 0) return;

    // Parallel fetch using Promise.all
    await Promise.all(
      itemsToFetch.map(async (item) => {
        const cityName = getCityName(item);
        try {
          let data;
          if (typeof item === 'object' && item !== null && item.latitude && item.longitude) {
            data = await getWeatherDataByCoords(item.latitude, item.longitude, unit);
          } else {
            data = await getWeatherData(cityName, unit);
          }

          const rainProb = data?.daily?.[0]?.rainChance ?? data?.hourly?.[0]?.rainChance ?? 0;
          const processed = {
            temp: data.current.temp,
            condition: data.current.description || data.current.condition,
            country: data.country || 'PK',
            rainChance: rainProb,
            latitude: data.coordinates?.lat,
            longitude: data.coordinates?.lon
          };

          const cacheKey = `${cityName.toLowerCase()}_${unit}`;
          cacheRef.current[cacheKey] = { data: processed, timestamp: Date.now() };
          newFavData[cityName] = processed;
        } catch (e) {
          console.error(`Failed fetching weather for favorite: ${cityName}`, e);
          newErrorMap[cityName] = true;
        } finally {
          newLoadingMap[cityName] = false;
        }
      })
    );

    setFavData({ ...newFavData });
    setLoadingMap({ ...newLoadingMap });
    setErrorMap({ ...newErrorMap });
  };

  // Trigger fetch when favorites or unit changes
  useEffect(() => {
    fetchFavWeather();
  }, [favorites, activeUnit]);

  // Periodic auto-refresh every 12 minutes & page focus refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFavWeather(true);
    }, 12 * 60 * 1000);

    const handleFocus = () => {
      fetchFavWeather(false);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [favorites, activeUnit]);

  const activeCityName = getCityName(weatherData?.city || currentCity);

  const isFavorite = favorites.some(
    (item) => getCityName(item).toLowerCase() === activeCityName.toLowerCase()
  );

  const toggleFavorite = () => {
    let updated;
    if (isFavorite) {
      updated = favorites.filter(
        (item) => getCityName(item).toLowerCase() !== activeCityName.toLowerCase()
      );
    } else {
      const newFavObj = {
        id: Date.now(),
        city: activeCityName,
        country: weatherData?.country || 'PK',
        latitude: weatherData?.coordinates?.lat || null,
        longitude: weatherData?.coordinates?.lon || null,
        isCurrentLocation: true,
        updatedAt: Date.now()
      };
      updated = [...favorites, newFavObj];
    }
    setFavorites(updated);
    localStorage.setItem('weathernow_favorites', JSON.stringify(updated));
  };

  const deleteFavorite = (e, itemToDelete) => {
    e.stopPropagation();
    const targetName = getCityName(itemToDelete).toLowerCase();
    const updated = favorites.filter((item) => getCityName(item).toLowerCase() !== targetName);
    setFavorites(updated);
    localStorage.setItem('weathernow_favorites', JSON.stringify(updated));
  };

  const handleCityClick = (item) => {
    const cityName = getCityName(item);
    const lat = typeof item === 'object' && item !== null ? item.latitude : null;
    const lon = typeof item === 'object' && item !== null ? item.longitude : null;
    onSelectCity(cityName, false, lat, lon);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unitSymbol = activeUnit === 'C' ? '°C' : '°F';

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 relative overflow-hidden border border-white/10 shadow-xl">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="font-outfit font-semibold text-base sm:text-lg text-white flex items-center gap-2">
            <IoLocationSharp className="text-blue-400" />
            Favorite Cities
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Real-time weather monitoring for pinned regions</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchFavWeather(true)}
            className="p-1.5 rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
            title="Refresh Live Weather"
          >
            <IoReloadOutline className="text-xs" />
          </button>

          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold font-outfit border transition-all duration-300 cursor-pointer ${isFavorite
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
          >
            {isFavorite ? (
              <>
                <IoStar className="text-xs text-yellow-400" />
                Pinned
              </>
            ) : (
              <>
                <IoStarOutline className="text-xs" />
                Pin Current Location
              </>
            )}
          </button>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-900/30 rounded-2xl border border-white/5">
          No favorite locations pinned yet. Click "Pin Current Location" to add cities here.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <AnimatePresence mode="popLayout">
            {favorites.map((item, idx) => {
              const cityName = getCityName(item);
              const itemId = getItemId(item);
              const details = favData[cityName];
              const isLoading = loadingMap[cityName];
              const isError = errorMap[cityName];
              const isCurrent = cityName.toLowerCase() === activeCityName.toLowerCase();

              return (
                <motion.div
                  key={itemId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  onClick={() => handleCityClick(item)}
                  className={`relative overflow-hidden group cursor-pointer p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${isCurrent
                      ? 'bg-blue-600/25 border-blue-500 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/40 scale-[1.02]'
                      : 'bg-slate-900/40 border-white/10 hover:border-white/25 hover:bg-slate-900/60 hover:scale-[1.01]'
                    }`}
                >
                  {/* Top Header Row: Country Code, Active Icon, Delete button */}
                  <div className="flex justify-between items-center z-10 w-full mb-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-extrabold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase border border-blue-500/20">
                        {details?.country || 'PK'}
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
                          <IoCheckmarkCircle className="text-[10px]" /> Active
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => deleteFavorite(e, item)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/25 dark:hover:bg-red-500/30 hover:text-red-600 dark:hover:text-red-300 hover:scale-110 transition-all duration-200 cursor-pointer shrink-0"
                      aria-label="Remove favorite city"
                      title="Remove pin"
                    >
                      <IoTrashOutline className="text-xs sm:text-sm text-red-500 dark:text-red-400" />
                    </button>
                  </div>

                  {/* City Name & Condition */}
                  <div className="z-10 my-0.5">
                    <h4 className="text-xs sm:text-sm font-bold font-outfit text-white truncate tracking-wide">
                      {cityName}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 capitalize truncate font-medium">
                      {isLoading
                        ? 'Loading...'
                        : isError
                          ? 'Unavailable'
                          : details?.condition || 'Clear Sky'}
                    </p>
                  </div>

                  {/* Temperature & Rain Chance Bottom Row */}
                  <div className="z-10 flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-sky-300" title="Chance of Rain">
                      <IoRainyOutline className="text-xs text-sky-400 flex-shrink-0" />
                      <span>
                        {isLoading ? '...' : isError ? 'N/A' : details?.rainChance !== undefined ? `${details.rainChance}%` : 'N/A'}
                      </span>
                    </div>

                    <span className="font-outfit font-black text-base sm:text-lg text-white">
                      {isLoading ? '...' : isError ? '--' : `${details?.temp ?? '--'}${unitSymbol}`}
                    </span>
                  </div>

                  {/* Subtle condition glow in card background */}
                  <div
                    className={`absolute bottom-0 right-0 w-12 h-12 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-300 ${details?.condition?.toLowerCase().includes('rain') || details?.condition?.toLowerCase().includes('thunderstorm')
                        ? 'bg-blue-500'
                        : details?.condition?.toLowerCase().includes('cloud')
                          ? 'bg-slate-400'
                          : 'bg-amber-500'
                      }`}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
