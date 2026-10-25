import { describe, it, expect } from 'vitest';
import {
  parseGeoJSON,
  calculateGeoJSONBounds,
  extractFieldsFromProperties,
} from './geojsonLoader';
import type { FeatureCollection } from 'geojson';

describe('geojsonLoader', () => {
  it('parses valid FeatureCollection string', () => {
    const raw = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-122.4, 37.8] },
          properties: { name: 'Buoy 1', depth: 45.2, active: true },
        },
      ],
    });

    const parsed = parseGeoJSON(raw);
    expect(parsed.type).toBe('FeatureCollection');
    expect(parsed.features.length).toBe(1);
    expect(parsed.features[0].properties?.name).toBe('Buoy 1');
  });

  it('wraps a single Feature in a FeatureCollection', () => {
    const single = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [10, 20] },
      properties: { id: 1 },
    };

    const parsed = parseGeoJSON(single);
    expect(parsed.type).toBe('FeatureCollection');
    expect(parsed.features.length).toBe(1);
  });

  it('calculates bounding box accurately', () => {
    const fc: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-122.5, 37.7] },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-122.3, 37.9] },
          properties: {},
        },
      ],
    };

    const bounds = calculateGeoJSONBounds(fc);
    expect(bounds).toBeDefined();
    expect(bounds![0]).toBeCloseTo(-122.5);
    expect(bounds![1]).toBeCloseTo(37.7);
    expect(bounds![2]).toBeCloseTo(-122.3);
    expect(bounds![3]).toBeCloseTo(37.9);
  });

  it('extracts field types from properties', () => {
    const fc: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { station: 'Station Alpha', salinity: 34.5, verified: true },
        },
      ],
    };

    const fields = extractFieldsFromProperties(fc);
    expect(fields).toEqual([
      { name: 'station', type: 'string' },
      { name: 'salinity', type: 'number' },
      { name: 'verified', type: 'boolean' },
    ]);
  });
});
