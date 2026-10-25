import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@forgegis/ui/styles/tokens.css';
import '@forgegis/ui/styles/theme.css';
import { Pill } from '@forgegis/ui';
import { Monitor, HardDrive, Cpu } from 'lucide-react';

export const DesktopApp: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<{
    os: string;
    arch: string;
    is_desktop: boolean;
  }>({
    os: 'Windows (Desktop Shell)',
    arch: 'x86_64',
    is_desktop: true,
  });

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0a0c] text-[#f5f5f7] select-none">
      {/* Desktop Native Window Titlebar */}
      <div className="h-8 bg-[#0a0a0c] border-b border-white/6 flex items-center justify-between px-3 text-xs z-50">
        <div className="flex items-center gap-2">
          <Monitor size={12} className="text-[#e3b450]" />
          <span className="font-semibold text-[11px] text-[#f5f5f7]">
            ForgeGIS Desktop Shell (Tauri v2)
          </span>
          <Pill label="Native Rust Runtime" variant="gold" />
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono text-[#9d9da8]">
          <span className="flex items-center gap-1">
            <Cpu size={11} className="text-[#38bdf8]" />
            {systemInfo.arch}
          </span>
          <span className="flex items-center gap-1">
            <HardDrive size={11} className="text-[#34d399]" />
            Zero-Sandbox Direct I/O
          </span>
        </div>
      </div>

      {/* Main App Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-[#181820] border border-white/10 max-w-lg space-y-3">
          <h2 className="text-sm font-bold text-[#f5f5f7]">Tauri v2 Native Desktop Container</h2>
          <p className="text-xs text-[#9d9da8] leading-relaxed">
            Running locally on your OS with direct hardware acceleration, native file dialogs, and high-performance GeoParquet streaming.
          </p>
          <div className="grid grid-cols-2 gap-2 text-left text-[11px] font-mono pt-2">
            <div className="p-2 rounded bg-white/5 border border-white/5">
              <span className="text-[#9d9da8] block">Platform</span>
              <span className="text-[#34d399]">{systemInfo.os}</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/5">
              <span className="text-[#9d9da8] block">Filesystem</span>
              <span className="text-[#e3b450]">Direct C/Rust I/O</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DesktopApp />
  </React.StrictMode>
);
