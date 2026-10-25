import React, { useState } from 'react';
import {
  Palette,
  Layers,
  BarChart2,
  Box,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  useProjectStore,
  generateCategorizedStyle,
  generateGraduatedStyle,
  COLOR_RAMPS,
  LayerStyle,
} from '@forgegis/core';
import { Button } from './Button';
import { Slider } from './Slider';
import { Tabs } from './Tabs';

export interface StyleEditorProps {
  className?: string;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({ className = '' }) => {
  const {
    project,
    styleEditorLayerId,
    closeStyleEditor,
    setLayerStyle,
  } = useProjectStore();

  const layer = project.layers.find((l) => l.id === styleEditorLayerId);

  const [activeTab, setActiveTab] = useState<'single' | 'categorized' | 'graduated' | 'extrusion'>('single');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedRamp, setSelectedRamp] = useState<string>('roseGold');
  const [numBins, setNumBins] = useState<number>(5);
  const [graduatedMethod, setGraduatedMethod] = useState<'quantile' | 'equal-interval'>('quantile');

  // Single style states
  const [singleColor, setSingleColor] = useState(layer?.style.color || '#f47fa3');
  const [pointRadius, setPointRadius] = useState(layer?.style.pointRadius || 6);
  const [strokeWidth, setStrokeWidth] = useState(layer?.style.strokeWidth || 1.5);

  // Extrusion states
  const [extrusionEnabled, setExtrusionEnabled] = useState(layer?.style.extrusion?.enabled || false);
  const [extrusionProperty, setExtrusionProperty] = useState(layer?.style.extrusion?.property || '');
  const [extrusionMultiplier, setExtrusionMultiplier] = useState(layer?.style.extrusion?.multiplier || 10);

  if (!layer) return null;

  const numericFields = layer.fields.filter((f) => f.type === 'number');
  const allFields = layer.fields;

  const applySingleStyle = () => {
    const updated: LayerStyle = {
      ...layer.style,
      color: singleColor,
      fillColor: singleColor,
      pointRadius,
      strokeWidth,
      classification: undefined,
    };
    setLayerStyle(layer.id, updated);
  };

  const applyCategorizedStyle = () => {
    if (!layer.data || !selectedProperty) return;
    const { rules } = generateCategorizedStyle(layer.data, selectedProperty, selectedRamp as keyof typeof COLOR_RAMPS);

    const updated: LayerStyle = {
      ...layer.style,
      classification: {
        type: 'categorized',
        property: selectedProperty,
        colorRampName: selectedRamp,
        rules,
      },
    };
    setLayerStyle(layer.id, updated);
  };

  const applyGraduatedStyle = () => {
    if (!layer.data || !selectedProperty) return;
    const { bins } = generateGraduatedStyle(
      layer.data,
      selectedProperty,
      numBins,
      graduatedMethod,
      selectedRamp as keyof typeof COLOR_RAMPS
    );

    const updated: LayerStyle = {
      ...layer.style,
      classification: {
        type: 'graduated',
        property: selectedProperty,
        method: graduatedMethod,
        bins: numBins,
        colorRampName: selectedRamp,
        graduatedBins: bins,
      },
    };
    setLayerStyle(layer.id, updated);
  };

  const applyExtrusionStyle = () => {
    const updated: LayerStyle = {
      ...layer.style,
      extrusion: {
        enabled: extrusionEnabled,
        property: extrusionProperty || undefined,
        multiplier: extrusionMultiplier,
      },
    };
    setLayerStyle(layer.id, updated);
  };

  const resetStyle = () => {
    const defaultColor = '#f47fa3';
    setLayerStyle(layer.id, {
      color: defaultColor,
      fillColor: defaultColor,
      opacity: 0.85,
      strokeColor: defaultColor,
      strokeWidth: 2,
      pointRadius: 6,
    });
  };

