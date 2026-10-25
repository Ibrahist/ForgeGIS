import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number | string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-[#121217] border border-white/5 gap-1 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#22222c] text-[#f5f5f7] shadow-sm border border-white/10'
                : 'text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/5'
            }`}
          >
            {tab.icon && <span className="w-3.5 h-3.5 inline-flex items-center">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
