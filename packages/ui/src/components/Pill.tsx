import React from 'react';

export interface PillProps {
  label: string;
  variant?: 'rose' | 'gold' | 'cyan' | 'emerald' | 'default';
  dot?: boolean;
  count?: number | string;
  className?: string;
  onClick?: () => void;
}

export const Pill: React.FC<PillProps> = ({
  label,
  variant = 'default',
  dot = false,
  count,
  className = '',
  onClick,
}) => {
  const variantStyles = {
    default: 'bg-white/5 border-white/10 text-[#f5f5f7]',
    rose: 'bg-[#f47fa3]/10 border-[#f47fa3]/30 text-[#f47fa3]',
    gold: 'bg-[#e3b450]/10 border-[#e3b450]/30 text-[#fbe7a1]',
    cyan: 'bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8]',
    emerald: 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399]',
  }[variant];

  const dotColors = {
    default: 'bg-white/50',
    rose: 'bg-[#f47fa3]',
    gold: 'bg-[#e3b450]',
    cyan: 'bg-[#38bdf8]',
    emerald: 'bg-[#34d399]',
  }[variant];

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium tracking-wide transition-all ${variantStyles} ${
        onClick ? 'cursor-pointer hover:bg-white/10' : ''
      } ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors} animate-pulse`} />}
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-0.5 px-1 py-0.2 rounded-full bg-white/10 text-[9px] font-mono opacity-80">
          {count}
        </span>
      )}
    </span>
  );
};
