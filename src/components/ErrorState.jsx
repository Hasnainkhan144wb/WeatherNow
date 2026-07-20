import React from 'react';
import { motion } from 'framer-motion';
import {
  IoSearchOutline,
  IoWifiOutline,
  IoCloudOfflineOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoSpeedometerOutline,
  IoKeyOutline,
  IoHelpCircleOutline,
  IoRefreshOutline
} from 'react-icons/io5';

const ERROR_CONFIGS = {
  NOT_FOUND: {
    icon: IoSearchOutline,
    badge: '404 • City Not Found',
    title: '📍 City Not Found',
    description: "We couldn't find the city you entered. Please check the spelling and try again.",
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    primaryButtonText: 'Search Another City',
    primaryAction: 'search'
  },
  NETWORK_ERROR: {
    icon: IoWifiOutline,
    badge: 'Connection Error',
    title: '🌐 Connection Error',
    description: 'Unable to connect to the weather service. Please check your internet connection.',
    iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    primaryButtonText: 'Retry Connection',
    primaryAction: 'retry'
  },
  API_ERROR: {
    icon: IoCloudOfflineOutline,
    badge: 'Service Error',
    title: '⚠ Weather Service Unavailable',
    description: 'Our weather provider is temporarily unavailable. Please try again in a few minutes.',
    iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    primaryButtonText: 'Try Again',
    primaryAction: 'retry'
  },
  TIMEOUT: {
    icon: IoTimeOutline,
    badge: 'Request Timeout',
    title: '⌛ Request Timed Out',
    description: 'The server is taking too long to respond. Please try again.',
    iconColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    primaryButtonText: 'Retry Request',
    primaryAction: 'retry'
  },
  LOCATION_DENIED: {
    icon: IoLocationOutline,
    badge: 'Permission Required',
    title: '📍 Location Permission Required',
    description: 'Enable location permission to automatically detect your weather. Or search for a city manually.',
    iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    primaryButtonText: 'Search City',
    primaryAction: 'search'
  },
  RATE_LIMIT: {
    icon: IoSpeedometerOutline,
    badge: '429 • Rate Limit Exceeded',
    title: '🛑 Too Many Requests',
    description: 'Rate limit reached. Please wait a moment and try again.',
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    primaryButtonText: 'Try Again',
    primaryAction: 'retry'
  },
  UNAUTHORIZED: {
    icon: IoKeyOutline,
    badge: 'Authorization Error',
    title: '🔒 Access Restricted',
    description: 'Unable to authorize request or invalid parameters. Please try again.',
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    primaryButtonText: 'Search City',
    primaryAction: 'search'
  },
  UNKNOWN: {
    icon: IoHelpCircleOutline,
    badge: 'Unexpected Error',
    title: '😕 Unexpected Error',
    description: 'Something unexpected happened. Please refresh the page or try again.',
    iconColor: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    primaryButtonText: 'Try Again',
    primaryAction: 'retry'
  }
};

export const ErrorState = ({ error, onRetry, onSearchCity }) => {
  const errorType = error?.type || 'UNKNOWN';
  const config = ERROR_CONFIGS[errorType] || ERROR_CONFIGS.UNKNOWN;
  const IconComponent = config.icon;

  const handlePrimaryClick = () => {
    if (config.primaryAction === 'search') {
      if (onSearchCity) onSearchCity();
    } else {
      if (onRetry) onRetry();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto my-12 px-4"
    >
      <div className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-white/10 text-center backdrop-blur-xl">
        {/* Decorative subtle background glows */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Floating Icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-5 rounded-3xl border ${config.iconColor} shadow-xl animate-float flex items-center justify-center`}>
            <IconComponent className="text-5xl" />
          </div>
        </div>

        {/* Error Category Badge */}
        <div className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border bg-white/5 border-white/10 text-slate-400 mb-4">
          {config.badge}
        </div>

        {/* Error Heading Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white tracking-tight mb-3">
          {config.title}
        </h2>

        {/* Friendly Description */}
        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-sm mx-auto mb-8">
          {config.description}
        </p>

        {/* Interactive Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handlePrimaryClick}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-outfit text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {config.primaryAction === 'search' ? (
              <>
                <IoSearchOutline className="text-base" />
                {config.primaryButtonText}
              </>
            ) : (
              <>
                <IoRefreshOutline className="text-base" />
                {config.primaryButtonText}
              </>
            )}
          </button>

          {config.primaryAction === 'search' ? (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold font-outfit text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <IoRefreshOutline className="text-base text-slate-400" />
              🔄 Retry
            </button>
          ) : (
            <button
              onClick={onSearchCity}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold font-outfit text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <IoSearchOutline className="text-base text-slate-400" />
              🔍 Search Another City
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
