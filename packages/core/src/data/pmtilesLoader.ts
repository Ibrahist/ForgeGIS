import { PMTiles } from 'pmtiles';

export interface PMTilesMetadataResult {
  bounds?: [number, number, number, number];
  minZoom: number;
  maxZoom: number;
  center?: [number, number, number];
  tileType: 'vector' | 'raster' | 'mvt';
  vectorLayers?: { id: string; fields?: Record<string, string> }[];
  attribution?: string;
  description?: string;
}

export async function inspectPMTiles(urlOrFile: string | File): Promise<PMTilesMetadataResult> {
  let pmtiles: PMTiles;
  if (typeof urlOrFile === 'string') {
    pmtiles = new PMTiles(urlOrFile);
  } else {
    // For local File/Blob in browser
    const bufferSource = {
      getBytes: async (offset: number, length: number) => {
        const slice = urlOrFile.slice(offset, offset + length);
        const buf = await slice.arrayBuffer();
        return { data: buf };
      },
      getKey: () => urlOrFile.name,
    };
    pmtiles = new PMTiles(bufferSource);
  }

  const header = await pmtiles.getHeader();
  let metadata: Record<string, unknown> = {};
  try {
    metadata = (await pmtiles.getMetadata()) as Record<string, unknown>;
  } catch {
    // Some pmtiles might not have metadata json
  }

  const bounds: [number, number, number, number] = [
    header.minLon,
    header.minLat,
    header.maxLon,
    header.maxLat,
  ];

  const center: [number, number, number] = [
    header.centerLon,
    header.centerLat,
    header.centerZoom,
  ];

  const vectorLayers = (metadata.vector_layers as { id: string; fields?: Record<string, string> }[]) || [];

  return {
    bounds,
    minZoom: header.minZoom,
    maxZoom: header.maxZoom,
    center,
    tileType: header.tileType === 1 ? 'vector' : 'raster',
    vectorLayers,
    attribution: typeof metadata.attribution === 'string' ? metadata.attribution : undefined,
    description: typeof metadata.description === 'string' ? metadata.description : undefined,
  };
}
