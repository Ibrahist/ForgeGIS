import { describe, it, expect } from 'vitest';
import { generateStandaloneHtml } from './htmlExporter';
import { generateEmbedCode } from './postMessageApi';
import { ForgeProject } from '../types/project';

describe('Standalone HTML & Embed Exporter', () => {
  const sampleProject: ForgeProject = {
    $schema: 'https://forgegis.org/schemas/v1/project.json',
    version: '1.0.0',
    id: 'coastal-export-test',
    title: 'SF Bay Inundation Forecast',
    description: 'High-tide sensor telemetry & coastal vulnerability',
    domain: 'coastal-monitoring',
    createdAt: '2026-10-25T00:00:00Z',
    updatedAt: '2026-10-25T00:00:00Z',
    view: {
      longitude: -122.38,
      latitude: 37.78,
      zoom: 12.5,
      pitch: 35,
      bearing: 15,
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
        id: 'buoy-layer',
        name: 'Sensor Buoys',
        type: 'geojson',
        visible: true,
        opacity: 0.85,
        zIndex: 1,
        fields: [],
        featureCount: 1,
        source: {
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { station_id: 'BUOY-46026', wave_height_m: 2.4 },
                geometry: { type: 'Point', coordinates: [-122.8, 37.75] },
              },
            ],
          },
        },
        style: { color: '#f47fa3', pointRadius: 8 },
      },
    ],
    sqlWorkspace: { queries: [] },
    geoprocessingHistory: [],
    plugins: { installed: [] },
  };

  it('generates a self-contained offline HTML report document', () => {
    const html = generateStandaloneHtml(sampleProject);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('SF Bay Inundation Forecast');
    expect(html).toContain('maplibre-gl.js');
    expect(html).toContain('id="forgegis-project"');
    expect(html).toContain('BUOY-46026');
    expect(html).toContain('Sensor Buoys');
    expect(html).toContain('#f47fa3');
  });

  it('escapes user strings safely against script injection', () => {
    const maliciousProj = {
      ...sampleProject,
      title: 'Danger</script><script>alert("hacked")</script>',
    };
    const html = generateStandaloneHtml(maliciousProj);
    expect(html).not.toContain('<script>alert("hacked")</script>');
  });

  it('generates responsive iframe embed code', () => {
    const embed = generateEmbedCode({
      url: 'https://forgegis.org/embed/coastal-demo',
      width: '100%',
      height: '500px',
      border: true,
    });

    expect(embed).toContain('<iframe');
    expect(embed).toContain('src="https://forgegis.org/embed/coastal-demo"');
    expect(embed).toContain('width="100%"');
    expect(embed).toContain('height="500px"');
    expect(embed).toContain('allow="geolocation; fullscreen"');
  });
});
