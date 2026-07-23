import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { IoGlobeOutline, IoChevronDown } from 'react-icons/io5';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰', dir: 'rtl' }
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang.code);
    localStorage.setItem('weathernow_language', lang.code);
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-40 shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-1.5 px-3 sm:px-4 py-2 h-10 w-28 sm:w-36 rounded-full text-xs font-semibold font-outfit bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer shadow-sm active:scale-95 shrink-0"
        title="Switch Language"
      >
        <IoGlobeOutline className="text-sm text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="flex items-center gap-1 truncate max-w-[55px] sm:max-w-none">
          <span className="shrink-0">{currentLang.flag}</span>
          <span className="truncate">{currentLang.label}</span>
        </span>
        <IoChevronDown className={`text-xs text-slate-500 dark:text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-32 sm:w-36 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700/60 shadow-2xl bg-white dark:bg-slate-900 backdrop-blur-xl z-[10002] overflow-hidden"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium font-outfit transition-all duration-150 cursor-pointer ${i18n.language === lang.code
                  ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-500/20'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="shrink-0">{lang.flag}</span>
                  <span className="truncate">{lang.label}</span>
                </span>
                {i18n.language === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
