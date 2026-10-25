import React from 'react';
import {
  Plus,
  Terminal,
  Wrench,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { useProjectStore } from '@forgegis/core';
import { Button, Pill } from '@forgegis/ui';

export interface HeaderProps {
  onOpenAddLayer: () => void;
  onOpenSqlWorkspace?: () => void;
  onOpenToolbox?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddLayer,
  onOpenSqlWorkspace,
  onOpenToolbox,
  className = '',
}) => {
  const { project, setViewState, exportProject, loadProject } = useProjectStore();

  const handleSaveProject = () => {
    const proj = exportProject();
    const jsonStr = JSON.stringify(proj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}.project.json`;
    a.click();
  };

  const handleOpenProjectFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.project.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          loadProject(parsed);
        } catch (err) {
          alert('Failed to load project file: ' + err);
        }
      }
    };
    input.click();
  };

  const handleResetView = () => {
    setViewState({
      longitude: -122.4194,
      latitude: 37.7749,
      zoom: 11,
      pitch: 0,
      bearing: 0,
    });
  };

  return (
    <header
      className={`h-14 bg-[#0e0e13] border-b border-white/8 px-4 flex items-center justify-between z-30 select-none ${className}`}
    >
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="ForgeGIS" className="w-8 h-8 rounded-xl shadow-md" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-[#f5f5f7]">
                Forge<span className="text-[#f47fa3]">GIS</span>
              </span>
              <span className="text-[10px] font-mono text-[#e3b450] px-1.5 py-0.2 rounded-full bg-[#e3b450]/10 border border-[#e3b450]/20">
                v0.1.0
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center">
          <Pill label="Coastal & Marine Intelligence" variant="rose" dot />
        </div>
      </div>

      {/* Center Tool Navigation */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddLayer}
          icon={<Plus size={14} />}
        >
          Add Layer
        </Button>

        <Button
          variant="glass"
          size="sm"
          onClick={onOpenSqlWorkspace}
          icon={<Terminal size={14} className="text-[#38bdf8]" />}
          title="Open DuckDB-WASM Spatial SQL Workspace"
        >
          Spatial SQL
        </Button>

        <Button
          variant="glass"
          size="sm"
          onClick={onOpenToolbox}
          icon={<Wrench size={14} className="text-[#e3b450]" />}
          title="Open Geoprocessing Toolbox"
        >
          Toolbox
        </Button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="subtle"
          size="sm"
          onClick={handleOpenProjectFile}
          icon={<Upload size={13} />}
          title="Open .project.json"
        >
          Open
        </Button>

        <Button
          variant="subtle"
          size="sm"
          onClick={handleSaveProject}
          icon={<Download size={13} />}
          title="Save .project.json"
        >
          Save
        </Button>

        <Button
          variant="subtle"
          size="sm"
          onClick={handleResetView}
          icon={<RotateCcw size={13} />}
          title="Reset initial view"
        />

        <a
          href="https://github.com/opengeos/GeoLibre"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/5 rounded-full transition-colors ml-1"
          title="Documentation & Source"
        >
          <BookOpen size={16} />
        </a>
      </div>
    </header>
  );
};
