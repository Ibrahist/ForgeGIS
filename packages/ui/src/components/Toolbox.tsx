import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Share2,
  Play,
  ArrowLeft,
  Check,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';
import {
  useProjectStore,
  TOOL_REGISTRY,
  ToolDefinition,
  executeToolAlgorithm,
  buildToolDeepLink,
  ForgeLayer,
} from '@forgegis/core';
import { Button } from './Button';
import { Pill } from './Pill';
import { Slider } from './Slider';

export interface ToolboxProps {
  initialToolId?: string | null;
  initialParams?: Record<string, unknown>;
  autoRun?: boolean;
  className?: string;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  initialToolId = null,
  initialParams = {},
  autoRun = false,
  className = '',
}) => {
  const { project, addLayer, zoomToLayer } = useProjectStore();

  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formParams, setFormParams] = useState<Record<string, unknown>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize tool if deep linked
  useEffect(() => {
    if (initialToolId) {
      const found = TOOL_REGISTRY.find((t) => t.id === initialToolId);
      if (found) {
        selectTool(found, initialParams);
        if (autoRun) {
          // Delayed autorun to allow store hydration
          setTimeout(() => {
            runTool(found, { ...getDefaultParams(found), ...initialParams });
          }, 300);
        }
      }
    }
  }, [initialToolId]);

  const getDefaultParams = (tool: ToolDefinition): Record<string, unknown> => {
    const defaults: Record<string, unknown> = {};
    for (const p of tool.parameters) {
      if (p.default !== undefined) {
        defaults[p.name] = p.default;
      } else if (p.type === 'layer') {
        defaults[p.name] = project.layers[0]?.id || '';
      }
    }
    return defaults;
  };

  const selectTool = (tool: ToolDefinition, overrides: Record<string, unknown> = {}) => {
    setSelectedTool(tool);
    setExecutionMessage(null);
    setFormParams({
      ...getDefaultParams(tool),
      ...overrides,
    });
  };

  const updateParam = (name: string, value: unknown) => {
    setFormParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const runTool = async (tool: ToolDefinition, params: Record<string, unknown>) => {
    setIsExecuting(true);
    setExecutionMessage(null);

    try {
      const output = await executeToolAlgorithm(
        tool,
        params,
        (layerId) => project.layers.find((l) => l.id === layerId)?.data
      );

      if (output.featureCollection) {
        const newLayerId = 'tool_' + Date.now();
        const outputName = `${tool.name} Result`;
        const color = '#34d399'; // Emerald

        const newLayer: ForgeLayer = {
          id: newLayerId,
          name: outputName,
          sourceType: 'geojson',
          data: output.featureCollection,
          visible: true,
          opacity: 0.85,
          zIndex: 1,
          bounds: output.bounds,
          fields: output.featureCollection.features[0]
            ? Object.keys(output.featureCollection.features[0].properties || {}).map((k) => ({
                name: k,
                type: 'string',
              }))
            : [],
          featureCount: output.featureCount,
          style: {
            color,
            fillColor: color,
            opacity: 0.85,
            strokeColor: '#0a0a0c',
            strokeWidth: 2,
            pointRadius: 6,
          },
        };

        addLayer(newLayer);
        if (output.bounds) {
          zoomToLayer(newLayerId);
        }

        setExecutionMessage({
          text: `Success! Created layer "${outputName}" with ${output.featureCount} features in ${output.durationMs}ms`,
          type: 'success',
        });
      } else if (output.fileBuffer && output.fileName) {
        // File download for PMTiles / GeoParquet conversion
        const blob = new Blob([output.fileBuffer as BlobPart]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = output.fileName;
        a.click();

        setExecutionMessage({
          text: `Success! Generated and downloaded ${output.fileName} (${output.fileBuffer.length} bytes)`,
          type: 'success',
        });
      }
    } catch (err: unknown) {
      setExecutionMessage({
        text: err instanceof Error ? err.message : String(err),
        type: 'error',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyDeepLink = () => {
    if (!selectedTool) return;
    const link = buildToolDeepLink(selectedTool.id, formParams);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredTools = TOOL_REGISTRY.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesQuery =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className={`flex flex-col h-full bg-[#121217] text-[#f5f5f7] ${className}`}>
      {/* View 1: Tool List & Registry */}
      {!selectedTool ? (
        <div className="flex flex-col h-full">
          {/* Header & Categories */}
          <div className="p-4 bg-[#181820] border-b border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wrench size={16} className="text-[#e3b450]" />
                <h3 className="text-xs font-semibold tracking-wide uppercase text-[#f5f5f7]">
                  Geoprocessing Toolbox
                </h3>
                <Pill label={`${TOOL_REGISTRY.length} WASM Tools`} variant="gold" />
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2 text-[#9d9da8]" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0a0a0c] border border-white/10 text-xs text-[#f5f5f7] rounded-full pl-8 pr-3 py-1 outline-none focus:border-[#e3b450] w-48 placeholder-[#656573]"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Tools' },
                { id: 'vector', label: 'Vector (10)' },
                { id: 'terrain', label: 'Terrain (3)' },
                { id: 'raster', label: 'Raster (1)' },
                { id: 'conversion', label: 'Conversion (3)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[#22222c] text-[#e3b450] border border-[#e3b450]/30 shadow-sm'
                      : 'text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTools.map((tool, idx) => (
              <div
                key={tool.id}
                onClick={() => selectTool(tool)}
                className="p-4 rounded-xl bg-[#181820] border border-white/6 hover:border-[#e3b450]/40 cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-[#e3b450] uppercase tracking-wider">
                      {String(idx + 1).padStart(2, '0')} • {tool.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#9d9da8] px-1.5 py-0.5 rounded bg-white/5">
                      WASM
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#f5f5f7] group-hover:text-[#e3b450] transition-colors mb-1">
                    {tool.name}
                  </h4>
                  <p className="text-[11px] text-[#9d9da8] leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px] text-[#9d9da8]">
                  <span>{tool.parameters.length} parameters</span>
                  <span className="text-[#e3b450] group-hover:translate-x-0.5 transition-transform">
                    Configure →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* View 2: Selected Tool Parameter Form */
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#181820] border-b border-white/8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTool(null)}
                className="p-1 rounded-full text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/10"
                title="Back to Toolbox"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h3 className="text-xs font-semibold text-[#f5f5f7]">{selectedTool.name}</h3>
                <span className="text-[10px] font-mono text-[#e3b450] uppercase">
                  {selectedTool.category} algorithm
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="glass"
                size="sm"
                onClick={handleCopyDeepLink}
                icon={copiedLink ? <Check size={13} className="text-[#34d399]" /> : <Share2 size={13} />}
                title="Copy shareable deep link"
              >
                {copiedLink ? 'Copied Link!' : 'Deep Link'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={isExecuting}
                onClick={() => runTool(selectedTool, formParams)}
                icon={<Play size={13} className="fill-current" />}
              >
                {isExecuting ? 'Running...' : 'Execute Tool'}
              </Button>
            </div>
          </div>

          {/* Form Parameters */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-w-xl">
            <p className="text-xs text-[#9d9da8] bg-white/5 p-3 rounded-xl border border-white/5">
              {selectedTool.description}
            </p>

            {executionMessage && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
                  executionMessage.type === 'success'
                    ? 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399]'
                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                }`}
              >
                {executionMessage.type === 'success' ? (
                  <CheckCircle size={15} className="flex-shrink-0" />
                ) : (
                  <AlertCircle size={15} className="flex-shrink-0" />
                )}
                <span>{executionMessage.text}</span>
              </div>
            )}

            {/* Dynamically Render Inputs from Tool Parameter Definitions */}
            {selectedTool.parameters.map((param) => {
              const val = formParams[param.name];

              // Layer picker
              if (param.type === 'layer') {
                return (
                  <div key={param.name}>
                    <label className="text-xs text-[#9d9da8] block mb-1">
                      {param.label} {param.required && <span className="text-red-400">*</span>}
                    </label>
                    <select
                      value={String(val || '')}
                      onChange={(e) => updateParam(param.name, e.target.value)}
                      className="w-full bg-[#181820] border border-white/10 text-xs text-[#f5f5f7] rounded-xl p-2.5 outline-none focus:border-[#e3b450]"
                    >
                      <option value="">Select layer...</option>
                      {project.layers.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.featureCount} features)
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              // Field picker
              if (param.type === 'field') {
                const targetLayerId = String(formParams[param.dependsOn || 'inputLayerId'] || '');
                const targetLayer = project.layers.find((l) => l.id === targetLayerId);
                const fields = targetLayer?.fields || [];

                return (
                  <div key={param.name}>
                    <label className="text-xs text-[#9d9da8] block mb-1">{param.label}</label>
                    <select
                      value={String(val || '')}
                      onChange={(e) => updateParam(param.name, e.target.value)}
                      className="w-full bg-[#181820] border border-white/10 text-xs text-[#f5f5f7] rounded-xl p-2.5 outline-none focus:border-[#e3b450]"
                    >
                      <option value="">All / None</option>
                      {fields.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.name} ({f.type})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              // Select dropdown
              if (param.type === 'select' && param.options) {
                return (
                  <div key={param.name}>
                    <label className="text-xs text-[#9d9da8] block mb-1">{param.label}</label>
                    <select
                      value={String(val || '')}
                      onChange={(e) => updateParam(param.name, e.target.value)}
                      className="w-full bg-[#181820] border border-white/10 text-xs text-[#f5f5f7] rounded-xl p-2.5 outline-none focus:border-[#e3b450]"
                    >
                      {param.options.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              // Number slider / input
              if (param.type === 'number') {
                return (
                  <div key={param.name}>
                    <Slider
                      label={param.label}
                      min={param.min !== undefined ? param.min : 0}
                      max={param.max !== undefined ? param.max : 1000}
                      step={param.step || 1}
                      value={Number(val || 0)}
                      onChange={(v) => updateParam(param.name, v)}
                    />
                  </div>
                );
              }

              // Boolean checkbox
              if (param.type === 'boolean') {
                return (
                  <div
                    key={param.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#181820] border border-white/6"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#f5f5f7]">{param.label}</div>
                      <div className="text-[11px] text-[#9d9da8]">{param.description}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => updateParam(param.name, e.target.checked)}
                      className="w-4 h-4 accent-[#e3b450] cursor-pointer"
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
