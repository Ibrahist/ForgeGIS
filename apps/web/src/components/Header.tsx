import {
  Plus,
  Terminal,
  Wrench,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  Share2,
} from 'lucide-react';
import { useProjectStore } from '@forgegis/core';
import { Button, Pill } from '@forgegis/ui';

export interface HeaderProps {
  onOpenAddLayer: () => void;
  onOpenSqlWorkspace?: () => void;
  onOpenToolbox?: () => void;
  onOpenShareModal?: (tab?: 'project' | 'html' | 'embed') => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddLayer,
  onOpenSqlWorkspace,
  onOpenToolbox,
  onOpenShareModal,
  className = '',
}) => {
  const { setViewState } = useProjectStore();

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
          onClick={() => onOpenShareModal?.('project')}
          icon={<Upload size={13} />}
          title="Open or Import .project.json"
        >
          Open
        </Button>

        <Button
          variant="subtle"
          size="sm"
          onClick={() => onOpenShareModal?.('project')}
          icon={<Download size={13} />}
          title="Save .project.json"
        >
          Save
        </Button>

        <Button
          variant="glass"
          size="sm"
          onClick={() => onOpenShareModal?.('html')}
          icon={<Share2 size={13} className="text-[#e3b450]" />}
          title="Export Standalone HTML Report or Embed Iframe"
        >
          Share
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
