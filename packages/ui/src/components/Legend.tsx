import React, { useState } from 'react';
import { List, ChevronUp, ChevronDown } from 'lucide-react';
import { useProjectStore, buildLegendForStyle } from '@forgegis/core';

export interface LegendProps {
  className?: string;
}

export const Legend: React.FC<LegendProps> = ({ className = '' }) => {
  const { project } = useProjectStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Collect active visible layers
  const visibleLayers = project.layers.filter((l) => l.visible);

  if (visibleLayers.length === 0) return null;

  return (
    <div
      className={`bg-[#121217]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden text-xs flex flex-col w-64 max-h-80 transition-all ${className}`}
    >
      {/* Header */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between px-3.5 py-2.5 bg-[#181820] border-b border-white/6 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <List size={13} className="text-[#e3b450]" />
          <span className="font-semibold text-[#f5f5f7] tracking-tight">Legend</span>
        </div>
        <button className="text-[#9d9da8] hover:text-[#f5f5f7]">
          {isCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3 overflow-y-auto space-y-3.5 divide-y divide-white/5">
          {visibleLayers.map((layer) => {
            const legend = buildLegendForStyle(layer.id, layer.name, layer.style);
            return (
              <div key={layer.id} className="pt-2 first:pt-0 space-y-1.5">
                <div className="font-medium text-[#f5f5f7] truncate text-[11px]">
                  {legend.layerName}
                </div>

                {legend.type === 'graduated' ? (
                  <div className="space-y-1">
                    <div className="flex h-2.5 rounded-full overflow-hidden border border-white/10">
                      {legend.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex-1 h-full"
                          style={{ backgroundColor: item.color }}
                          title={item.label}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-[#9d9da8]">
                      <span>{legend.items[0]?.label.split('-')[0]?.trim()}</span>
                      <span>
                        {legend.items[legend.items.length - 1]?.label.split('-')[1]?.trim()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {legend.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[11px] text-[#9d9da8] truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
