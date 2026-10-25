import Papa from 'papaparse';
import type { FeatureCollection, Feature, Point } from 'geojson';
import { FieldDefinition } from '../types/layers';
import { calculateGeoJSONBounds } from './geojsonLoader';

const LATITUDE_KEYS = ['lat', 'latitude', 'y', 'lat_deg', 'ycoord', 'point_y', 'lat_dd'];
const LONGITUDE_KEYS = ['lon', 'lng', 'longitude', 'x', 'lon_deg', 'xcoord', 'point_x', 'long', 'lon_dd'];

export interface CsvParseResult {
  featureCollection: FeatureCollection<Point>;
  fields: FieldDefinition[];
  bounds?: [number, number, number, number];
  latColumn: string;
  lonColumn: string;
}

export function detectCoordinateColumns(headers: string[]): { latCol?: string; lonCol?: string } {
  const normalized = headers.map(h => ({ raw: h, clean: h.trim().toLowerCase() }));

  let latCol: string | undefined;
  let lonCol: string | undefined;

  for (const item of normalized) {
    if (!latCol && LATITUDE_KEYS.includes(item.clean)) {
      latCol = item.raw;
    }
    if (!lonCol && LONGITUDE_KEYS.includes(item.clean)) {
      lonCol = item.raw;
    }
  }

  return { latCol, lonCol };
}

export function parseCsvToGeoJSON(csvText: string): CsvParseResult {
  const result = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`Failed to parse CSV: ${result.errors[0]?.message}`);
  }

  const headers = result.meta.fields || [];
  const { latCol, lonCol } = detectCoordinateColumns(headers);

  if (!latCol || !lonCol) {
    throw new Error(
      `Could not automatically detect latitude and longitude columns in CSV. Found headers: [${headers.join(', ')}]`
    );
  }

  const features: Feature<Point>[] = [];
  const fieldTypes = new Map<string, 'string' | 'number' | 'boolean'>();

  for (const row of result.data) {
    const rawLat = row[latCol];
    const rawLon = row[lonCol];

    const lat = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat));
    const lon = typeof rawLon === 'number' ? rawLon : parseFloat(String(rawLon));

    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      // Create properties without lat/lon duplicates if desired, or keep all
      const properties: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(row)) {
        properties[key] = val;
        if (!fieldTypes.has(key) && val !== null && val !== undefined) {
          if (typeof val === 'number') fieldTypes.set(key, 'number');
          else if (typeof val === 'boolean') fieldTypes.set(key, 'boolean');
          else fieldTypes.set(key, 'string');
        }
      }

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        properties,
      });
    }
  }

  const featureCollection: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features,
  };

  const fields: FieldDefinition[] = headers.map(h => ({
    name: h,
    type: fieldTypes.get(h) || 'string',
  }));

  const bounds = calculateGeoJSONBounds(featureCollection as unknown as FeatureCollection);

  return {
    featureCollection,
    fields,
    bounds,
    latColumn: latCol,
    lonColumn: lonCol,
  };
}
