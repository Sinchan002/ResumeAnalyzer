import React, { useEffect, useState } from 'react';

interface CircularGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
  showLabel = true,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = score / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Dynamic colors
  const getColor = (val: number) => {
    if (val >= 80) return { stroke: '#10b981', bg: '#ecfdf5', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Excellent Match' };
    if (val >= 65) return { stroke: '#f59e0b', bg: '#fffbeb', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Moderate Fit' };
    return { stroke: '#f43f5e', bg: '#fff1f2', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Needs Optimization' };
  };

  const theme = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Central Display Number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>
            {animatedScore}%
          </span>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
            Match Score
          </span>
        </div>
      </div>

      {showLabel && (
        <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${theme.badge}`}>
          {theme.label}
        </span>
      )}
    </div>
  );
};
