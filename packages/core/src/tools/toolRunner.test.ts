import { describe, it, expect } from 'vitest';
import type { FeatureCollection } from 'geojson';
import { TOOL_REGISTRY } from './toolRegistry';
import { executeToolAlgorithm } from './toolRunner';
import { parseToolDeepLink, buildToolDeepLink } from './deepLink';

describe('In-Browser Geoprocessing Algorithms (17 Tools)', () => {
  const samplePoints: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.4, 37.8] }, properties: { id: 1, val: 'A', elevation_m: 12.5 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.3, 37.7] }, properties: { id: 2, val: 'B', elevation_m: 25.0 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.5, 37.9] }, properties: { id: 3, val: 'A', elevation_m: 5.0 } },
    ],
  };

  const samplePolygons: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-122.45, 37.75],
              [-122.40, 37.75],
              [-122.40, 37.80],
              [-122.45, 37.80],
              [-122.45, 37.75],
            ],
          ],
        },
        properties: { zone: 'Bay Shore', nir: 0.8, red: 0.2, elevation_m: 10 },
      },
    ],
  };

  const sampleLine: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-122.5, 37.7],
            [-122.4, 37.8],
            [-122.3, 37.9],
          ],
        },
        properties: { line_name: 'Coast Transect' },
      },
    ],
  };

  const getLayerData = (id: string) => {
    if (id === 'points') return samplePoints;
    if (id === 'polys') return samplePolygons;
    if (id === 'lines') return sampleLine;
    return undefined;
  };

  it('verifies tool registry contains all 17 declared tools', () => {
    expect(TOOL_REGISTRY.length).toBe(17);
    const categories = new Set(TOOL_REGISTRY.map((t) => t.category));
    expect(categories).toContain('vector');
    expect(categories).toContain('terrain');
    expect(categories).toContain('raster');
    expect(categories).toContain('conversion');
  });

  it('executes vector-buffer tool', async () => {
    const tool = TOOL_REGISTRY.find((t) => t.id === 'vector-buffer')!;
    const output = await executeToolAlgorithm(tool, { inputLayerId: 'points', distance: 200, units: 'meters' }, getLayerData);
    expect(output.featureCollection).toBeDefined();
    expect(output.featureCollection?.features[0].geometry.type).toBe('Polygon');
  });

  it('executes vector-convex-hull tool', async () => {
    const tool = TOOL_REGISTRY.find((t) => t.id === 'vector-convex-hull')!;
    const output = await executeToolAlgorithm(tool, { inputLayerId: 'points' }, getLayerData);
    expect(output.featureCollection).toBeDefined();
    expect(output.featureCollection?.features.length).toBe(1);
    expect(output.featureCollection?.features[0].geometry.type).toBe('Polygon');
  });

  it('executes vector-centroids tool', async () => {
    const tool = TOOL_REGISTRY.find((t) => t.id === 'vector-centroids')!;
    const output = await executeToolAlgorithm(tool, { inputLayerId: 'polys' }, getLayerData);
    expect(output.featureCollection).toBeDefined();
    expect(output.featureCollection?.features[0].geometry.type).toBe('Point');
  });

  it('executes vector-voronoi tool', async () => {
    const tool = TOOL_REGISTRY.find((t) => t.id === 'vector-voronoi')!;
    const output = await executeToolAlgorithm(tool, { inputLayerId: 'points' }, getLayerData);
    expect(output.featureCollection).toBeDefined();
    expect(output.featureCollection?.features.length).toBeGreaterThan(0);
  });

  it('executes vector-bbox tool', async () => {
    const tool = TOOL_REGISTRY.find((t) => t.id === 'vector-bbox')!;
    const output = await executeToolAlgorithm(tool, { inputLayerId: 'polys', perFeature: false }, getLayerData);
    expect(output.featureCollection).toBeDefined();
    expect(output.featureCollection?.features[0].geometry.type).toBe('Polygon');
  });

  it('executes vector-points-along-line tool', async () => {
    const tool = TOOL_REGISTRY.find((t) => t.id === 'vector-points-along-line')!;
    const output = await executeToolAlgorithm(tool, { inputLayerId: 'lines', distance: 5, units: 'kilometers' }, getLayerData);
    expect(output.featureCollection).toBeDefined();
    expect(output.featureCollection?.features.length).toBeGreaterThan(1);
    expect(output.featureCollection?.features[0].geometry.type).toBe('Point');
  });

  it('executes terrain-hillshade tool', async () => {
    const tool = TOOL_REGISTRY.find((t) => t.id === 'terrain-hillshade')!;
    const output = await executeToolAlgorithm(tool, { inputLayerId: 'points', azimuth: 315, altitude: 45 }, getLayerData);
    expect(output.featureCollection).toBeDefined();
    expect(output.featureCollection?.features[0].properties?.hillshade_value).toBeDefined();
  });

  it('executes terrain-slope and terrain-aspect tools', async () => {
    const slopeTool = TOOL_REGISTRY.find((t) => t.id === 'terrain-slope')!;
    const slopeOutput = await executeToolAlgorithm(slopeTool, { inputLayerId: 'points', elevationField: 'elevation_m' }, getLayerData);
    expect(slopeOutput.featureCollection?.features[0].properties?.slope_degrees).toBeDefined();

    const aspectTool = TOOL_REGISTRY.find((t) => t.id === 'terrain-aspect')!;
    const aspectOutput = await executeToolAlgorithm(aspectTool, { inputLayerId: 'points', elevationField: 'elevation_m' }, getLayerData);
    expect(aspectOutput.featureCollection?.features[0].properties?.aspect_degrees).toBeDefined();
  });

  it('executes raster-ndvi-ndwi tool', async () => {
    const tool = TOOL_REGISTRY.find((t) => t.id === 'raster-ndvi-ndwi')!;
    const output = await executeToolAlgorithm(tool, { inputLayerId: 'polys', indexType: 'NDVI', bandA: 'nir', bandB: 'red' }, getLayerData);
    expect(output.featureCollection?.features[0].properties?.ndvi).toBeDefined();
    // (0.8 - 0.2) / (0.8 + 0.2) = 0.6
    expect(output.featureCollection?.features[0].properties?.ndvi).toBeCloseTo(0.6);
  });

  it('executes crs-reproject tool', async () => {
    const tool = TOOL_REGISTRY.find((t) => t.id === 'crs-reproject')!;
    const output = await executeToolAlgorithm(tool, { inputLayerId: 'points', targetCRS: 'EPSG:3857' }, getLayerData);
    expect(output.featureCollection).toBeDefined();
    const coord = output.featureCollection?.features[0].geometry as unknown as { coordinates: [number, number] };
    // -122.4 degrees in Web Mercator is approximately -13625000 meters
    expect(coord.coordinates[0]).toBeLessThan(-1000000);
  });

  it('parses and builds tool deep links correctly', () => {
    const url = buildToolDeepLink('vector-buffer', { distance: 500, units: 'meters' }, true, 'https://forgegis.dev/');
    expect(url).toContain('tool=vector-buffer');
    expect(url).toContain('distance=500');
    expect(url).toContain('autorun=true');

    const parsed = parseToolDeepLink(url);
    expect(parsed).not.toBeNull();
    expect(parsed?.toolId).toBe('vector-buffer');
    expect(parsed?.parameters.distance).toBe(500);
    expect(parsed?.parameters.units).toBe('meters');
    expect(parsed?.autorun).toBe(true);
  });
});
