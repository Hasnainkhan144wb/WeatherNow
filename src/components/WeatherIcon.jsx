import React from 'react';
import { motion } from 'framer-motion';
import {
  WiDaySunny,
  WiNightClear,
  WiCloudy,
  WiRain,
  WiShowers,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiDayCloudy,
  WiNightAltCloudy
} from 'react-icons/wi';

export const WeatherIcon = ({ condition, size = 48, className = "", isNight = false, animated = true }) => {
  const cond = condition ? condition.toLowerCase() : '';

  const renderIcon = () => {
    switch (cond) {
      case 'clear':
        return isNight ? (
          <WiNightClear size={size} className={`${className} text-indigo-200`} />
        ) : (
          <WiDaySunny size={size} className={`${className} text-amber-400`} />
        );

      case 'clouds':
        return isNight ? (
          <WiNightAltCloudy size={size} className={`${className} text-slate-400`} />
        ) : (
          <WiDayCloudy size={size} className={`${className} text-slate-300`} />
        );

      case 'rain':
        return <WiRain size={size} className={`${className} text-blue-400`} />;

      case 'drizzle':
        return <WiShowers size={size} className={`${className} text-teal-300`} />;

      case 'thunderstorm':
        return <WiThunderstorm size={size} className={`${className} text-purple-400`} />;

      case 'snow':
        return <WiSnow size={size} className={`${className} text-sky-200`} />;

      case 'atmosphere':
      case 'mist':
      case 'haze':
      case 'fog':
        return <WiFog size={size} className={`${className} text-slate-400`} />;

      default:
        return isNight ? (
          <WiNightClear size={size} className={`${className} text-slate-300`} />
        ) : (
          <WiDaySunny size={size} className={`${className} text-slate-300`} />
        );
    }
  };

  if (!animated) {
    return renderIcon();
  }

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="inline-block"
    >
      {renderIcon()}
    </motion.div>
  );
};
