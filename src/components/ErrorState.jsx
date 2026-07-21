import React from 'react';
import { useTranslation } from 'react-i18next';
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
    badgeKey: '404 • City Not Found',
    titleKey: 'errors.cityNotFound',
    descKey: 'errors.cityNotFoundDesc',
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    primaryAction: 'search'
  },
  NETWORK_ERROR: {
    icon: IoWifiOutline,
    badgeKey: 'Connection Error',
    titleKey: 'errors.connectionError',
    descKey: 'errors.connectionErrorDesc',
    iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    primaryAction: 'retry'
  },
  API_ERROR: {
    icon: IoCloudOfflineOutline,
    badgeKey: 'Service Error',
    titleKey: 'errors.serviceUnavailable',
    descKey: 'errors.serviceUnavailableDesc',
    iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    primaryAction: 'retry'
  },
  TIMEOUT: {
    icon: IoTimeOutline,
    badgeKey: 'Request Timeout',
    titleKey: 'errors.timeout',
    descKey: 'errors.timeoutDesc',
    iconColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    primaryAction: 'retry'
  },
  LOCATION_DENIED: {
    icon: IoLocationOutline,
    badgeKey: 'Permission Required',
    titleKey: 'errors.locationDenied',
    descKey: 'errors.locationDeniedDesc',
    iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    primaryAction: 'search'
  },
  RATE_LIMIT: {
    icon: IoSpeedometerOutline,
    badgeKey: '429 • Limit Exceeded',
    titleKey: 'errors.rateLimit',
    descKey: 'errors.rateLimitDesc',
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    primaryAction: 'retry'
  },
  UNAUTHORIZED: {
    icon: IoKeyOutline,
    badgeKey: 'Authorization Error',
    titleKey: 'errors.accessRestricted',
    descKey: 'errors.accessRestrictedDesc',
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    primaryAction: 'search'
  },
  UNKNOWN: {
    icon: IoHelpCircleOutline,
    badgeKey: 'Unexpected Error',
    titleKey: 'errors.unexpected',
    descKey: 'errors.unexpectedDesc',
    iconColor: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    primaryAction: 'retry'
  }
};

export const ErrorState = ({ error, onRetry, onSearchCity }) => {
  const { t } = useTranslation();
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
          {config.badgeKey}
        </div>

        {/* Error Heading Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white tracking-tight mb-3">
          {t(config.titleKey)}
        </h2>

        {/* Friendly Description */}
        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-sm mx-auto mb-8">
          {t(config.descKey)}
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
                {t('buttons.searchAnotherCity')}
              </>
            ) : (
              <>
                <IoRefreshOutline className="text-base" />
                {t('buttons.retry')}
              </>
            )}
          </button>

          {config.primaryAction === 'search' ? (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold font-outfit text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <IoRefreshOutline className="text-base text-slate-400" />
              🔄 {t('buttons.retry')}
            </button>
          ) : (
            <button
              onClick={onSearchCity}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold font-outfit text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <IoSearchOutline className="text-base text-slate-400" />
              🔍 {t('buttons.searchAnotherCity')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
