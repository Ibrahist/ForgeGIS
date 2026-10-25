import React from 'react';

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 1,
  step = 0.05,
  onChange,
  label,
  unit = '',
  className = '',
}) => {
  const percentage = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || unit) && (
        <div className="flex justify-between items-center text-[11px] text-[#9d9da8]">
          {label && <span>{label}</span>}
          <span className="font-mono text-[#f5f5f7]">
            {unit === '%' ? `${percentage}%` : `${value}${unit}`}
          </span>
        </div>
      )}
      <div className="relative flex items-center h-4 group">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[#22222c] rounded-full appearance-none cursor-pointer accent-[#f47fa3] focus:outline-none"
        />
      </div>
    </div>
  );
};
