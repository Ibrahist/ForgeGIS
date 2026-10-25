import React, { useEffect, useState } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useProjectStore, loadSpatialFile } from '@forgegis/core';
import {
  LayersPanel,
  BasemapSwitcher,
  MeasureToolbar,
  AttributeTable,
  StyleEditor,
  Legend,
  Modal,
} from '@forgegis/ui';
import { Header } from './components/Header';
import { MapCanvas } from './components/MapCanvas';
import { AddLayerModal } from './components/AddLayerModal';

export const App: React.FC = () => {
  const {
    project,
    isAddLayerOpen,
    setAddLayerOpen,
    isStyleEditorOpen,
    closeStyleEditor,
    addLayer,
    zoomToLayer,
  } = useProjectStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-load coastal demo datasets on initial empty load
  useEffect(() => {
    async function loadInitialDemos() {
      if (project.layers.length === 0) {
        try {
          const sensorsLayer = await loadSpatialFile(
            '/samples/coastal_sensors.csv',
            'SF Bay Marine Sensor Buoys'
          );
          addLayer(sensorsLayer);

          const coastlineLayer = await loadSpatialFile(
            '/samples/coastline.geojson',
            'Coastal Flood & Erosion Risk Zones'
          );
          addLayer(coastlineLayer);

          if (coastlineLayer.bounds) {
            zoomToLayer(coastlineLayer.id);
          }
        } catch {
          // Fallback if running outside web server
        }
      }
    }
    loadInitialDemos();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a0c]">
      {/* Top Header */}
      <Header onOpenAddLayer={() => setAddLayerOpen(true)} />

      {/* Main Workspace Body */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Collapsible Layers Dock */}
        <aside
          className={`relative z-20 transition-all duration-300 flex border-r border-white/8 ${
            isSidebarOpen ? 'w-80' : 'w-0'
          }`}
        >
          <div className="w-80 h-full overflow-hidden flex flex-col">
            <LayersPanel onAddLayerClick={() => setAddLayerOpen(true)} className="h-full w-full" />
          </div>

          {/* Sidebar Toggle Tab */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-7 top-4 z-30 p-1.5 rounded-r-lg bg-[#181820] border border-l-0 border-white/10 text-[#9d9da8] hover:text-[#f5f5f7] shadow-lg"
            title={isSidebarOpen ? 'Collapse Layers Panel' : 'Expand Layers Panel'}
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </aside>

        {/* Center Map Canvas */}
        <main className="flex-1 relative h-full">
          <MapCanvas />

          {/* Floating Top-Right Map Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <MeasureToolbar />
            <BasemapSwitcher />
          </div>

          {/* Floating Bottom-Right Legend */}
          <div className="absolute bottom-6 right-4 z-20">
            <Legend />
          </div>
        </main>
      </div>

      {/* Bottom Attribute Table Drawer */}
      <AttributeTable />

      {/* Style Editor Modal */}
      <Modal
        isOpen={isStyleEditorOpen}
        onClose={closeStyleEditor}
        title="Layer Styling & Symbology"
        subtitle="Configure categorized colors, graduated ramps, and 3D polygon extrusions"
        size="md"
      >
        <StyleEditor />
      </Modal>

      {/* Add Layer Modal */}
      <AddLayerModal
        isOpen={isAddLayerOpen}
        onClose={() => setAddLayerOpen(false)}
      />
    </div>
  );
};
