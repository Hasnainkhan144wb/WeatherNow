import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  IoClose,
  IoShareSocialOutline
} from 'react-icons/io5';
import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaTelegram,
  FaEnvelope,
  FaLink
} from 'react-icons/fa';

export const ShareModal = ({ isOpen, onClose, weatherData, activeUnit }) => {
  if (!isOpen || !weatherData) return null;

  const city = weatherData.city;
  const country = weatherData.country;
  const temp = `${weatherData.current.temp}°${activeUnit}`;
  const feelsLike = `${weatherData.current.feelsLike}°${activeUnit}`;
  const condition = weatherData.current.description || weatherData.current.condition;
  const humidity = `${weatherData.current.humidity}%`;
  const windSpeed = `${weatherData.current.windSpeed} km/h`;
  const rainChance = weatherData.daily?.[0]?.rainChance !== undefined ? `${weatherData.daily[0].rainChance}%` : 'N/A';

  const siteUrl = typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
    ? window.location.origin
    : 'https://weathernow.vercel.app';

  const shareText = `🌤 Weather Update

📍 ${city}, ${country}

🌡 Temperature: ${temp}
🤗 Feels Like: ${feelsLike}
☁ Condition: ${condition}
💧 Humidity: ${humidity}
💨 Wind: ${windSpeed}
🌧 Chance of Rain: ${rainChance}

Check the latest weather on WeatherNow 🌦
${siteUrl}`;

  const shareTitle = `Weather Update - ${city}, ${country}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: siteUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Could not open share menu.');
        }
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('✅ Link copied successfully!');
    } catch (e) {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
      action: () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      name: 'X (Twitter)',
      icon: FaTwitter,
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600/10 text-blue-400 border-blue-600/20 hover:bg-blue-600/20',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
      action: () => {
        const url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      name: 'Copy Link',
      icon: FaLink,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
      action: handleCopy
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-white/10 z-10"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <IoShareSocialOutline className="text-xl" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-xl text-white">
                  Share Weather
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Weather update for <span className="text-blue-400 font-semibold">{city}, {country}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Close"
            >
              <IoClose className="text-xl" />
            </button>
          </div>

          {/* Weather Card Preview Box */}
          <div className="my-5 p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 font-mono leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
            {shareText}
          </div>

          {/* Share Platform Buttons Grid */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {shareOptions.map((opt) => {
              const IconComp = opt.icon;
              return (
                <button
                  key={opt.name}
                  onClick={opt.action}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-95 ${opt.color}`}
                >
                  <IconComp className="text-2xl mb-1.5" />
                  <span className="text-xs font-semibold font-outfit">{opt.name}</span>
                </button>
              );
            })}
          </div>

          {/* Web Share API option if supported */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full mb-3 py-2.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <IoShareSocialOutline className="text-base" />
              Use System Share Sheet (Mobile)
            </button>
          )}

          {/* Modal Footer / Cancel Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs font-outfit transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
