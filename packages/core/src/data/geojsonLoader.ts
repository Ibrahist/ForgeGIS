import type { FeatureCollection } from 'geojson';
import { FieldDefinition } from '../types/layers';

export function calculateGeoJSONBounds(fc: FeatureCollection): [number, number, number, number] | undefined {
  if (!fc.features || fc.features.length === 0) return undefined;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  function traverseCoords(coords: unknown): void {
    if (!coords || !Array.isArray(coords)) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [x, y] = coords as [number, number];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else {
      for (const item of coords) {
        traverseCoords(item);
      }
    }
  }

  for (const feature of fc.features) {
    if (feature.geometry) {
      // GeoJSON geometry coordinates can be nested arrays depending on Point/Line/Polygon
      traverseCoords((feature.geometry as { coordinates?: unknown }).coordinates);
    }
  }

  if (minX === Infinity || minY === Infinity) return undefined;
  return [minX, minY, maxX, maxY];
}

export function extractFieldsFromProperties(fc: FeatureCollection): FieldDefinition[] {
  const fieldMap = new Map<string, 'string' | 'number' | 'boolean' | 'date'>();

  for (const feature of fc.features.slice(0, 50)) {
    if (feature.properties) {
      for (const [key, value] of Object.entries(feature.properties)) {
        if (!fieldMap.has(key)) {
          if (typeof value === 'number') {
            fieldMap.set(key, 'number');
          } else if (typeof value === 'boolean') {
            fieldMap.set(key, 'boolean');
          } else {
            fieldMap.set(key, 'string');
          }
        }
      }
    }
  }

  return Array.from(fieldMap.entries()).map(([name, type]) => ({ name, type }));
}

export function parseGeoJSON(content: string | object): FeatureCollection {
  const parsed = typeof content === 'string' ? JSON.parse(content) : content;
  
  if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
    return parsed as FeatureCollection;
  }
  
  if (parsed.type === 'Feature') {
    return {
      type: 'FeatureCollection',
      features: [parsed],
    };
  }

  // Raw geometry
  if (parsed.type && parsed.coordinates) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: parsed,
        },
      ],
    };
  }

  throw new Error('Invalid GeoJSON: must be FeatureCollection, Feature, or Geometry object');
}
