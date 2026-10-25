import { ForgeProject, ViewState, BasemapConfig } from '../types/project';
import { ForgeLayer } from '../types/layers';

export const FORGE_PROJECT_SCHEMA_V1 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ForgeGIS Project Format',
  description: 'Local-first, cloud-native geospatial project specification',
  type: 'object',
  required: ['$schema', 'version', 'id', 'title', 'view', 'basemap', 'layers'],
  properties: {
    $schema: { type: 'string' },
    version: { type: 'string', enum: ['1.0.0'] },
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    domain: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    view: {
      type: 'object',
      required: ['longitude', 'latitude', 'zoom', 'pitch', 'bearing'],
      properties: {
        longitude: { type: 'number', minimum: -180, maximum: 180 },
        latitude: { type: 'number', minimum: -90, maximum: 90 },
        zoom: { type: 'number', minimum: 0, maximum: 24 },
        pitch: { type: 'number', minimum: 0, maximum: 85 },
        bearing: { type: 'number', minimum: -180, maximum: 180 },
        projection: { type: 'string', enum: ['mercator', 'globe', 'equal-earth'] },
        terrain3d: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            exaggeration: { type: 'number' },
          },
        },
      },
    },
    basemap: {
      type: 'object',
      required: ['id', 'name', 'type', 'url'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string', enum: ['vector', 'raster', 'satellite', 'planetary'] },
        url: { type: 'string' },
        attribution: { type: 'string' },
      },
    },
    layers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'type', 'source', 'visible', 'opacity'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['geojson', 'pmtiles', 'cog', 'csv', 'wms', 'xyz', 'geoparquet'] },
          visible: { type: 'boolean' },
          opacity: { type: 'number', minimum: 0, maximum: 1 },
          style: { type: 'object' },
        },
      },
    },
    sqlWorkspace: {
      type: 'object',
      properties: {
        queries: { type: 'array' },
        activeQueryId: { type: 'string' },
      },
    },
    geoprocessingHistory: {
      type: 'array',
    },
    plugins: {
      type: 'object',
      properties: {
        installed: { type: 'array' },
      },
    },
  },
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a candidate project object against the ForgeGIS Project v1.0.0 schema
 */
