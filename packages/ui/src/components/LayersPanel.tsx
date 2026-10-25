import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Trash2,
  Palette,
  Table,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Layers,
  Plus,
  Sliders,
} from 'lucide-react';
import { ForgeLayer, useProjectStore } from '@forgegis/core';
import { Button } from './Button';
import { Slider } from './Slider';
import { Pill } from './Pill';

export interface LayersPanelProps {
  onAddLayerClick: () => void;
  className?: string;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ onAddLayerClick, className = '' }) => {
  const {
    project,
    selectedLayerId,
    setSelectedLayer,
    toggleLayerVisibility,
    setLayerOpacity,
    renameLayer,
    removeLayer,
    reorderLayers,
    zoomToLayer,
    openStyleEditor,
    openAttributeTable,
  } = useProjectStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(null);

  const startRename = (layer: ForgeLayer) => {
    setEditingId(layer.id);
    setEditingName(layer.name);
  };

  const saveRename = (layerId: string) => {
    if (editingName.trim()) {
      renameLayer(layerId, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className={`flex flex-col h-full bg-[#121217] text-[#f5f5f7] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#181820]">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[#f47fa3]" />
          <h3 className="text-xs font-semibold tracking-wide uppercase text-[#f5f5f7]">Layers</h3>
          <Pill label={`${project.layers.length}`} variant="default" />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onAddLayerClick}
          icon={<Plus size={14} />}
        >
          Add Layer
        </Button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {project.layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-48 border border-dashed border-white/10 rounded-xl m-2">
            <Layers size={32} className="text-[#656573] mb-2 stroke-1" />
            <p className="text-xs text-[#9d9da8] mb-1">No layers added yet</p>
            <p className="text-[11px] text-[#656573] mb-4 max-w-[200px]">
              Drag & drop GeoJSON, CSV, GeoParquet, PMTiles, or COG onto the map
            </p>
            <Button variant="glass" size="sm" onClick={onAddLayerClick} icon={<Plus size={12} />}>
              Add Your First Layer
            </Button>
          </div>
        ) : (
          project.layers.map((layer, index) => {
            const isSelected = selectedLayerId === layer.id;
            const isExpanded = expandedLayerId === layer.id;

            return (
              <div
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`flex flex-col rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#1e1e28] border-white/20 shadow-md'
                    : 'bg-[#181820] border-white/6 hover:border-white/12'
                }`}
              >
                {/* Main Row */}
                <div className="flex items-center gap-2 p-2.5">
                  {/* Visibility */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    className={`p-1 rounded-md transition-colors ${
                      layer.visible
                        ? 'text-[#f5f5f7] hover:bg-white/10'
                        : 'text-[#656573] hover:bg-white/5'
                    }`}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  {/* Color Swatch */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20 shadow-sm"
                    style={{ backgroundColor: layer.style.color || '#f47fa3' }}
                  />

                  {/* Name or Rename Input */}
                  <div className="flex-1 min-w-0">
                    {editingId === layer.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => saveRename(layer.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(layer.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="w-full bg-[#0a0a0c] border border-[#f47fa3] text-xs text-[#f5f5f7] px-1.5 py-0.5 rounded outline-none"
                      />
                    ) : (
                      <div
                        onDoubleClick={() => startRename(layer)}
                        className="truncate text-xs font-medium text-[#f5f5f7] cursor-pointer"
                        title="Double-click to rename"
                      >
                        {layer.name}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#9d9da8] font-mono">
                      <span className="uppercase text-[#e3b450]">{layer.sourceType}</span>
                      {layer.featureCount > 0 && <span>• {layer.featureCount} feats</span>}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-0.5">
                    {/* Zoom to layer */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomToLayer(layer.id);
                      }}
                      className="p-1 rounded text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/5"
                      title="Zoom to layer bounds"
                    >
                      <Maximize2 size={13} />
                    </button>

                    {/* Attribute table trigger */}
                    {layer.data && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAttributeTable(layer.id);
                        }}
                        className="p-1 rounded text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/5"
                        title="Open attribute table"
                      >
                        <Table size={13} />
                      </button>
                    )}

                    {/* Style Editor trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openStyleEditor(layer.id);
                      }}
                      className="p-1 rounded text-[#9d9da8] hover:text-[#f47fa3] hover:bg-white/5"
                      title="Data-driven styling"
                    >
                      <Palette size={13} />
                    </button>

                    {/* Layer settings expand toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedLayerId(isExpanded ? null : layer.id);
                      }}
                      className="p-1 rounded text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/5"
                      title="Layer settings"
                    >
                      <Sliders size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details / Controls */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2.5 bg-[#14141c]/50 rounded-b-xl">
                    <Slider
                      label="Opacity"
                      unit="%"
                      min={0}
                      max={1}
                      step={0.05}
                      value={layer.opacity}
                      onChange={(val) => setLayerOpacity(layer.id, val)}
                    />

                    <div className="flex items-center justify-between pt-1">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderLayers(index, index - 1);
                          }}
                          className="p-1 rounded border border-white/5 text-[#9d9da8] hover:text-[#f5f5f7] disabled:opacity-30 disabled:pointer-events-none"
                          title="Move up"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          disabled={index === project.layers.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderLayers(index, index + 1);
                          }}
                          className="p-1 rounded border border-white/5 text-[#9d9da8] hover:text-[#f5f5f7] disabled:opacity-30 disabled:pointer-events-none"
                          title="Move down"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLayer(layer.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
