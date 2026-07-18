import React from 'react';
import { motion } from 'framer-motion';

export const WeatherChart = ({ hourlyData, unit }) => {
  if (!hourlyData || hourlyData.length === 0) return null;

  // Filter first 8 hours to show a neat 24-hour breakdown (3-hour intervals)
  const data = hourlyData.slice(0, 8);

  const temps = data.map(d => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  // Chart dimension configurations
  const width = 600;
  const height = 140;
  const paddingLeft = 30;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates for points
  const points = data.map((item, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    // Map temperature to y: higher temp is closer to the top (lower y value)
    const y = paddingTop + chartHeight - ((item.temp - minTemp) / tempRange) * chartHeight;
    return { x, y, temp: item.temp, time: item.time, condition: item.condition, rainChance: item.rainChance };
  });

  // Build SVG path
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    // Generate curved path (Catmull-Rom or simple bezier approximation)
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      // Control points for smooth bezier curve
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }

    // Generate closed area path for gradient filling
    areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  return (
    <div className="w-full overflow-x-auto pb-2 select-none scrollbar-thin">
      <div className="min-w-[620px] px-2 py-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            {/* Temperature gradient under the curve */}
            <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            {/* Glow filter for the temperature line */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={width - paddingRight}
            y2={paddingTop}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight / 2}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight / 2}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="rgba(255,255,255,0.1)"
          />

          {/* Render Area Path */}
          {areaD && (
            <motion.path
              d={areaD}
              fill="url(#tempAreaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          )}

          {/* Render Temperature Line */}
          {pathD && (
            <motion.path
              d={pathD}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )}

          {/* Render points, temps, times, and rain probability */}
          {points.map((pt, idx) => (
            <g key={idx}>
              {/* Rain Chance Bar (at the very bottom) */}
              {pt.rainChance > 0 && (
                <g>
                  <rect
                    x={pt.x - 4}
                    y={height - paddingBottom - (pt.rainChance / 100) * 25}
                    width="8"
                    height={(pt.rainChance / 100) * 25}
                    fill="#3b82f6"
                    opacity="0.3"
                    rx="2"
                  />
                  <text
                    x={pt.x}
                    y={height - paddingBottom - (pt.rainChance / 100) * 25 - 4}
                    textAnchor="middle"
                    className="fill-blue-400 font-sans font-medium text-[8px]"
                  >
                    {pt.rainChance}%
                  </text>
                </g>
              )}

              {/* Point Indicator */}
              <motion.circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-[#0b0f19] stroke-blue-400 stroke-[2.5]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.08, type: 'spring' }}
                whileHover={{ r: 6.5, strokeWidth: 3 }}
              />

              {/* Temperature text above point */}
              <motion.text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                className="fill-white font-sans font-bold text-xs"
                initial={{ opacity: 0, y: pt.y - 5 }}
                animate={{ opacity: 1, y: pt.y - 10 }}
                transition={{ delay: idx * 0.08 + 0.3 }}
              >
                {pt.temp}°
              </motion.text>

              {/* Time labels below chart */}
              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                className="fill-slate-400 font-sans font-medium text-[10px]"
              >
                {pt.time}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
