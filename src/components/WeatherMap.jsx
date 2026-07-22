import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { IoMap } from 'react-icons/io5';

// Fix default leaflet marker icon asset path issues in React Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically recenter the map on position change without reloading entire map
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 10, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center, map]);
  return null;
}

// Custom SVG Location Pin
const createLocationPinIcon = () => {
  return L.divIcon({
    className: 'custom-location-pin',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 bg-blue-500/40 rounded-full animate-ping"></span>
        <div class="w-8 h-8 bg-gradient-to-tr from-blue-600 to-sky-400 border-2 border-white rounded-full flex items-center justify-center text-white shadow-xl transform transition-transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Custom Temperature Badge Marker
const createTempBadgeIcon = (temp, unitSymbol) => {
  return L.divIcon({
    className: 'custom-temp-badge',
    html: `
      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 text-white border border-blue-500/50 shadow-2xl font-bold font-outfit text-xs backdrop-blur-md hover:scale-110 transition-transform">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>${temp}${unitSymbol}</span>
      </div>
    `,
    iconSize: [75, 32],
    iconAnchor: [37, 16],
    popupAnchor: [0, -16]
  });
};

export const WeatherMap = ({ weatherData, activeUnit = 'C', theme = 'dark' }) => {
  const { t } = useTranslation();

  // Default coordinates fallback: Islamabad, Pakistan (33.6844, 73.0479)
  const defaultCoords = [33.6844, 73.0479];
  const targetCoords = weatherData?.coordinates?.lat && weatherData?.coordinates?.lon
    ? [weatherData.coordinates.lat, weatherData.coordinates.lon]
    : defaultCoords;

  const currentCity = weatherData?.fullName || weatherData?.city || 'Islamabad, Pakistan';
  const temp = weatherData?.current?.temp ?? '--';
  const unitSymbol = activeUnit === 'C' ? '°C' : '°F';
  const condition = weatherData?.current?.condition || 'Clear Sky';
  const humidity = weatherData?.current?.humidity ?? '--';
  const windSpeed = weatherData?.current?.windSpeed ?? '--';

  // Base tile layers based on theme
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const baseTileUrl = theme === 'dark' ? darkTileUrl : lightTileUrl;

  return (
    <div className="w-full glass-panel rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden my-6 border border-white/10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <IoMap className="text-xl" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-outfit text-white tracking-wide flex items-center gap-2">
              {t('sections.interactiveMap') || '🗺 Interactive Weather Map'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Real-time spatial visualization for {currentCity}
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden relative z-0 border border-white/10 shadow-inner">
        <MapContainer
          center={targetCoords}
          zoom={10}
          scrollWheelZoom={true}
          touchZoom={true}
          dragging={true}
          style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
        >
          <MapRecenter center={targetCoords} />

          {/* Base Map Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={baseTileUrl}
            subdomains="abcd"
            maxZoom={19}
          />

          {/* Current Location Pin Marker */}
          <Marker position={targetCoords} icon={createLocationPinIcon()}>
            <Popup className="custom-leaflet-popup">
              <div className="p-1 font-sans text-slate-900">
                <div className="font-bold text-sm text-blue-600 mb-0.5 flex items-center gap-1">
                  📍 Your Current Location
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  {currentCity}
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Weather Details Badge Marker */}
          <Marker position={targetCoords} icon={createTempBadgeIcon(temp, unitSymbol)}>
            <Popup className="custom-leaflet-popup">
              <div className="p-1.5 font-sans min-w-[160px] text-slate-900">
                <div className="font-bold text-sm text-amber-500 mb-1 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>🌤 Weather</span>
                  <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">{temp}{unitSymbol}</span>
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Condition:</span>
                    <span className="font-bold">{condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Humidity:</span>
                    <span className="font-bold">{humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wind:</span>
                    <span className="font-bold">{windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};
