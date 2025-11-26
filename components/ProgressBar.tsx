import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  maxValue,
  color = '#3b82f6',
  showPercentage = true
}) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{value.toLocaleString()}</span>
          {showPercentage && (
            <span className="text-xs text-slate-500">({percentage.toFixed(0)}%)</span>
          )}
        </div>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