export function validateProject(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Project must be a valid JSON object'] };
  }

  const proj = data as Record<string, unknown>;

  if (typeof proj.id !== 'string' || !proj.id) errors.push('Missing required string property "id"');
  if (typeof proj.title !== 'string' || !proj.title) errors.push('Missing required string property "title"');

  // View state validation
  if (!proj.view || typeof proj.view !== 'object') {
    errors.push('Missing required object property "view"');
  } else {
    const v = proj.view as Record<string, unknown>;
    if (typeof v.longitude !== 'number') errors.push('view.longitude must be a number');
    if (typeof v.latitude !== 'number') errors.push('view.latitude must be a number');
    if (typeof v.zoom !== 'number') errors.push('view.zoom must be a number');
  }

  // Basemap validation
  if (!proj.basemap || typeof proj.basemap !== 'object') {
    errors.push('Missing required object property "basemap"');
  } else {
    const b = proj.basemap as Record<string, unknown>;
    if (typeof b.id !== 'string') errors.push('basemap.id must be a string');
    if (typeof b.url !== 'string') errors.push('basemap.url must be a string');
  }

  // Layers validation
  if (!Array.isArray(proj.layers)) {
    errors.push('Missing required array property "layers"');
  } else {
    proj.layers.forEach((layer, idx) => {
      if (!layer || typeof layer !== 'object') {
        errors.push(`layers[${idx}] must be a valid layer object`);
      } else {
        const l = layer as Record<string, unknown>;
        if (typeof l.id !== 'string') errors.push(`layers[${idx}].id must be a string`);
        if (typeof l.name !== 'string') errors.push(`layers[${idx}].name must be a string`);
        if (typeof l.type !== 'string') errors.push(`layers[${idx}].type must be a string`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Migrates older or partial project formats to the modern v1.0.0 specification
 */
export function migrateProject(data: unknown): ForgeProject {
  const raw = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;

  const defaultView: ViewState = {
    longitude: -122.35,
    latitude: 37.8,
    zoom: 11,
    pitch: 0,
    bearing: 0,
    projection: 'mercator',
    terrain3d: { enabled: false, exaggeration: 1.5 },
  };

  const defaultBasemap: BasemapConfig = {
    id: 'carto-dark',
    name: 'Carto Dark Matter',
    type: 'raster',
    url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
    attribution: '© CartoDB © OpenStreetMap contributors',
  };

  const rawView = (raw.view && typeof raw.view === 'object' ? raw.view : {}) as Record<string, unknown>;
  const rawBasemap = (raw.basemap && typeof raw.basemap === 'object' ? raw.basemap : {}) as Record<string, unknown>;

  const migrated: ForgeProject = {
    $schema: 'https://forgegis.org/schemas/v1/project.json',
    version: '1.0.0',
    id: typeof raw.id === 'string' && raw.id ? raw.id : `forge-proj-${Date.now()}`,
    title: typeof raw.title === 'string' && raw.title ? raw.title : 'Untitled Project',
    description: typeof raw.description === 'string' ? raw.description : '',
    domain: typeof raw.domain === 'string' ? raw.domain : 'coastal-monitoring',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    view: {
      longitude: typeof rawView.longitude === 'number' ? rawView.longitude : defaultView.longitude,
      latitude: typeof rawView.latitude === 'number' ? rawView.latitude : defaultView.latitude,
      zoom: typeof rawView.zoom === 'number' ? rawView.zoom : defaultView.zoom,
      pitch: typeof rawView.pitch === 'number' ? rawView.pitch : defaultView.pitch,
      bearing: typeof rawView.bearing === 'number' ? rawView.bearing : defaultView.bearing,
      projection: (rawView.projection as ViewState['projection']) || 'mercator',
      terrain3d:
        rawView.terrain3d && typeof rawView.terrain3d === 'object'
          ? (rawView.terrain3d as ViewState['terrain3d'])
          : defaultView.terrain3d,
    },
    basemap: {
      id: typeof rawBasemap.id === 'string' ? rawBasemap.id : defaultBasemap.id,
      name: typeof rawBasemap.name === 'string' ? rawBasemap.name : defaultBasemap.name,
      type: (rawBasemap.type as BasemapConfig['type']) || defaultBasemap.type,
      url: typeof rawBasemap.url === 'string' ? rawBasemap.url : defaultBasemap.url,
      attribution: typeof rawBasemap.attribution === 'string' ? rawBasemap.attribution : defaultBasemap.attribution,
    },
    layers: Array.isArray(raw.layers) ? (raw.layers as ForgeLayer[]) : [],
    sqlWorkspace: {
      queries:
        raw.sqlWorkspace && typeof raw.sqlWorkspace === 'object' && Array.isArray((raw.sqlWorkspace as any).queries)
          ? (raw.sqlWorkspace as any).queries
          : [],
      activeQueryId:
        raw.sqlWorkspace && typeof raw.sqlWorkspace === 'object'
          ? (raw.sqlWorkspace as any).activeQueryId
          : undefined,
    },
    geoprocessingHistory: Array.isArray(raw.geoprocessingHistory) ? (raw.geoprocessingHistory as any) : [],
    plugins: {
      installed:
        raw.plugins && typeof raw.plugins === 'object' && Array.isArray((raw.plugins as any).installed)
          ? (raw.plugins as any).installed
          : [],
    },
  };

  return migrated;
}

/**
 * Serializes a ForgeProject to a clean formatted JSON string
 */
export function serializeProject(project: ForgeProject, inlineData = true): string {
  const projCopy: ForgeProject = JSON.parse(JSON.stringify(project));
  projCopy.updatedAt = new Date().toISOString();

  if (!inlineData) {
    // Strip large inline GeoJSON data buffers if user requests a slim project referencing remote sources
    projCopy.layers = projCopy.layers.map((l) => {
      if (l.data && typeof l.data === 'object' && l.sourceUrl) {
        const copy = { ...l };
        delete copy.data;
        return copy;
      }
      return l;
    });
  }

  return JSON.stringify(projCopy, null, 2);
}

/**
 * Deserializes and validates a project JSON string
 */
export function deserializeProject(jsonString: string): ForgeProject {
  const parsed = JSON.parse(jsonString);
  const validation = validateProject(parsed);
  if (!validation.valid) {
    // Attempt graceful migration
    return migrateProject(parsed);
  }
  return parsed as ForgeProject;
}
