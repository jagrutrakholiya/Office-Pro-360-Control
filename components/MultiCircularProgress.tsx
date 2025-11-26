import React from 'react';

interface MultiCircularProgressProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
    percentage: number;
  }>;
  centerLabel?: string;
  centerValue?: string | number;
}

const MultiCircularProgress: React.FC<MultiCircularProgressProps> = ({
  data,
  centerLabel,
  centerValue
}) => {
  const size = 280;
  const center = size / 2;
  const baseRadius = 100;
  const strokeWidth = 24;
  const gap = 8;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, index) => {
          const radius = baseRadius - (index * (strokeWidth + gap));
          const circumference = radius * 2 * Math.PI;
          const offset = circumference - (item.percentage / 100) * circumference;

          return (
            <React.Fragment key={index}>
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ transitionDelay: `${index * 100}ms` }}
              />
            </React.Fragment>
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-slate-900">{centerValue}</div>
        {centerLabel && (
          <div className="text-sm text-slate-600 font-medium mt-1">{centerLabel}</div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-900">{item.value}</span>
              <span 
                className={`text-sm font-semibold px-2 py-1 rounded ${
                  item.percentage > 0 ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'
                }`}
              >
                {item.percentage > 0 ? `+${item.percentage.toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiCircularProgress;
