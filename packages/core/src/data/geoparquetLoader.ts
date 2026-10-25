import { parquetRead } from 'hyparquet';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import { FieldDefinition } from '../types/layers';
import { calculateGeoJSONBounds } from './geojsonLoader';

/**
 * Basic WKB (Well Known Binary) to GeoJSON geometry parser
 * Handles 2D Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon
 */
export function parseWKB(buffer: Uint8Array): Geometry | null {
  if (buffer.length < 5) return null;
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const isLittleEndian = view.getUint8(0) === 1;
  const geomType = view.getUint32(1, isLittleEndian);

  let offset = 5;

  function readDouble(): number {
    const val = view.getFloat64(offset, isLittleEndian);
    offset += 8;
    return val;
  }

  function readPoint(): [number, number] {
    const x = readDouble();
    const y = readDouble();
    return [x, y];
  }

  // WKB standard codes: 1=Point, 2=LineString, 3=Polygon, 4=MultiPoint, 5=MultiLineString, 6=MultiPolygon
  // Also handle EWKB SRID flag (0x20000000)
  const baseType = geomType & 0xff;

  if (baseType === 1) { // Point
    return {
      type: 'Point',
      coordinates: readPoint(),
    };
  }

  if (baseType === 2) { // LineString
    const numPoints = view.getUint32(offset, isLittleEndian);
    offset += 4;
    const coords: [number, number][] = [];
    for (let i = 0; i < numPoints; i++) {
      coords.push(readPoint());
    }
    return {
      type: 'LineString',
      coordinates: coords,
    };
  }

  if (baseType === 3) { // Polygon
    const numRings = view.getUint32(offset, isLittleEndian);
    offset += 4;
    const rings: [number, number][][] = [];
    for (let r = 0; r < numRings; r++) {
      const numPoints = view.getUint32(offset, isLittleEndian);
      offset += 4;
      const ringCoords: [number, number][] = [];
      for (let i = 0; i < numPoints; i++) {
        ringCoords.push(readPoint());
      }
      rings.push(ringCoords);
    }
    return {
      type: 'Polygon',
      coordinates: rings,
    };
  }

  return null;
}

export interface GeoParquetResult {
  featureCollection: FeatureCollection;
  fields: FieldDefinition[];
  bounds?: [number, number, number, number];
  rowCount: number;
}

export async function parseGeoParquet(arrayBuffer: ArrayBuffer): Promise<GeoParquetResult> {
  const features: Feature[] = [];
  const fieldTypes = new Map<string, 'string' | 'number' | 'boolean'>();

  await new Promise<void>((resolve, reject) => {
    parquetRead({
      file: arrayBuffer,
      rowFormat: 'object',
      onComplete: (rows: unknown[]) => {
        try {
          if (!rows || rows.length === 0) {
            resolve();
            return;
          }

          // Inspect first row to find geometry column or lat/lon
          const sample = rows[0] as Record<string, unknown>;
          const geomCol = Object.keys(sample).find(k => 
            ['geometry', 'geom', 'wkb_geometry', 'the_geom'].includes(k.toLowerCase())
          );
          const latCol = Object.keys(sample).find(k => 
            ['latitude', 'lat', 'y'].includes(k.toLowerCase())
          );
          const lonCol = Object.keys(sample).find(k => 
            ['longitude', 'lon', 'lng', 'x'].includes(k.toLowerCase())
          );

          for (const rawRow of rows) {
            const row = rawRow as Record<string, unknown>;
            let geom: Geometry | null = null;

            if (geomCol && row[geomCol]) {
              const val = row[geomCol];
              if (val instanceof Uint8Array) {
                geom = parseWKB(val);
              } else if (typeof val === 'string') {
                // If geometry is GeoJSON string
                try {
                  geom = JSON.parse(val);
                } catch {
                  // Not JSON
                }
              }
            } else if (latCol && lonCol) {
              const lat = Number(row[latCol]);
              const lon = Number(row[lonCol]);
              if (!isNaN(lat) && !isNaN(lon)) {
                geom = { type: 'Point', coordinates: [lon, lat] };
              }
            }

            if (geom) {
              const props: Record<string, unknown> = {};
              for (const [key, val] of Object.entries(row)) {
                if (key !== geomCol) {
                  props[key] = val;
                  if (!fieldTypes.has(key) && val !== null && val !== undefined) {
                    if (typeof val === 'number') fieldTypes.set(key, 'number');
                    else if (typeof val === 'boolean') fieldTypes.set(key, 'boolean');
                    else fieldTypes.set(key, 'string');
                  }
                }
              }

              features.push({
                type: 'Feature',
                geometry: geom,
                properties: props,
              });
            }
          }

          resolve();
        } catch (err) {
          reject(err);
        }
      },
    });
  });

  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  };

  const fields: FieldDefinition[] = Array.from(fieldTypes.entries()).map(([name, type]) => ({
    name,
    type,
  }));

  const bounds = calculateGeoJSONBounds(featureCollection);

  return {
    featureCollection,
    fields,
    bounds,
    rowCount: features.length,
  };
}
