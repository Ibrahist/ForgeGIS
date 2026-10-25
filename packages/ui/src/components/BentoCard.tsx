import React from 'react';

export interface BentoCardProps {
  index?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  index,
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
}) => {
  return (
    <div
      className={`relative flex flex-col p-5 rounded-2xl bg-[#181820] border border-white/8 hover:border-white/15 transition-all shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-[#f47fa3]">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              {index && (
                <span className="font-mono text-[10px] text-[#e3b450] tracking-wider uppercase">
                  {index}
                </span>
              )}
              <h4 className="text-xs font-semibold text-[#f5f5f7] tracking-tight">{title}</h4>
            </div>
            {subtitle && <p className="text-[11px] text-[#9d9da8] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};
