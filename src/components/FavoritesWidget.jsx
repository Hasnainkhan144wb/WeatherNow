import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoStar, IoStarOutline, IoTrashOutline, IoLocationSharp } from 'react-icons/io5';
import { getWeatherData } from '../services/weatherService';

export const FavoritesWidget = ({ currentCity, onSelectCity, activeUnit }) => {
  const [favorites, setFavorites] = useState([]);
  const [favData, setFavData] = useState({});
  const [loading, setLoading] = useState(false);

  // Load favorites from localstorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('weathernow_favorites');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFavorites(parsed);
    } else {
      // Default initial favorites
      const defaults = ['New York', 'London', 'Tokyo', 'Dubai'];
      setFavorites(defaults);
      localStorage.setItem('weathernow_favorites', JSON.stringify(defaults));
    }
  }, []);

  // Fetch temperatures for each favorite city when favorites list or unit changes
  useEffect(() => {
    if (favorites.length === 0) return;

    const fetchFavWeather = async () => {
      setLoading(true);
      const dataMap = {};
      try {
        const promises = favorites.map(async (city) => {
          try {
            const data = await getWeatherData(city, activeUnit === 'C' ? 'metric' : 'imperial');
            dataMap[city] = {
              temp: data.current.temp,
              condition: data.current.condition,
              country: data.country
            };
          } catch (e) {
            console.error(`Failed fetching weather for favorite: ${city}`);
          }
        });
        await Promise.all(promises);
        setFavData(dataMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavWeather();
  }, [favorites, activeUnit]);

  const isFavorite = favorites.some(
    (c) => c.toLowerCase() === currentCity.toLowerCase()
  );

  const toggleFavorite = () => {
    let updated;
    if (isFavorite) {
      updated = favorites.filter(
        (c) => c.toLowerCase() !== currentCity.toLowerCase()
      );
    } else {
      // Avoid duplicates
      const exists = favorites.some(
        (c) => c.toLowerCase() === currentCity.toLowerCase()
      );
      if (!exists) {
        // Format city name nicely
        const capitalized = currentCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        updated = [...favorites, capitalized];
      } else {
        updated = favorites;
      }
    }
    setFavorites(updated);
    localStorage.setItem('weathernow_favorites', JSON.stringify(updated));
  };

  const deleteFavorite = (e, cityToDelete) => {
    e.stopPropagation(); // Stop city selection click
    const updated = favorites.filter((c) => c !== cityToDelete);
    setFavorites(updated);
    localStorage.setItem('weathernow_favorites', JSON.stringify(updated));
  };

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-outfit font-semibold text-lg text-white flex items-center gap-2">
            <IoLocationSharp className="text-blue-400" />
            Favorite Cities
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Quickly switch between pinned regions</p>
        </div>
        
        <button
          onClick={toggleFavorite}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-outfit border transition-all duration-300 ${
            isFavorite
              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          {isFavorite ? (
            <>
              <IoStar className="text-sm text-yellow-400" />
              Pinned
            </>
          ) : (
            <>
              <IoStarOutline className="text-sm" />
              Pin Location
            </>
          )}
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-500 font-medium">
          No favorite locations pinned yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {favorites.map((city, idx) => {
              const details = favData[city];
              const isCurrent = city.toLowerCase() === currentCity.toLowerCase();
              
              return (
                <motion.div
                  key={city}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  onClick={() => onSelectCity(city)}
                  className={`relative overflow-hidden group cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex justify-between items-center ${
                    isCurrent
                      ? 'bg-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-500/5'
                      : 'bg-slate-900/30 border-white/5 hover:border-white/20 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="z-10 truncate pr-4">
                    <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {details?.country || 'LOC'}
                    </span>
                    <span className="block text-sm font-semibold font-outfit text-white truncate mt-0.5">
                      {city}
                    </span>
                    <span className="block text-xs text-slate-400 mt-1 capitalize truncate">
                      {details?.condition || 'Loading...'}
                    </span>
                  </div>

                  <div className="z-10 flex flex-col items-end justify-between h-full">
                    {/* Delete Icon (Visible on hover) */}
                    <button
                      onClick={(e) => deleteFavorite(e, city)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 p-1 rounded-full hover:bg-white/5 transition-all duration-200 -mt-1 -mr-1"
                      title="Remove pin"
                    >
                      <IoTrashOutline size={14} />
                    </button>
                    
                    <span className="font-outfit font-bold text-lg text-white mt-2">
                      {details ? `${details.temp}°` : '--'}
                    </span>
                  </div>
                  
                  {/* Subtle color highlight in background */}
                  <div className={`absolute bottom-0 right-0 w-12 h-12 rounded-full blur-xl opacity-20 pointer-events-none transition-all duration-300 ${
                    details?.condition === 'Clear' ? 'bg-orange-500' :
                    details?.condition === 'Rain' || details?.condition === 'Thunderstorm' ? 'bg-blue-500' :
                    'bg-slate-500'
                  }`} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
