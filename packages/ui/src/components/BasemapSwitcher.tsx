import React, { useState } from 'react';
import { Globe, Map, Mountain, Compass, ChevronDown } from 'lucide-react';
import { useProjectStore, DEFAULT_BASEMAPS } from '@forgegis/core';
import { Button } from './Button';

export interface BasemapSwitcherProps {
  className?: string;
}

export const BasemapSwitcher: React.FC<BasemapSwitcherProps> = ({ className = '' }) => {
  const { project, setBasemap, toggle3dTerrain, setProjection, setViewState } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeBasemap = project.basemap;
  const isGlobe = project.view.projection === 'globe';
  const is3d = project.view.terrain3d.enabled;

  const toggleGlobe = () => {
    setProjection(isGlobe ? 'mercator' : 'globe');
  };

  const resetBearing = () => {
    setViewState({ bearing: 0, pitch: is3d ? 50 : 0 });
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Basemap Pill Dropdown */}
      <div className="relative">
        <Button
          variant="glass"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          icon={<Map size={14} className="text-[#38bdf8]" />}
        >
          <span>{activeBasemap.name}</span>
          <ChevronDown size={12} className="opacity-60" />
        </Button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 p-1.5 bg-[#121217] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col gap-1 backdrop-blur-md">
            <div className="px-2.5 py-1 text-[10px] font-mono text-[#9d9da8] uppercase tracking-wider">
              Basemap Style
            </div>
            {DEFAULT_BASEMAPS.map((bm) => {
              const isSelected = bm.id === activeBasemap.id;
              return (
                <button
                  key={bm.id}
                  onClick={() => {
                    setBasemap(bm);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    isSelected
                      ? 'bg-[#22222c] text-[#f47fa3] font-medium'
                      : 'text-[#f5f5f7] hover:bg-white/5'
                  }`}
                >
                  <span>{bm.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#f47fa3]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Globe Toggle */}
      <Button
        variant="glass"
        size="sm"
        active={isGlobe}
        onClick={toggleGlobe}
        icon={<Globe size={14} className={isGlobe ? 'text-[#f47fa3]' : 'text-[#9d9da8]'} />}
        title={isGlobe ? 'Switch to 2D Mercator Map' : 'Switch to 3D Globe Projection'}
      >
        <span>{isGlobe ? 'Globe' : '2D Map'}</span>
      </Button>

      {/* 3D Terrain Toggle */}
      <Button
        variant="glass"
        size="sm"
        active={is3d}
        onClick={toggle3dTerrain}
        icon={<Mountain size={14} className={is3d ? 'text-[#e3b450]' : 'text-[#9d9da8]'} />}
        title={is3d ? 'Disable 3D terrain pitch' : 'Enable 3D terrain & pitch'}
      >
        <span>3D</span>
      </Button>

      {/* North Compass / Reset Bearing */}
      {(project.view.bearing !== 0 || project.view.pitch !== 0) && (
        <Button
          variant="glass"
          size="sm"
          onClick={resetBearing}
          icon={
            <Compass
              size={14}
              style={{ transform: `rotate(${-project.view.bearing}deg)` }}
              className="text-[#f47fa3] transition-transform"
            />
          }
          title="Reset map orientation to North"
        />
      )}
    </div>
  );
};
