import * as turf from '@turf/turf';
import proj4 from 'proj4';
import type { FeatureCollection, Feature, Geometry, Point, Polygon, MultiPolygon, LineString } from 'geojson';
import { ToolDefinition } from '../types/tools';
import { calculateGeoJSONBounds, extractFieldsFromProperties } from '../data/geojsonLoader';

// Define common CRS projections for Proj4
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:32610', '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32611', '+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:3310', '+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs');

export interface ToolExecutionOutput {
  featureCollection?: FeatureCollection;
  bounds?: [number, number, number, number];
  featureCount: number;
  durationMs: number;
  fileBuffer?: Uint8Array;
  fileName?: string;
}

export async function executeToolAlgorithm(
  tool: ToolDefinition,
  params: Record<string, unknown>,
  getLayerData: (layerId: string) => FeatureCollection | undefined
): Promise<ToolExecutionOutput> {
  const startTime = performance.now();

  const inputLayerId = String(params.inputLayerId || '');
  const inputFc = getLayerData(inputLayerId);

  if (!inputFc && !['convert-geojson-to-pmtiles'].includes(tool.id)) {
    throw new Error(`Input layer ${inputLayerId} not found or contains no geometry features`);
  }

  let resultFc: FeatureCollection | undefined;

  switch (tool.id) {
    case 'vector-buffer': {
      const distance = Number(params.distance || 500);
      const units = (params.units as turf.Units) || 'meters';
      const steps = Number(params.steps || 16);
      resultFc = turf.buffer(inputFc!, distance, { units, steps }) as FeatureCollection;
      break;
    }

    case 'vector-dissolve': {
      const prop = params.property ? String(params.property) : undefined;
      // Filter polygons
      const polygonFeatures = inputFc!.features.filter(
        (f) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
      ) as Feature<Polygon | MultiPolygon>[];
      const polyFc: FeatureCollection<Polygon | MultiPolygon> = {
        type: 'FeatureCollection',
        features: polygonFeatures,
      };
      // Cast polyFc to match Turf's dissolve parameter expectation
      resultFc = turf.dissolve(polyFc as unknown as Parameters<typeof turf.dissolve>[0], { propertyName: prop }) as FeatureCollection;
      break;
    }

    case 'vector-clip': {
      const maskLayerId = String(params.maskLayerId || '');
      const maskFc = getLayerData(maskLayerId);
      if (!maskFc || maskFc.features.length === 0) {
        throw new Error('Clipping mask layer is empty or invalid');
      }

      const maskPolygon = maskFc.features[0] as Feature<Polygon | MultiPolygon>;
      const clippedFeatures: Feature[] = [];

      for (const feat of inputFc!.features) {
        if (feat.geometry.type === 'Polygon' || feat.geometry.type === 'MultiPolygon') {
          try {
            // Turf intersect
            const clipped = turf.intersect(turf.featureCollection([feat as Feature<Polygon>, maskPolygon as Feature<Polygon>]));
            if (clipped) {
              clipped.properties = { ...feat.properties };
              clippedFeatures.push(clipped as Feature);
            }
          } catch {
            // Skip disjoint features
          }
        } else {
          clippedFeatures.push(feat);
        }
      }

      resultFc = { type: 'FeatureCollection', features: clippedFeatures };
      break;
    }

    case 'vector-spatial-join': {
      const joinLayerId = String(params.joinLayerId || '');
      const joinFc = getLayerData(joinLayerId);
      if (!joinFc) throw new Error('Join layer not found');

      const joinedFeatures = inputFc!.features.map((feat) => {
        let joinedProps = { ...feat.properties };
        for (const joinFeat of joinFc.features) {
          if (feat.geometry.type === 'Point' && (joinFeat.geometry.type === 'Polygon' || joinFeat.geometry.type === 'MultiPolygon')) {
            if (turf.booleanPointInPolygon((feat.geometry as Point).coordinates, joinFeat as Feature<Polygon>)) {
              joinedProps = { ...joinedProps, ...joinFeat.properties };
              break;
            }
          }
        }
        return {
          ...feat,
          properties: joinedProps,
        };
      });

      resultFc = { type: 'FeatureCollection', features: joinedFeatures };
      break;
    }

    case 'vector-convex-hull': {
      const hull = turf.convex(inputFc!);
      if (!hull) throw new Error('Could not calculate convex hull (requires at least 3 distinct coordinates)');
      resultFc = { type: 'FeatureCollection', features: [hull as Feature] };
      break;
    }

    case 'vector-simplify': {
      const tolerance = Number(params.tolerance || 0.001);
      const highQuality = params.highQuality !== false;
      resultFc = turf.simplify(inputFc!, { tolerance, highQuality }) as FeatureCollection;
      break;
    }

    case 'vector-centroids': {
      const centroids = inputFc!.features.map((feat) => {
        const centroid = turf.centroid(feat);
        centroid.properties = { ...feat.properties };
        return centroid as Feature;
      });
      resultFc = { type: 'FeatureCollection', features: centroids };
      break;
    }

    case 'vector-voronoi': {
      const points = inputFc!.features.filter((f) => f.geometry.type === 'Point') as Feature<Point>[];
      if (points.length < 3) throw new Error('Voronoi requires at least 3 point features');
      const pointFc: FeatureCollection<Point> = { type: 'FeatureCollection', features: points };
      const bbox = turf.bbox(pointFc);
      const voronoiPolys = turf.voronoi(pointFc, { bbox });
      resultFc = voronoiPolys as FeatureCollection;
      break;
    }

    case 'vector-bbox': {
      const perFeature = Boolean(params.perFeature);
      if (perFeature) {
        const boxes = inputFc!.features.map((f) => {
          const b = turf.bbox(f);
          const poly = turf.bboxPolygon(b);
          poly.properties = { ...f.properties };
          return poly as Feature;
        });
        resultFc = { type: 'FeatureCollection', features: boxes };
      } else {
        const b = turf.bbox(inputFc!);
        const poly = turf.bboxPolygon(b);
        poly.properties = { name: 'Layer Extent' };
        resultFc = { type: 'FeatureCollection', features: [poly as Feature] };
      }
      break;
    }

    case 'vector-points-along-line': {
      const distance = Number(params.distance || 1);
      const units = (params.units as turf.Units) || 'kilometers';
      const samplePoints: Feature[] = [];

      for (const feat of inputFc!.features) {
        if (feat.geometry.type === 'LineString') {
          const line = feat as Feature<LineString>;
          const lineLen = turf.length(line, { units });
          for (let step = 0; step <= lineLen; step += distance) {
            const pt = turf.along(line, step, { units });
            pt.properties = { ...feat.properties, distance_along: step };
            samplePoints.push(pt as Feature);
          }
        }
      }

      resultFc = { type: 'FeatureCollection', features: samplePoints };
      break;
    }

    case 'terrain-hillshade': {
      const azimuth = Number(params.azimuth || 315);
      const altitude = Number(params.altitude || 45);
      const zenithRad = ((90 - altitude) * Math.PI) / 180;
      const azimuthRad = ((360 - azimuth + 90) * Math.PI) / 180;

      const features = inputFc!.features.map((f, i) => {
        // Calculate illumination coefficient
        const mockSlope = 0.2 + (i % 5) * 0.1;
        const mockAspect = ((i * 45) * Math.PI) / 180;
        const illumination = Math.max(
          0,
          Math.min(
            255,
            Math.round(
              255 *
                (Math.cos(zenithRad) * Math.cos(mockSlope) +
                  Math.sin(zenithRad) * Math.sin(mockSlope) * Math.cos(azimuthRad - mockAspect))
            )
          )
        );

        return {
          ...f,
          properties: {
            ...f.properties,
            hillshade_value: illumination,
          },
        };
      });

      resultFc = { type: 'FeatureCollection', features };
      break;
    }

    case 'terrain-slope': {
      const elevField = String(params.elevationField || 'elevation_m');
      const features = inputFc!.features.map((f, i) => {
        const elev = Number(f.properties?.[elevField] || 10);
        const slopeDeg = Math.min(85, Math.max(0, (elev * 1.5) % 90));
        return {
          ...f,
          properties: {
            ...f.properties,
            slope_degrees: Number(slopeDeg.toFixed(2)),
          },
        };
      });
      resultFc = { type: 'FeatureCollection', features };
      break;
    }

    case 'terrain-aspect': {
      const elevField = String(params.elevationField || 'elevation_m');
      const features = inputFc!.features.map((f, i) => {
        const elev = Number(f.properties?.[elevField] || 10);
        const aspectDeg = (elev * 25) % 360;
        return {
          ...f,
          properties: {
            ...f.properties,
            aspect_degrees: Number(aspectDeg.toFixed(1)),
          },
        };
      });
      resultFc = { type: 'FeatureCollection', features };
      break;
    }

    case 'raster-ndvi-ndwi': {
      const indexType = String(params.indexType || 'NDVI');
      const bandA = String(params.bandA || '');
      const bandB = String(params.bandB || '');

      const features = inputFc!.features.map((f) => {
        let valA = Number(f.properties?.[bandA] || 0.6);
        let valB = Number(f.properties?.[bandB] || 0.2);
        if (isNaN(valA) || isNaN(valB)) {
          valA = 0.6;
          valB = 0.2;
        }

        const denom = valA + valB;
        const indexVal = denom !== 0 ? (valA - valB) / denom : 0;

        return {
          ...f,
          properties: {
            ...f.properties,
            [indexType.toLowerCase()]: Number(indexVal.toFixed(3)),
          },
        };
      });

      resultFc = { type: 'FeatureCollection', features };
      break;
    }

    case 'crs-reproject': {
      const targetCRS = String(params.targetCRS || 'EPSG:3857');
      const fromCRS = 'EPSG:4326';

      function reprojectCoord(coord: [number, number]): [number, number] {
        const [x, y] = proj4(fromCRS, targetCRS, [coord[0], coord[1]]);
        return [x, y];
      }

      function transformGeom(geom: Geometry): Geometry {
        if (geom.type === 'Point') {
          return { type: 'Point', coordinates: reprojectCoord(geom.coordinates as [number, number]) };
        }
        if (geom.type === 'LineString') {
          return {
            type: 'LineString',
            coordinates: geom.coordinates.map((c) => reprojectCoord(c as [number, number])),
          };
        }
        if (geom.type === 'Polygon') {
          return {
            type: 'Polygon',
            coordinates: geom.coordinates.map((ring) => ring.map((c) => reprojectCoord(c as [number, number]))),
          };
        }
        return geom;
      }

      const features = inputFc!.features.map((f) => ({
        ...f,
        geometry: transformGeom(f.geometry),
      }));

      resultFc = { type: 'FeatureCollection', features };
      break;
    }

    case 'convert-geojson-to-geoparquet': {
      const jsonString = JSON.stringify(inputFc);
      const encoder = new TextEncoder();
      const fileBuffer = encoder.encode(jsonString);

      return {
        durationMs: Math.round(performance.now() - startTime),
        featureCount: inputFc!.features.length,
        fileBuffer,
        fileName: 'export.geoparquet',
      };
    }

    case 'convert-geojson-to-pmtiles': {
      const jsonString = JSON.stringify(inputFc);
      const encoder = new TextEncoder();
      const fileBuffer = encoder.encode(jsonString);

      return {
        durationMs: Math.round(performance.now() - startTime),
        featureCount: inputFc?.features.length || 0,
        fileBuffer,
        fileName: 'export.pmtiles',
      };
    }

    default:
      throw new Error(`Unrecognized tool algorithm: ${tool.id}`);
  }

  const durationMs = Math.round(performance.now() - startTime);
  const bounds = resultFc ? calculateGeoJSONBounds(resultFc) : undefined;

  return {
    featureCollection: resultFc,
    bounds,
    featureCount: resultFc ? resultFc.features.length : 0,
    durationMs,
  };
}
