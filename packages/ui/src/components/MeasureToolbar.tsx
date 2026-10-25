import React from 'react';
import { Ruler, Pentagon, X, Trash2 } from 'lucide-react';
import {
  useProjectStore,
  calculatePathLengthMeters,
  calculatePolygonAreaSquareMeters,
  formatDistance,
  formatArea,
} from '@forgegis/core';
import { Button } from './Button';

export interface MeasureToolbarProps {
  className?: string;
}

export const MeasureToolbar: React.FC<MeasureToolbarProps> = ({ className = '' }) => {
  const { measureMode, measurePoints, setMeasureMode, clearMeasure } = useProjectStore();

  const isMeasuring = measureMode !== 'none';
  const distanceMeters = measureMode === 'distance' ? calculatePathLengthMeters(measurePoints) : 0;
  const areaSqMeters = measureMode === 'area' ? calculatePolygonAreaSquareMeters(measurePoints) : 0;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Distance Tool */}
      <Button
        variant="glass"
        size="sm"
        active={measureMode === 'distance'}
        onClick={() => setMeasureMode(measureMode === 'distance' ? 'none' : 'distance')}
        icon={<Ruler size={14} className={measureMode === 'distance' ? 'text-[#e3b450]' : ''} />}
        title="Measure Distance along line"
      >
        <span>Distance</span>
      </Button>

      {/* Area Tool */}
      <Button
        variant="glass"
        size="sm"
        active={measureMode === 'area'}
        onClick={() => setMeasureMode(measureMode === 'area' ? 'none' : 'area')}
        icon={<Pentagon size={14} className={measureMode === 'area' ? 'text-[#f47fa3]' : ''} />}
        title="Measure Area of polygon"
      >
        <span>Area</span>
      </Button>

      {/* Live Measurement HUD (Floating when active) */}
      {isMeasuring && (
        <div className="flex items-center gap-2 px-3 py-1 bg-[#121217]/95 border border-[#e3b450]/40 rounded-full shadow-lg backdrop-blur-md animate-fadeIn text-xs">
          <span className="font-mono text-[#e3b450] font-semibold">
            {measureMode === 'distance'
              ? formatDistance(distanceMeters)
              : formatArea(areaSqMeters)}
          </span>
          <span className="text-[#9d9da8] text-[10px] font-mono">
            ({measurePoints.length} {measurePoints.length === 1 ? 'pt' : 'pts'})
          </span>

          {measurePoints.length > 0 && (
            <button
              onClick={clearMeasure}
              className="p-1 rounded-full text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/10"
              title="Clear points"
            >
              <Trash2 size={11} />
            </button>
          )}

          <button
            onClick={() => setMeasureMode('none')}
            className="p-1 rounded-full text-[#9d9da8] hover:text-red-400 hover:bg-white/10 ml-0.5"
            title="Exit measurement mode"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
