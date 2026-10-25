import React from 'react';
import { Modal } from './Modal';
import { Pill } from './Pill';
import { Keyboard, Navigation, Wrench, Layers } from 'lucide-react';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KEYBOARD_SHORTCUTS = [
  {
    category: 'Map Navigation',
    icon: <Navigation size={14} className="text-[#38bdf8]" />,
    shortcuts: [
      { key: '+ / -', description: 'Zoom map camera in / out' },
      { key: '0', description: 'Reset camera bearing to North' },
      { key: 'Shift + Drag', description: 'Box zoom or adjust camera pitch/bearing' },
      { key: 'Arrow Keys', description: 'Pan map viewport smoothly' },
    ],
  },
  {
    category: 'Tools & Workspaces',
    icon: <Wrench size={14} className="text-[#e3b450]" />,
    shortcuts: [
      { key: 'M', description: 'Toggle Distance / Area Geodesic Measurement' },
      { key: 'S', description: 'Open DuckDB-WASM Spatial SQL Workspace' },
      { key: 'T', description: 'Open In-Browser Geoprocessing Toolbox (17 WASM Tools)' },
      { key: 'P', description: 'Open Modular Plugin Ecosystem Manager' },
      { key: 'Y', description: 'Open In-Browser Python Workspace (Pyodide WASM)' },
      { key: 'G', description: 'Open Coastal Open-Data Demo Projects Gallery' },
    ],
  },
  {
    category: 'Layer & Project Management',
    icon: <Layers size={14} className="text-[#f47fa3]" />,
    shortcuts: [
      { key: 'L', description: 'Collapse / Expand Layers Panel' },
      { key: 'A', description: 'Open Add Layer Modal (Drag & Drop, Presets)' },
      { key: 'E', description: 'Open Project Sharing & HTML Exporters' },
      { key: '?', description: 'Open this Keyboard Shortcuts Cheat-Sheet' },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts & Hotkeys"
      subtitle="Power-user hotkeys for swift geospatial exploration and analytical workflows"
      size="md"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {KEYBOARD_SHORTCUTS.map((section) => (
          <div key={section.category} className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f5f5f7] pb-1 border-b border-white/5">
              {section.icon}
              <span>{section.category}</span>
            </div>

            <div className="space-y-1.5">
              {section.shortcuts.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#181820] border border-white/4 text-xs"
                >
                  <span className="text-[#9d9da8]">{s.description}</span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-[#0a0a0c] border border-white/10 font-mono text-[11px] text-[#e3b450] shadow-sm">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
