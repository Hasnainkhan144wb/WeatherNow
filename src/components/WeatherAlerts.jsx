import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoAlertCircle, 
  IoCheckmarkCircle, 
  IoNotifications, 
  IoFlame, 
  IoRainy, 
  IoThunderstorm, 
  IoSunny, 
  IoSnow, 
  IoSpeedometer,
  IoWater,
  IoWarning
} from 'react-icons/io5';

export const WeatherAlerts = ({ alerts = [], cityName = '', fullName = '' }) => {
  const [activeCategory, setActiveCategory] = useState('weather');

  const displayLocation = fullName || cityName || 'Your Location';

  // Severity color maps
  const severityStyles = {
    Extreme: {
      cardBg: 'bg-red-950/30 dark:bg-red-950/40 border-red-500/30 text-red-400',
      badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
      iconBg: 'bg-red-500/20 text-red-400',
      indicator: 'bg-red-500 animate-ping'
    },
    High: {
      cardBg: 'bg-orange-950/30 dark:bg-orange-950/40 border-orange-500/30 text-orange-400',
      badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      iconBg: 'bg-orange-500/20 text-orange-400',
      indicator: 'bg-orange-500 animate-pulse'
    },
    Moderate: {
      cardBg: 'bg-amber-950/30 dark:bg-amber-950/40 border-amber-500/30 text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
      indicator: 'bg-amber-400'
    },
    Low: {
      cardBg: 'bg-blue-950/30 dark:bg-blue-950/40 border-blue-500/30 text-blue-400',
      badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      iconBg: 'bg-blue-500/20 text-blue-400',
      indicator: 'bg-blue-400'
    },
    Safe: {
      cardBg: 'bg-emerald-950/20 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      indicator: 'bg-emerald-400'
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <IoNotifications className="text-xl animate-bounce" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-outfit text-white tracking-wide flex items-center gap-2">
              🔔 Weather Alerts
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Live meteorological warnings for <span className="text-blue-400 font-semibold">{displayLocation}</span>
            </p>
          </div>
        </div>

        {/* Future Ready Category Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveCategory('weather')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
              activeCategory === 'weather'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weather Alerts
          </button>
          <button
            onClick={() => setActiveCategory('air')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
              activeCategory === 'air'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Air Quality & Environmental Alerts"
          >
            Air & Pollen
          </button>
          <button
            onClick={() => setActiveCategory('seismic')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
              activeCategory === 'seismic'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Seismic & Geo Hazards"
          >
            Geological
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-4">
        {activeCategory !== 'weather' ? (
          /* Future-Ready Layer Placeholder */
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col items-center justify-center">
            <IoCheckmarkCircle className="text-emerald-400 text-3xl mb-2" />
            <h3 className="text-sm font-bold text-white font-outfit capitalize">
              No active {activeCategory} advisories
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Environmental monitoring is normal for {displayLocation}.
            </p>
          </div>
        ) : alerts && alerts.length > 0 ? (
          /* Active Severe Weather Alerts List */
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {alerts.map((alert, index) => {
                const style = severityStyles[alert.severity] || severityStyles.Moderate;
                return (
                  <motion.div
                    key={alert.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-5 rounded-2xl border ${style.cardBg} relative overflow-hidden backdrop-blur-md shadow-md transition-all duration-300`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl ${style.iconBg} text-2xl flex-shrink-0`}>
                        <span>{alert.icon || '⚠'}</span>
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-outfit font-black text-base text-white tracking-wide">
                              {alert.event}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${style.indicator}`} />
                          </div>

                          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${style.badgeBg}`}>
                            Severity: {alert.severity || 'High'}
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 mt-2 leading-relaxed font-medium">
                          {alert.description}
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[11px] text-slate-400 font-semibold">
                          <span>📍 Location: {displayLocation}</span>
                          <span>🕒 {alert.time || 'Updated just now'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State: No severe weather alerts */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-4 shadow-sm"
          >
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl text-2xl flex-shrink-0">
              <IoCheckmarkCircle />
            </div>
            <div>
              <h3 className="font-outfit font-bold text-base text-emerald-300 flex items-center gap-2">
                ✅ No active weather alerts for this location.
              </h3>
              <p className="text-xs text-emerald-200/80 mt-1 font-medium">
                The weather is currently normal in {displayLocation}. No severe storm, heatwave, or flood warnings issued.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
