import { fromUrl, fromBlob, fromArrayBuffer, GeoTIFF, GeoTIFFImage } from 'geotiff';

export interface CogMetadataResult {
  width: number;
  height: number;
  tileWidth?: number;
  tileHeight?: number;
  bands: number;
  bitsPerSample: number[];
  bounds?: [number, number, number, number];
  hasOverviews: boolean;
  sampleFormat?: number[];
  noData?: number;
}

export async function inspectCOG(source: string | Blob | ArrayBuffer): Promise<CogMetadataResult> {
  let tiff: GeoTIFF;
  if (typeof source === 'string') {
    tiff = await fromUrl(source);
  } else if (source instanceof Blob) {
    tiff = await fromBlob(source);
  } else {
    tiff = await fromArrayBuffer(source);
  }

  const imageCount = await tiff.getImageCount();
  const image: GeoTIFFImage = await tiff.getImage(0);

  const width = image.getWidth();
  const height = image.getHeight();
  const tileWidth = image.getTileWidth();
  const tileHeight = image.getTileHeight();
  const bands = image.getSamplesPerPixel();
  const bitsPerSample = image.getBitsPerSample() as unknown as number[];

  let bounds: [number, number, number, number] | undefined;
  try {
    const rawBounds = image.getBoundingBox();
    if (rawBounds && rawBounds.length === 4) {
      bounds = [rawBounds[0], rawBounds[1], rawBounds[2], rawBounds[3]];
    }
  } catch {
    // If no georeference tags present
  }

  const noData = image.getGDALNoData() as number | undefined;

  return {
    width,
    height,
    tileWidth,
    tileHeight,
    bands,
    bitsPerSample: Array.isArray(bitsPerSample) ? bitsPerSample : [bitsPerSample],
    bounds,
    hasOverviews: imageCount > 1,
    noData: noData !== null ? noData : undefined,
  };
}
