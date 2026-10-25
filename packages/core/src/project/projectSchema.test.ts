import { describe, it, expect } from 'vitest';
import {
  validateProject,
  migrateProject,
  serializeProject,
  deserializeProject,
  FORGE_PROJECT_SCHEMA_V1,
} from './projectSchema';
import { ForgeProject } from '../types/project';

describe('Project Schema & Serialization', () => {
  const sampleProject: ForgeProject = {
    $schema: 'https://forgegis.org/schemas/v1/project.json',
    version: '1.0.0',
    id: 'test-coastal-1',
    title: 'San Francisco Coastal Resilience Analysis',
    description: 'High-resolution assessment of sea level rise and marine buoys',
    domain: 'coastal-monitoring',
    createdAt: '2026-10-25T12:00:00Z',
    updatedAt: '2026-10-25T12:00:00Z',
    view: {
      longitude: -122.4,
      latitude: 37.75,
      zoom: 12,
      pitch: 20,
      bearing: 0,
      projection: 'mercator',
      terrain3d: { enabled: false, exaggeration: 1 },
    },
    basemap: {
      id: 'carto-dark',
      name: 'Carto Dark Matter',
      type: 'raster',
      url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
    },
    layers: [
      {
        id: 'layer-1',
        name: 'Coastline',
        type: 'geojson',
        visible: true,
        opacity: 0.9,
        zIndex: 1,
        fields: [],
        featureCount: 1,
        source: {
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { name: 'Ocean Beach' },
                geometry: { type: 'Point', coordinates: [-122.51, 37.76] },
              },
            ],
          },
        },
        style: { color: '#e3b450' },
      },
    ],
    sqlWorkspace: {
      queries: [
        {
          id: 'q-1',
          name: 'Count Points',
          sql: 'SELECT count(*) FROM "layer-1"',
          createdAt: '2026-10-25T12:00:00Z',
        },
      ],
      activeQueryId: 'q-1',
    },
    geoprocessingHistory: [],
    plugins: { installed: [] },
  };

  it('validates a conformant project schema', () => {
    const result = validateProject(sampleProject);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects invalid or missing project fields', () => {
    const invalid = { id: 'test' };
    const result = validateProject(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain('Missing required string property "title"');
  });

  it('migrates legacy/incomplete format gracefully to v1.0.0', () => {
    const legacy = {
      title: 'Legacy Project',
      view: { longitude: -122.2, latitude: 37.8, zoom: 10 },
      layers: [],
    };
    const migrated = migrateProject(legacy);
    expect(migrated.version).toBe('1.0.0');
    expect(migrated.title).toBe('Legacy Project');
    expect(migrated.view.longitude).toBe(-122.2);
    expect(migrated.view.pitch).toBe(0);
    expect(migrated.basemap.id).toBe('carto-dark');
    expect(migrated.sqlWorkspace.queries).toEqual([]);

    const validation = validateProject(migrated);
    expect(validation.valid).toBe(true);
  });

  it('serializes and deserializes project round-trip', () => {
    const serialized = serializeProject(sampleProject);
    expect(typeof serialized).toBe('string');
    expect(serialized).toContain('San Francisco Coastal Resilience Analysis');

    const deserialized = deserializeProject(serialized);
    expect(deserialized.id).toBe(sampleProject.id);
    expect(deserialized.title).toBe(sampleProject.title);
    expect(deserialized.layers).toHaveLength(1);
    expect(deserialized.layers[0].name).toBe('Coastline');
  });

  it('has valid JSON Schema V1 definition', () => {
    expect(FORGE_PROJECT_SCHEMA_V1.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(FORGE_PROJECT_SCHEMA_V1.properties.version.enum).toContain('1.0.0');
  });
});
