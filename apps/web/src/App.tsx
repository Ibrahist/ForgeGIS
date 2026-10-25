import React, { useEffect, useState } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useProjectStore,
  loadSpatialFile,
  parseToolDeepLink,
  setupPostMessageBridge,
  PluginManager,
} from '@forgegis/core';
import {
  LayersPanel,
  BasemapSwitcher,
  MeasureToolbar,
  AttributeTable,
  StyleEditor,
  Legend,
  Modal,
  SqlWorkspace,
  Toolbox,
  ProjectShareModal,
  PluginManagerModal,
} from '@forgegis/ui';
import { ALL_BUILTIN_PLUGINS, TimeSliderWidget } from '@forgegis/plugins';
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
    isSqlEditorOpen,
    setSqlEditorOpen,
    isToolboxOpen,
    setToolboxOpen,
    addLayer,
    removeLayer,
    updateLayer,
    zoomToLayer,
    toggleLayerVisibility,
    setLayerOpacity,
    setViewState,
  } = useProjectStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPluginsOpen, setIsPluginsOpen] = useState(false);
  const [shareModalTab, setShareModalTab] = useState<'project' | 'html' | 'embed'>('project');
  const [deepLink, setDeepLink] = useState<{
    toolId: string;
    parameters: Record<string, unknown>;
    autorun: boolean;
  } | null>(null);

  // Plugin Manager instance
  const pluginManagerRef = React.useRef<PluginManager | null>(null);
  if (!pluginManagerRef.current) {
    const pm = new PluginManager({
      getView: () => project.view,
      setView: (v) => setViewState(v),
      getLayers: () => project.layers,
      getLayer: (id) => project.layers.find((l) => l.id === id),
      addLayer: (l) => addLayer(l),
      removeLayer: (id) => removeLayer(id),
      updateLayer: (id, patch) => updateLayer(id, patch),
    });
    ALL_BUILTIN_PLUGINS.forEach((p) => pm.registerPlugin(p));
    pluginManagerRef.current = pm;
  }

  // Keep plugin host hooks updated with latest store state
  useEffect(() => {
    if (pluginManagerRef.current) {
      pluginManagerRef.current.updateHooks({
        getView: () => project.view,
        setView: (v) => setViewState(v),
        getLayers: () => project.layers,
        getLayer: (id) => project.layers.find((l) => l.id === id),
        addLayer: (l) => addLayer(l),
        removeLayer: (id) => removeLayer(id),
        updateLayer: (id, patch) => updateLayer(id, patch),
      });
    }
  }, [project, setViewState, addLayer, removeLayer, updateLayer]);

  // Set up iframe postMessage bridge
  useEffect(() => {
    const cleanup = setupPostMessageBridge({
      setLayerVisibility: (layerId, visible) => {
        const layer = project.layers.find((l) => l.id === layerId);
        if (layer && layer.visible !== visible) {
          toggleLayerVisibility(layerId);
        }
      },
      setLayerOpacity: (layerId, opacity) => {
        setLayerOpacity(layerId, opacity);
      },
      flyTo: (params) => {
        setViewState({
          longitude: params.center[0],
          latitude: params.center[1],
          zoom: params.zoom ?? project.view.zoom,
          pitch: params.pitch ?? project.view.pitch,
          bearing: params.bearing ?? project.view.bearing,
        });
      },
      getView: () => project.view,
      getProject: () => project,
    });

    return cleanup;
  }, [project, toggleLayerVisibility, setLayerOpacity, setViewState]);

  // Check URL query parameters for deep linking
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const parsed = parseToolDeepLink(window.location.search);
      if (parsed) {
        setDeepLink(parsed);
        setToolboxOpen(true);
      }
    }
  }, []);

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
      <Header
        onOpenAddLayer={() => setAddLayerOpen(true)}
        onOpenSqlWorkspace={() => setSqlEditorOpen(true)}
        onOpenToolbox={() => setToolboxOpen(true)}
        onOpenPlugins={() => setIsPluginsOpen(true)}
        onOpenShareModal={(tab) => {
          setShareModalTab(tab || 'project');
          setIsShareModalOpen(true);
        }}
      />

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

          {/* Time Series Temporal Playback Widget */}
          <TimeSliderWidget />
        </main>
      </div>

      {/* Bottom Attribute Table Drawer */}
      <AttributeTable />

      {/* Geoprocessing Toolbox Modal */}
      <Modal
        isOpen={isToolboxOpen}
        onClose={() => setToolboxOpen(false)}
        title="In-Browser Geoprocessing Toolbox"
        subtitle="17 pure Web Worker & WASM algorithms running client-side with zero server roundtrips"
        size="xl"
      >
        <Toolbox
          initialToolId={deepLink?.toolId}
          initialParams={deepLink?.parameters}
          autoRun={deepLink?.autorun}
        />
      </Modal>

      {/* Spatial SQL Workspace Modal */}
      <Modal
        isOpen={isSqlEditorOpen}
        onClose={() => setSqlEditorOpen(false)}
        title="DuckDB-WASM Spatial SQL"
        subtitle="Execute high-performance analytical queries and map results client-side"
        size="xl"
      >
        <SqlWorkspace />
      </Modal>

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

      {/* Project Sharing & Export Modal */}
      <ProjectShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialTab={shareModalTab}
      />

      {/* Plugin Ecosystem Modal */}
      {pluginManagerRef.current && (
        <PluginManagerModal
          isOpen={isPluginsOpen}
          onClose={() => setIsPluginsOpen(false)}
          pluginManager={pluginManagerRef.current}
        />
      )}

      {/* Add Layer Modal */}
      <AddLayerModal
        isOpen={isAddLayerOpen}
        onClose={() => setAddLayerOpen(false)}
      />
    </div>
  );
};
