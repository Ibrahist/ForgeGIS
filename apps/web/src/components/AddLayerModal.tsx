import React, { useState } from 'react';
import { Upload, Globe, Database, FileSpreadsheet, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { loadSpatialFile, useProjectStore } from '@forgegis/core';
import { Modal, Button, Tabs } from '@forgegis/ui';

export interface AddLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddLayerModal: React.FC<AddLayerModalProps> = ({ isOpen, onClose }) => {
  const { addLayer, zoomToLayer } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'samples' | 'shapefile'>('samples');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const layer = await loadSpatialFile(file);
        addLayer(layer);
        if (layer.bounds) {
          zoomToLayer(layer.id);
        }
      }
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const layer = await loadSpatialFile(urlInput.trim());
      addLayer(layer);
      if (layer.bounds) {
        zoomToLayer(layer.id);
      }
      setUrlInput('');
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleDataset = async (samplePath: string, name: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const layer = await loadSpatialFile(samplePath, name);
      addLayer(layer);
      if (layer.bounds) {
        zoomToLayer(layer.id);
      }
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Geospatial Layer"
      subtitle="Load local vector/raster data, stream remote cloud-native archives, or explore coastal presets"
      size="md"
    >
      <div className="flex flex-col gap-5">
        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'samples', label: 'Coastal Demos', icon: <Database size={13} /> },
            { id: 'upload', label: 'Local File', icon: <Upload size={13} /> },
            { id: 'shapefile', label: 'Shapefile', icon: <Upload size={13} /> },
            { id: 'url', label: 'Remote URL', icon: <Globe size={13} /> },
          ]}
          activeTab={activeTab}
          onChange={(t) => {
            setActiveTab(t as typeof activeTab);
            setErrorMessage(null);
          }}
          className="self-center"
        />

        {/* Error notification */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs animate-fadeIn">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Coastal Demos */}
        {activeTab === 'samples' && (
          <div className="space-y-3">
            <div
              onClick={() =>
                loadSampleDataset(
                  '/samples/coastal_sensors.csv',
                  'East Africa Marine Sensor Buoys'
                )
              }
              className="p-3.5 rounded-xl bg-[#181820] border border-white/8 hover:border-[#f47fa3]/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#f5f5f7] group-hover:text-[#f47fa3] transition-colors">
                    East Africa Marine Sensor Buoys (CSV)
                  </div>
                  <div className="text-[11px] text-[#9d9da8]">
                    10 water temperature, wave height, and tide telemetry stations (Swahili Coast & Great Lakes)
                  </div>
                </div>
              </div>
              <Button variant="glass" size="sm">
                Load
              </Button>
            </div>

            <div
              onClick={() =>
                loadSampleDataset(
                  '/samples/coastline.geojson',
                  'East Africa Coastal & Marine Resilience Zones'
                )
              }
              className="p-3.5 rounded-xl bg-[#181820] border border-white/8 hover:border-[#e3b450]/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#e3b450]/10 text-[#e3b450] border border-[#e3b450]/20">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#f5f5f7] group-hover:text-[#e3b450] transition-colors">
                    East Africa Coastal & Marine Resilience Zones (GeoJSON)
                  </div>
                  <div className="text-[11px] text-[#9d9da8]">
                    Protected marine parks, mangrove biospheres, and reef zones across Mombasa, Lamu & Zanzibar
                  </div>
                </div>
              </div>
              <Button variant="glass" size="sm">
                Load
              </Button>
            </div>
          </div>
        )}

        {/* 2. Local File Upload */}
        {activeTab === 'upload' && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 hover:border-[#f47fa3]/50 rounded-2xl cursor-pointer bg-[#181820]/50 hover:bg-[#181820] transition-all">
              <Upload size={32} className="text-[#f47fa3] mb-3 stroke-1" />
              <span className="text-xs font-medium text-[#f5f5f7] mb-1">
                Drop your spatial files here, or click to browse
              </span>
              <span className="text-[11px] text-[#9d9da8] font-mono">
                Supports GeoJSON, CSV, GeoParquet, PMTiles, and COG (.tif)
              </span>
              <input
                type="file"
                multiple
                accept=".geojson,.json,.csv,.parquet,.geoparquet,.pmtiles,.tif,.tiff,.cog"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* 3. Shapefile Upload */}
        {activeTab === 'shapefile' && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 hover:border-[#f47fa3]/50 rounded-2xl cursor-pointer bg-[#181820]/50 hover:bg-[#181820] transition-all">
              <Upload size={32} className="text-[#f47fa3] mb-3 stroke-1" />
              <span className="text-xs font-medium text-[#f5f5f7] mb-1">
                Drop your shapefile (.zip or .shp) here, or click to browse
              </span>
              <span className="text-[11px] text-[#9d9da8] font-mono">
                Supports .shp (with .dbf/.shx) or zipped archive
              </span>
              <input
                type="file"
                multiple
                accept=".shp,.zip,.dbf,.shx"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* 3. Remote URL Input */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-[#9d9da8] block mb-1.5">
                Dataset URL (GeoJSON, GeoParquet, PMTiles, or COG)
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/dataset.pmtiles"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-[#181820] border border-white/10 rounded-xl p-2.5 text-xs text-[#f5f5f7] outline-none focus:border-[#f47fa3] font-mono"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading || !urlInput.trim()}
              className="w-full"
            >
              {isLoading ? 'Loading & Inspecting Dataset...' : 'Add Remote Layer'}
            </Button>
          </form>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#e3b450]">
            <span className="w-2 h-2 rounded-full bg-[#e3b450] animate-ping" />
            <span>Parsing data and extracting spatial bounds...</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
