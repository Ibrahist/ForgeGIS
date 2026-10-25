import { ForgeLayer } from './layers';

export type ProjectionType = 'mercator' | 'globe' | 'equal-earth';

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  projection: ProjectionType;
  terrain3d: {
    enabled: boolean;
    exaggeration: number;
  };
}

export interface BasemapConfig {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'satellite' | 'planetary';
  url: string;
  attribution?: string;
}

export interface SavedSqlQuery {
  id: string;
  name: string;
  sql: string;
  createdAt: string;
  lastExecutedAt?: string;
  rowCount?: number;
  executionTimeMs?: number;
}

export interface GeoprocessingRun {
  id: string;
  toolId: string;
  timestamp: string;
  parameters: Record<string, unknown>;
  outputLayerId: string;
  durationMs: number;
  status: 'success' | 'failed';
  errorMessage?: string;
}

export interface ForgeProject {
  $schema: string;
  version: '1.0.0';
  id: string;
  title: string;
  description?: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  view: ViewState;
  basemap: BasemapConfig;
  layers: ForgeLayer[];
  sqlWorkspace: {
    queries: SavedSqlQuery[];
    activeQueryId?: string;
  };
  geoprocessingHistory: GeoprocessingRun[];
  plugins: {
    installed: {
      id: string;
      version: string;
      enabled: boolean;
      config: Record<string, unknown>;
    }[];
  };
}
