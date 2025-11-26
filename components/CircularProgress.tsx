import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  value?: string | number;
  subtitle?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 200,
  strokeWidth = 20,
  color = '#3b82f6',
  label,
  value,
  subtitle
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-slate-900">{value || `${percentage}%`}</div>
        {label && (
          <div className="text-xs text-slate-600 font-medium mt-1">{label}</div>
        )}
      </div>
      {subtitle && (
        <div className="text-sm text-slate-600 mt-2 text-center">{subtitle}</div>
      )}
    </div>
  );
};

export default CircularProgress;