  return (
    <div className={`p-4 bg-[#121217] text-[#f5f5f7] flex flex-col gap-4 ${className}`}>
      {/* Tab Switcher */}
      <Tabs
        tabs={[
          { id: 'single', label: 'Single Color', icon: <Palette size={13} /> },
          { id: 'categorized', label: 'Categorized', icon: <Layers size={13} /> },
          { id: 'graduated', label: 'Graduated', icon: <BarChart2 size={13} /> },
          { id: 'extrusion', label: '3D Extrusion', icon: <Box size={13} /> },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as typeof activeTab)}
        className="self-center"
      />

      {/* 1. Single Color Panel */}
      {activeTab === 'single' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#9d9da8] block mb-2">Color Palette</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={singleColor}
                onChange={(e) => setSingleColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
              />
              <span className="font-mono text-xs text-[#ebdbb2] uppercase">{singleColor}</span>
            </div>
          </div>

          <Slider
            label="Point Radius"
            min={2}
            max={24}
            step={1}
            value={pointRadius}
            unit="px"
            onChange={setPointRadius}
          />

          <Slider
            label="Stroke Width"
            min={0.5}
            max={8}
            step={0.5}
            value={strokeWidth}
            unit="px"
            onChange={setStrokeWidth}
          />

          <Button variant="primary" size="sm" onClick={applySingleStyle} icon={<Check size={14} />}>
            Apply Style
          </Button>
        </div>
      )}

      {/* 2. Categorized Panel */}
      {activeTab === 'categorized' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#9d9da8] block mb-1.5">Attribute Field</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full bg-[#181820] border border-white/10 text-xs text-[#f5f5f7] rounded-lg p-2 outline-none focus:border-[#f47fa3]"
            >
              <option value="">Select field...</option>
              {allFields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#9d9da8] block mb-1.5">Color Ramp</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COLOR_RAMPS).map(([key, ramp]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRamp(key)}
                  className={`p-2 rounded-lg border text-left flex flex-col gap-1.5 ${
                    selectedRamp === key ? 'border-[#f47fa3] bg-white/5' : 'border-white/5 bg-[#181820]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono text-[#9d9da8]">{key}</span>
                  <div className="flex h-2.5 rounded-full overflow-hidden">
                    {ramp.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={!selectedProperty}
            onClick={applyCategorizedStyle}
            icon={<Check size={14} />}
          >
            Generate Categorized Style
          </Button>
        </div>
      )}

      {/* 3. Graduated Panel */}
      {activeTab === 'graduated' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#9d9da8] block mb-1.5">Numeric Field</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full bg-[#181820] border border-white/10 text-xs text-[#f5f5f7] rounded-lg p-2 outline-none focus:border-[#f47fa3]"
            >
              <option value="">Select numeric field...</option>
              {numericFields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} (number)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-[#9d9da8] block mb-1.5">Method</label>
              <select
                value={graduatedMethod}
                onChange={(e) => setGraduatedMethod(e.target.value as typeof graduatedMethod)}
                className="w-full bg-[#181820] border border-white/10 text-xs text-[#f5f5f7] rounded-lg p-2 outline-none"
              >
                <option value="quantile">Quantile (Equal Count)</option>
                <option value="equal-interval">Equal Interval</option>
              </select>
            </div>
            <div className="w-24">
              <Slider
                label="Bins"
                min={2}
                max={8}
                step={1}
                value={numBins}
                onChange={setNumBins}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9d9da8] block mb-1.5">Color Ramp</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COLOR_RAMPS).map(([key, ramp]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRamp(key)}
                  className={`p-2 rounded-lg border text-left flex flex-col gap-1.5 ${
                    selectedRamp === key ? 'border-[#f47fa3] bg-white/5' : 'border-white/5 bg-[#181820]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono text-[#9d9da8]">{key}</span>
                  <div className="flex h-2.5 rounded-full overflow-hidden">
                    {ramp.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={!selectedProperty}
            onClick={applyGraduatedStyle}
            icon={<Check size={14} />}
          >
            Generate Graduated Style
          </Button>
        </div>
      )}

      {/* 4. 3D Extrusion Panel */}
      {activeTab === 'extrusion' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#181820] border border-white/6">
            <div>
              <div className="text-xs font-semibold text-[#f5f5f7]">Enable 3D Polygon Extrusion</div>
              <div className="text-[11px] text-[#9d9da8]">Extrudes vector features into 3D columns on the map</div>
            </div>
            <input
              type="checkbox"
              checked={extrusionEnabled}
              onChange={(e) => setExtrusionEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#f47fa3] cursor-pointer"
            />
          </div>

          {extrusionEnabled && (
            <>
              <div>
                <label className="text-xs text-[#9d9da8] block mb-1.5">Height Attribute (Optional)</label>
                <select
                  value={extrusionProperty}
                  onChange={(e) => setExtrusionProperty(e.target.value)}
                  className="w-full bg-[#181820] border border-white/10 text-xs text-[#f5f5f7] rounded-lg p-2 outline-none focus:border-[#f47fa3]"
                >
                  <option value="">Constant height</option>
                  {numericFields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} (number)
                    </option>
                  ))}
                </select>
              </div>

              <Slider
                label="Height Multiplier"
                min={1}
                max={100}
                step={1}
                value={extrusionMultiplier}
                unit="x"
                onChange={setExtrusionMultiplier}
              />
            </>
          )}

          <Button variant="primary" size="sm" onClick={applyExtrusionStyle} icon={<Check size={14} />}>
            Apply 3D Extrusion
          </Button>
        </div>
      )}

      {/* Footer Reset */}
      <div className="flex justify-between items-center pt-3 border-t border-white/5">
        <Button variant="subtle" size="sm" onClick={resetStyle} icon={<RotateCcw size={12} />}>
          Reset to Default
        </Button>
        <Button variant="glass" size="sm" onClick={closeStyleEditor}>
          Close
        </Button>
      </div>
    </div>
  );
};
