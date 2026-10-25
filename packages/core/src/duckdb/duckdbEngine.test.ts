import { describe, it, expect, beforeEach } from 'vitest';
import { defaultDuckDB, DuckDBSpatialEngine } from './duckdbEngine';
import { useProjectStore, INITIAL_PROJECT } from '../store/projectStore';
import { ForgeLayer } from '../types/layers';

describe('DuckDB Spatial Engine', () => {
  beforeEach(() => {
    useProjectStore.getState().loadProject({
      ...INITIAL_PROJECT,
      layers: [],
    });
  });

  const testLayer: ForgeLayer = {
    id: 'layer_sensors_test',
    name: 'Coastal Sensors',
    sourceType: 'csv',
    visible: true,
    opacity: 0.9,
    zIndex: 1,
    featureCount: 3,
    fields: [
      { name: 'station', type: 'string' },
      { name: 'temp_c', type: 'number' },
      { name: 'latitude', type: 'number' },
      { name: 'longitude', type: 'number' },
    ],
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-122.4, 37.8] },
          properties: { station: 'S1', temp_c: 15.2, latitude: 37.8, longitude: -122.4 },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-122.3, 37.7] },
          properties: { station: 'S2', temp_c: 13.9, latitude: 37.7, longitude: -122.3 },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-122.5, 37.9] },
          properties: { station: 'S3', temp_c: 16.4, latitude: 37.9, longitude: -122.5 },
        },
      ],
    },
    style: { color: '#f47fa3', opacity: 0.9 },
  };

  it('executes query and returns structured results with GeoJSON', async () => {
    const engine = new DuckDBSpatialEngine();
    const result = await engine.executeQuery(
      'SELECT station, temp_c, latitude, longitude FROM sensors WHERE temp_c > 14.0',
      [testLayer]
    );

    expect(result.columns).toBeDefined();
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.geoJson).toBeDefined();
    expect(result.geoJson?.features.length).toBeGreaterThan(0);
  });

  it('manages saved queries and query history in project store', () => {
    const store = useProjectStore.getState();

    store.saveQuery('High Temp Stations', 'SELECT * FROM sensors WHERE temp_c > 15');
    expect(useProjectStore.getState().project.sqlWorkspace.queries.length).toBe(1);
    expect(useProjectStore.getState().project.sqlWorkspace.queries[0].name).toBe('High Temp Stations');

    store.addQueryHistory({
      id: 'h1',
      sql: 'SELECT 1',
      timestamp: '12:00:00',
      durationMs: 12,
      rowCount: 1,
      status: 'success',
    });
    expect(useProjectStore.getState().queryHistory.length).toBe(1);

    store.deleteSavedQuery(useProjectStore.getState().project.sqlWorkspace.queries[0].id);
    expect(useProjectStore.getState().project.sqlWorkspace.queries.length).toBe(0);
  });

  it('creates a new map layer from query results', async () => {
    const store = useProjectStore.getState();
    const engine = new DuckDBSpatialEngine();
    const result = await engine.executeQuery('SELECT * FROM sensors', [testLayer]);

    store.setLastQueryResult(result);
    store.addQueryResultAsLayer('Hotspots');

    const updatedLayers = useProjectStore.getState().project.layers;
    expect(updatedLayers.length).toBe(1);
    expect(updatedLayers[0].name).toBe('Hotspots');
    expect(updatedLayers[0].sourceType).toBe('sql-result');
  });
});
