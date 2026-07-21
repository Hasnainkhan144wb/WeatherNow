import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloudOfflineOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

export const NetworkBanner = ({ isOnline, showRestoredBanner }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -70, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-50 bg-rose-600/95 text-white backdrop-blur-md shadow-2xl border-b border-rose-400/30 px-4 py-3 flex items-center justify-center text-center gap-3 text-xs sm:text-sm font-semibold font-outfit"
        >
          <IoCloudOfflineOutline className="text-xl animate-bounce text-white flex-shrink-0" />
          <span>
            <strong>❌ {t('network.noInternet')}</strong> — {t('network.checkInternet')}
          </span>
        </motion.div>
      )}

      {isOnline && showRestoredBanner && (
        <motion.div
          key="online-banner"
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -70, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-50 bg-emerald-600/95 text-white backdrop-blur-md shadow-2xl border-b border-emerald-400/30 px-4 py-3 flex items-center justify-center text-center gap-3 text-xs sm:text-sm font-semibold font-outfit"
        >
          <IoCheckmarkCircleOutline className="text-xl text-white flex-shrink-0" />
          <span>
            <strong>✅ {t('network.connectionRestored')}</strong> — {t('network.updatingData')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
