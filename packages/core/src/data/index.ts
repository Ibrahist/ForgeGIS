import { ForgeLayer, LayerSourceType } from '../types/layers';
import { parseGeoJSON, calculateGeoJSONBounds, extractFieldsFromProperties } from './geojsonLoader';
import { parseCsvToGeoJSON } from './csvLoader';
import { parseGeoParquet } from './geoparquetLoader';
import { inspectPMTiles } from './pmtilesLoader';
import { inspectCOG } from './cogLoader';

export * from './geojsonLoader';
export * from './csvLoader';
export * from './geoparquetLoader';
export * from './pmtilesLoader';
export * from './cogLoader';

function generateId(): string {
  return 'layer_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
}

const DEFAULT_COLORS = [
  '#f47fa3', // Sunset rose
  '#e3b450', // Warm gold
  '#38bdf8', // Ocean cyan
  '#34d399', // Emerald
  '#a78bfa', // Lavender
  '#fb923c', // Amber orange
];

export async function loadSpatialFile(
  fileOrUrl: File | string,
  customName?: string
): Promise<ForgeLayer> {
  const id = generateId();
  const name =
    customName ||
    (typeof fileOrUrl === 'string'
      ? fileOrUrl.split('/').pop()?.split('?')[0] || 'Remote Layer'
      : fileOrUrl.name);

  const rawFileName =
    typeof fileOrUrl === 'string'
      ? fileOrUrl.split('?')[0].toLowerCase()
      : fileOrUrl.name.toLowerCase();

  const color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];

  // 1. CSV
  if (rawFileName.endsWith('.csv') || name.toLowerCase().endsWith('.csv')) {
    const text =
      typeof fileOrUrl === 'string'
        ? await (await fetch(fileOrUrl)).text()
        : await fileOrUrl.text();

    const { featureCollection, fields, bounds } = parseCsvToGeoJSON(text);

    return {
      id,
      name,
      sourceType: 'csv',
      sourceUrl: typeof fileOrUrl === 'string' ? fileOrUrl : undefined,
      data: featureCollection,
      visible: true,
      opacity: 0.9,
      zIndex: 1,
      bounds,
      fields,
      featureCount: featureCollection.features.length,
      style: {
        color,
        opacity: 0.9,
        pointRadius: 6,
        strokeColor: '#0a0a0c',
        strokeWidth: 1.5,
      },
    };
  }

  // 2. GeoParquet / Parquet
  if (rawFileName.endsWith('.parquet') || rawFileName.endsWith('.geoparquet')) {
    const arrayBuffer =
      typeof fileOrUrl === 'string'
        ? await (await fetch(fileOrUrl)).arrayBuffer()
        : await fileOrUrl.arrayBuffer();

    const { featureCollection, fields, bounds, rowCount } = await parseGeoParquet(arrayBuffer);

    return {
      id,
      name,
      sourceType: 'geoparquet',
      sourceUrl: typeof fileOrUrl === 'string' ? fileOrUrl : undefined,
      data: featureCollection,
      visible: true,
      opacity: 0.85,
      zIndex: 1,
      bounds,
      fields,
      featureCount: rowCount,
      style: {
        color,
        opacity: 0.85,
        fillColor: color,
        fillOpacity: 0.4,
        strokeColor: color,
        strokeWidth: 2,
        pointRadius: 5,
      },
    };
  }

  // 3. PMTiles
  if (rawFileName.endsWith('.pmtiles')) {
    const meta = await inspectPMTiles(fileOrUrl);
    const pmtilesUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);

    return {
      id,
      name,
      sourceType: 'pmtiles',
      sourceUrl: pmtilesUrl,
      visible: true,
      opacity: 0.9,
      zIndex: 1,
      bounds: meta.bounds,
      fields: meta.vectorLayers?.[0]?.fields
        ? Object.entries(meta.vectorLayers[0].fields).map(([k, t]) => ({
            name: k,
            type: t === 'Number' ? 'number' : 'string',
          }))
        : [],
      featureCount: 0,
      style: {
        color,
        opacity: 0.9,
        fillColor: color,
        fillOpacity: 0.5,
        strokeColor: color,
        strokeWidth: 1.5,
      },
      metadata: {
        minZoom: meta.minZoom,
        maxZoom: meta.maxZoom,
        tileType: meta.tileType,
        vectorLayers: meta.vectorLayers,
      },
    };
  }

  // 4. COG / GeoTIFF
  if (rawFileName.endsWith('.tif') || rawFileName.endsWith('.tiff') || rawFileName.endsWith('.cog')) {
    const meta = await inspectCOG(
      typeof fileOrUrl === 'string' ? fileOrUrl : await fileOrUrl.arrayBuffer()
    );
    const cogUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);

    return {
      id,
      name,
      sourceType: 'cog',
      sourceUrl: cogUrl,
      visible: true,
      opacity: 0.8,
      zIndex: 0,
      bounds: meta.bounds,
      fields: [{ name: 'Band', type: 'number' }],
      featureCount: 1,
      style: {
        color,
        opacity: 0.8,
      },
      metadata: {
        width: meta.width,
        height: meta.height,
        bands: meta.bands,
        hasOverviews: meta.hasOverviews,
        noData: meta.noData,
      },
    };
  }

  // 5. Default: GeoJSON (.geojson, .json)
  const text =
    typeof fileOrUrl === 'string'
      ? await (await fetch(fileOrUrl)).text()
      : await fileOrUrl.text();

  const featureCollection = parseGeoJSON(text);
  const bounds = calculateGeoJSONBounds(featureCollection);
  const fields = extractFieldsFromProperties(featureCollection);

  return {
    id,
    name,
    sourceType: 'geojson',
    sourceUrl: typeof fileOrUrl === 'string' ? fileOrUrl : undefined,
    data: featureCollection,
    visible: true,
    opacity: 0.85,
    zIndex: 1,
    bounds,
    fields,
    featureCount: featureCollection.features.length,
    style: {
      color,
      opacity: 0.85,
      fillColor: color,
      fillOpacity: 0.4,
      strokeColor: color,
      strokeWidth: 2,
      pointRadius: 6,
    },
  };
}
