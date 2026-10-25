import { create } from 'zustand';
import { ForgeProject, ViewState, BasemapConfig } from '../types/project';
import { ForgeLayer } from '../types/layers';
import { LayerStyle } from '../types/styles';

export const DEFAULT_BASEMAPS: BasemapConfig[] = [
  {
    id: 'carto-dark',
    name: 'Carto Dark Matter',
    type: 'raster',
    url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
  },
  {
    id: 'carto-positron',
    name: 'Carto Positron',
    type: 'raster',
    url: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
  },
  {
    id: 'osm',
    name: 'OpenStreetMap',
    type: 'raster',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  {
    id: 'satellite-esri',
    name: 'World Imagery (Satellite)',
    type: 'raster',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
];

export const INITIAL_VIEW_STATE: ViewState = {
  longitude: -122.4194, // San Francisco Bay / Pacific Coastal Focus
  latitude: 37.7749,
  zoom: 11,
  pitch: 0,
  bearing: 0,
  projection: 'mercator',
  terrain3d: {
    enabled: false,
    exaggeration: 1.5,
  },
};

export const INITIAL_PROJECT: ForgeProject = {
  $schema: 'https://forgegis.dev/schemas/v1.0.0/project.json',
  version: '1.0.0',
  id: 'proj_default',
  title: 'ForgeGIS Coastal Intelligence',
  description: 'Local-first cloud-native geospatial exploration project',
  domain: 'coastal-monitoring',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  view: INITIAL_VIEW_STATE,
  basemap: DEFAULT_BASEMAPS[0],
  layers: [],
  sqlWorkspace: {
    queries: [],
  },
  geoprocessingHistory: [],
  plugins: {
    installed: [],
  },
};

export interface ProjectState {
  project: ForgeProject;
  selectedLayerId: string | null;
  activeToolId: string | null;
  
  // Measure tool state
  measureMode: 'none' | 'distance' | 'area';
  measurePoints: [number, number][];

  // UI Panels
  isAttributeTableOpen: boolean;
  attributeTableLayerId: string | null;
  isStyleEditorOpen: boolean;
  styleEditorLayerId: string | null;
  isAddLayerOpen: boolean;
  isSqlEditorOpen: boolean;
  isToolboxOpen: boolean;

  // Zoom target trigger
  zoomTarget: { bounds?: [number, number, number, number]; center?: [number, number]; zoom?: number; timestamp: number } | null;

  // Actions
  addLayer: (layer: ForgeLayer) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, patch: Partial<ForgeLayer>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  renameLayer: (layerId: string, newName: string) => void;
  setLayerStyle: (layerId: string, style: LayerStyle) => void;
  setSelectedLayer: (layerId: string | null) => void;
  
  // View & Basemap
  setViewState: (view: Partial<ViewState>) => void;
  setBasemap: (basemap: BasemapConfig) => void;
  toggle3dTerrain: () => void;
  setProjection: (projection: ViewState['projection']) => void;

  // Zooming
  zoomToLayer: (layerId: string) => void;
  zoomToCoords: (center: [number, number], zoom?: number) => void;

  // Measurements
  setMeasureMode: (mode: 'none' | 'distance' | 'area') => void;
  addMeasurePoint: (point: [number, number]) => void;
  clearMeasure: () => void;

  // Modals & Drawers
  openAttributeTable: (layerId: string) => void;
  closeAttributeTable: () => void;
  openStyleEditor: (layerId: string) => void;
  closeStyleEditor: () => void;
  setAddLayerOpen: (open: boolean) => void;
  setSqlEditorOpen: (open: boolean) => void;
  setToolboxOpen: (open: boolean) => void;
  setActiveToolId: (toolId: string | null) => void;

  // Project lifecycle
  loadProject: (project: ForgeProject) => void;
  exportProject: () => ForgeProject;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: INITIAL_PROJECT,
  selectedLayerId: null,
  activeToolId: null,
  
  measureMode: 'none',
  measurePoints: [],

  isAttributeTableOpen: false,
  attributeTableLayerId: null,
  isStyleEditorOpen: false,
  styleEditorLayerId: null,
  isAddLayerOpen: false,
  isSqlEditorOpen: false,
  isToolboxOpen: false,

  zoomTarget: null,

  addLayer: (layer) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: [layer, ...state.project.layers], // Add to top
        updatedAt: new Date().toISOString(),
      },
      selectedLayerId: layer.id,
    })),

  removeLayer: (layerId) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.filter((l) => l.id !== layerId),
        updatedAt: new Date().toISOString(),
      },
      selectedLayerId: state.selectedLayerId === layerId ? null : state.selectedLayerId,
      attributeTableLayerId: state.attributeTableLayerId === layerId ? null : state.attributeTableLayerId,
      isAttributeTableOpen: state.attributeTableLayerId === layerId ? false : state.isAttributeTableOpen,
      styleEditorLayerId: state.styleEditorLayerId === layerId ? null : state.styleEditorLayerId,
      isStyleEditorOpen: state.styleEditorLayerId === layerId ? false : state.isStyleEditorOpen,
    })),

  updateLayer: (layerId, patch) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.map((l) => (l.id === layerId ? { ...l, ...patch } : l)),
        updatedAt: new Date().toISOString(),
      },
    })),

  reorderLayers: (fromIndex, toIndex) =>
    set((state) => {
      const layers = [...state.project.layers];
      const [moved] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, moved);
      return {
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  toggleLayerVisibility: (layerId) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.map((l) =>
          l.id === layerId ? { ...l, visible: !l.visible } : l
        ),
      },
    })),

  setLayerOpacity: (layerId, opacity) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.map((l) => (l.id === layerId ? { ...l, opacity } : l)),
      },
    })),

  renameLayer: (layerId, newName) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.map((l) => (l.id === layerId ? { ...l, name: newName } : l)),
      },
    })),

  setLayerStyle: (layerId, style) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.map((l) => (l.id === layerId ? { ...l, style } : l)),
      },
    })),

  setSelectedLayer: (layerId) => set({ selectedLayerId: layerId }),

  setViewState: (viewPatch) =>
    set((state) => ({
      project: {
        ...state.project,
        view: { ...state.project.view, ...viewPatch },
      },
    })),

  setBasemap: (basemap) =>
    set((state) => ({
      project: {
        ...state.project,
        basemap,
        updatedAt: new Date().toISOString(),
      },
    })),

  toggle3dTerrain: () =>
    set((state) => {
      const current = state.project.view.terrain3d.enabled;
      return {
        project: {
          ...state.project,
          view: {
            ...state.project.view,
            pitch: current ? 0 : 50,
            terrain3d: {
              ...state.project.view.terrain3d,
              enabled: !current,
            },
          },
        },
      };
    }),

  setProjection: (projection) =>
    set((state) => ({
      project: {
        ...state.project,
        view: { ...state.project.view, projection },
      },
    })),

  zoomToLayer: (layerId) => {
    const layer = get().project.layers.find((l) => l.id === layerId);
    if (layer?.bounds) {
      set({
        zoomTarget: {
          bounds: layer.bounds,
          timestamp: Date.now(),
        },
      });
    }
  },

  zoomToCoords: (center, zoom = 14) => {
    set({
      zoomTarget: {
        center,
        zoom,
        timestamp: Date.now(),
      },
    });
  },

  setMeasureMode: (mode) =>
    set({
      measureMode: mode,
      measurePoints: [],
    }),

  addMeasurePoint: (point) =>
    set((state) => ({
      measurePoints: [...state.measurePoints, point],
    })),

  clearMeasure: () => set({ measurePoints: [] }),

  openAttributeTable: (layerId) =>
    set({
      isAttributeTableOpen: true,
      attributeTableLayerId: layerId,
      selectedLayerId: layerId,
    }),

  closeAttributeTable: () =>
    set({
      isAttributeTableOpen: false,
      attributeTableLayerId: null,
    }),

  openStyleEditor: (layerId) =>
    set({
      isStyleEditorOpen: true,
      styleEditorLayerId: layerId,
      selectedLayerId: layerId,
    }),

  closeStyleEditor: () =>
    set({
      isStyleEditorOpen: false,
      styleEditorLayerId: null,
    }),

  setAddLayerOpen: (open) => set({ isAddLayerOpen: open }),
  setSqlEditorOpen: (open) => set({ isSqlEditorOpen: open }),
  setToolboxOpen: (open) => set({ isToolboxOpen: open }),
  setActiveToolId: (toolId) => set({ activeToolId: toolId }),

  loadProject: (project) =>
    set({
      project,
      selectedLayerId: project.layers[0]?.id || null,
    }),

  exportProject: () => get().project,
}));
