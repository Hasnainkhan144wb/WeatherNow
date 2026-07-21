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
    <div className="relative z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-outfit bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
        title="Switch Language"
      >
        <IoGlobeOutline className="text-sm text-blue-400" />
        <span className="flex items-center gap-1">
          <span>{currentLang.flag}</span>
          <span>{currentLang.label}</span>
        </span>
        <IoChevronDown className={`text-xs text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-36 glass-panel rounded-2xl p-1.5 border border-white/10 shadow-2xl bg-slate-950/95 backdrop-blur-xl z-50 overflow-hidden"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium font-outfit transition-all duration-150 cursor-pointer ${i18n.language === lang.code
                  ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
                {i18n.language === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
