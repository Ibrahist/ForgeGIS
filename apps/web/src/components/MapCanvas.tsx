import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Popup } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { useProjectStore, loadSpatialFile } from '@forgegis/core';

// Register PMTiles protocol once globally
const pmtilesProtocol = new Protocol();
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

export function resolveBasemapTileUrl(rawUrl: string): string {
  let key = '';
  if (typeof window !== 'undefined') {
    key = localStorage.getItem('forgegis_carto_api_key') || localStorage.getItem('carto_api_key') || '';
  }
  if (!key && typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CARTO_API_KEY) {
    key = (import.meta as any).env.VITE_CARTO_API_KEY;
  }

  if (key && rawUrl.includes('cartocdn.com') && !rawUrl.includes('key=')) {
    const sep = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${sep}key=${encodeURIComponent(key.trim())}`;
  }
  return rawUrl;
}

export interface MapCanvasProps {
  className?: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ className = '' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);

  const {
    project,
    measureMode,
    measurePoints,
    addMeasurePoint,
    zoomTarget,
    addLayer,
    setViewState,
  } = useProjectStore();

  const [isDragOver, setIsDragOver] = useState(false);
  const [apiKeyVersion, setApiKeyVersion] = useState(0);

  useEffect(() => {
    const onKeyChanged = () => setApiKeyVersion((v) => v + 1);
    window.addEventListener('forgegis-apikeys-updated', onKeyChanged);
    window.addEventListener('storage', onKeyChanged);
    return () => {
      window.removeEventListener('forgegis-apikeys-updated', onKeyChanged);
      window.removeEventListener('storage', onKeyChanged);
    };
  }, []);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialTiles = [resolveBasemapTileUrl(project.basemap.url)];

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'basemap-source': {
            type: 'raster',
            tiles: initialTiles,
            tileSize: 256,
            attribution: project.basemap.attribution || '',
          },
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap-source',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: [project.view.longitude, project.view.latitude],
      zoom: project.view.zoom,
      pitch: project.view.pitch,
      bearing: project.view.bearing,
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      setViewState({
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    });

    map.on('click', (e) => {
      const storeState = useProjectStore.getState();
      if (storeState.measureMode !== 'none') {
        storeState.addMeasurePoint([e.lngLat.lng, e.lngLat.lat]);
        return;
      }

      // Feature Query
      const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];

      // Find all custom layer IDs
      const layerIds = storeState.project.layers
        .filter((l) => l.visible)
        .flatMap((l) => [`${l.id}-circle`, `${l.id}-fill`, `${l.id}-extrusion`, `${l.id}-line`])
        .filter((id) => map.getLayer(id));

      if (layerIds.length === 0) return;

      const features = map.queryRenderedFeatures(bbox, { layers: layerIds });
      if (features.length > 0) {
        const feat = features[0];
        const props = feat.properties || {};

        if (popupRef.current) popupRef.current.remove();

        const tableRows = Object.entries(props)
          .slice(0, 10)
          .map(
            ([k, v]) => `
            <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 11px; padding: 2px 0;">
              <span style="color: #9d9da8; font-family: monospace;">${k}:</span>
              <span style="color: #f5f5f7; font-weight: 500; font-family: monospace;">${v}</span>
            </div>
          `
          )
          .join('');

        const html = `
          <div style="background: #181820; color: #f5f5f7; padding: 8px; border-radius: 8px; font-family: -apple-system, sans-serif; min-width: 180px;">
            <div style="font-weight: 600; font-size: 12px; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; color: #f47fa3;">
              Feature Properties
            </div>
            ${tableRows}
          </div>
        `;

        popupRef.current = new Popup({ closeButton: true, className: 'fg-popup' })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Basemap
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const resolvedUrl = resolveBasemapTileUrl(project.basemap.url);
    const source = map.getSource('basemap-source') as maplibregl.RasterTileSource;
    if (source && source.tiles && source.tiles[0] !== resolvedUrl) {
      // Remove existing basemap layer and source and re-add
      if (map.getLayer('basemap-layer')) map.removeLayer('basemap-layer');
      if (map.getSource('basemap-source')) map.removeSource('basemap-source');

      map.addSource('basemap-source', {
        type: 'raster',
        tiles: [resolvedUrl],
        tileSize: 256,
        attribution: project.basemap.attribution || '',
      });

      // Insert basemap at bottom
      const firstLayer = map.getStyle().layers?.[0]?.id;
      map.addLayer(
        {
          id: 'basemap-layer',
          type: 'raster',
          source: 'basemap-source',
          minzoom: 0,
          maxzoom: 22,
        },
        firstLayer
      );
    }
  }, [project.basemap, apiKeyVersion]);

  // Sync Projection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      if (project.view.projection === 'globe') {
        // @ts-expect-error MapLibre GL v4 globe projection support
        map.setProjection({ type: 'globe' });
      } else {
        // @ts-expect-error MapLibre GL v4 mercator projection support
        map.setProjection({ type: 'mercator' });
      }
    } catch {
      // Projection mode fallback
    }
  }, [project.view.projection]);

  // Sync Pitch & Terrain
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      pitch: project.view.pitch,
      bearing: project.view.bearing,
      duration: 600,
    });
  }, [project.view.pitch, project.view.bearing]);

  // Sync Zoom Target
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !zoomTarget) return;

    if (zoomTarget.bounds) {
      map.fitBounds(zoomTarget.bounds, {
        padding: 80,
        maxZoom: 16,
        duration: 800,
      });
    } else if (zoomTarget.center) {
      map.flyTo({
        center: zoomTarget.center,
        zoom: zoomTarget.zoom || 14,
        duration: 800,
      });
    }
  }, [zoomTarget]);

  // Sync Project Layers (GeoJSON, etc.)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    for (const layer of project.layers) {
      if (!layer.data) continue;

      const sourceId = `src-${layer.id}`;
      let src = map.getSource(sourceId) as maplibregl.GeoJSONSource;

      if (!src) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: layer.data,
        });
      } else {
        src.setData(layer.data);
      }

      // 1. Circle layer for points
      const circleId = `${layer.id}-circle`;
      if (!map.getLayer(circleId)) {
        // Data-driven color expression if categorized or graduated
        let circleColor: unknown = layer.style.color || '#f47fa3';
        if (layer.style.classification?.type === 'categorized' && layer.style.classification.rules) {
          const matchExpr: unknown[] = ['match', ['get', layer.style.classification.property]];
          for (const rule of layer.style.classification.rules) {
            matchExpr.push(rule.value, rule.color);
          }
          matchExpr.push(layer.style.color || '#f47fa3'); // fallback
          circleColor = matchExpr;
        } else if (layer.style.classification?.type === 'graduated' && layer.style.classification.graduatedBins) {
          const stepExpr: unknown[] = ['step', ['get', layer.style.classification.property]];
          const bins = layer.style.classification.graduatedBins;
          stepExpr.push(bins[0].color);
          for (let i = 1; i < bins.length; i++) {
            stepExpr.push(bins[i].min, bins[i].color);
          }
          circleColor = stepExpr;
        }

        map.addLayer({
          id: circleId,
          type: 'circle',
          source: sourceId,
          filter: ['==', '$type', 'Point'],
          paint: {
            // @ts-expect-error MapLibre expression typing
            'circle-color': circleColor,
            'circle-radius': layer.style.pointRadius || 6,
            'circle-opacity': layer.opacity,
            'circle-stroke-color': layer.style.strokeColor || '#0a0a0c',
            'circle-stroke-width': layer.style.strokeWidth || 1.5,
          },
          layout: {
            visibility: layer.visible ? 'visible' : 'none',
          },
        });
      } else {
        map.setLayoutProperty(circleId, 'visibility', layer.visible ? 'visible' : 'none');
        map.setPaintProperty(circleId, 'circle-opacity', layer.opacity);
      }

      // 2. Fill Extrusion layer for 3D polygons
      const extrusionId = `${layer.id}-extrusion`;
      const fillId = `${layer.id}-fill`;
      const lineId = `${layer.id}-line`;

      if (layer.style.extrusion?.enabled) {
        if (!map.getLayer(extrusionId)) {
          const heightExpr = layer.style.extrusion.property
            ? ['*', ['get', layer.style.extrusion.property], layer.style.extrusion.multiplier || 10]
            : (layer.style.extrusion.multiplier || 10) * 10;

          map.addLayer({
            id: extrusionId,
            type: 'fill-extrusion',
            source: sourceId,
            filter: ['==', '$type', 'Polygon'],
            paint: {
              'fill-extrusion-color': layer.style.fillColor || layer.style.color || '#f47fa3',
              // @ts-expect-error Expression height
              'fill-extrusion-height': heightExpr,
              'fill-extrusion-opacity': layer.opacity,
            },
            layout: {
              visibility: layer.visible ? 'visible' : 'none',
            },
          });
        }
        if (map.getLayer(fillId)) map.setLayoutProperty(fillId, 'visibility', 'none');
      } else {
        if (map.getLayer(extrusionId)) map.setLayoutProperty(extrusionId, 'visibility', 'none');

        // Standard 2D polygon fill
        if (!map.getLayer(fillId)) {
          let fillColor: unknown = layer.style.fillColor || layer.style.color || '#f47fa3';
          if (layer.style.classification?.type === 'categorized' && layer.style.classification.rules) {
            const matchExpr: unknown[] = ['match', ['get', layer.style.classification.property]];
            for (const rule of layer.style.classification.rules) {
              matchExpr.push(rule.value, rule.color);
            }
            matchExpr.push(layer.style.color || '#f47fa3');
            fillColor = matchExpr;
          } else if (layer.style.classification?.type === 'graduated' && layer.style.classification.graduatedBins) {
            const stepExpr: unknown[] = ['step', ['get', layer.style.classification.property]];
            const bins = layer.style.classification.graduatedBins;
            stepExpr.push(bins[0].color);
            for (let i = 1; i < bins.length; i++) {
              stepExpr.push(bins[i].min, bins[i].color);
            }
            fillColor = stepExpr;
          }

          map.addLayer({
            id: fillId,
            type: 'fill',
            source: sourceId,
            filter: ['==', '$type', 'Polygon'],
            paint: {
              // @ts-expect-error MapLibre expression typing
              'fill-color': fillColor,
              'fill-opacity': (layer.style.fillOpacity || 0.4) * layer.opacity,
            },
            layout: {
              visibility: layer.visible ? 'visible' : 'none',
            },
          });

          // Polygon outline
          map.addLayer({
            id: lineId,
            type: 'line',
            source: sourceId,
            filter: ['any', ['==', '$type', 'Polygon'], ['==', '$type', 'LineString']],
            paint: {
              'line-color': layer.style.strokeColor || layer.style.color || '#f47fa3',
              'line-width': layer.style.strokeWidth || 1.5,
              'line-opacity': layer.opacity,
            },
            layout: {
              visibility: layer.visible ? 'visible' : 'none',
            },
          });
        } else {
          map.setLayoutProperty(fillId, 'visibility', layer.visible ? 'visible' : 'none');
          map.setLayoutProperty(lineId, 'visibility', layer.visible ? 'visible' : 'none');
          map.setPaintProperty(fillId, 'fill-opacity', (layer.style.fillOpacity || 0.4) * layer.opacity);
          map.setPaintProperty(lineId, 'line-opacity', layer.opacity);
        }
      }
    }
  }, [project.layers]);

  // Sync Measurement Overlay Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const measureSourceId = 'measure-points-source';
    const measureLineLayerId = 'measure-line-layer';
    const measureCircleLayerId = 'measure-circle-layer';

    const measureFeatures: GeoJSON.Feature[] = [];

    if (measureMode === 'area' && measurePoints.length > 2) {
      measureFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...measurePoints, measurePoints[0]]],
        },
        properties: {},
      });
    } else if (measurePoints.length > 1) {
      measureFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: measurePoints,
        },
        properties: {},
      });
    }

    for (const pt of measurePoints) {
      measureFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: pt,
        },
        properties: {},
      });
    }

    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: measureFeatures,
    };

    let src = map.getSource(measureSourceId) as maplibregl.GeoJSONSource;
    if (!src) {
      map.addSource(measureSourceId, {
        type: 'geojson',
        data: geojsonData,
      });

      map.addLayer({
        id: measureLineLayerId,
        type: 'line',
        source: measureSourceId,
        paint: {
          'line-color': '#e3b450',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
        },
      });

      map.addLayer({
        id: measureCircleLayerId,
        type: 'circle',
        source: measureSourceId,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-color': '#ffd0db',
          'circle-radius': 5,
          'circle-stroke-color': '#e3b450',
          'circle-stroke-width': 2,
        },
      });
    } else {
      src.setData(geojsonData);
    }
  }, [measurePoints, measureMode]);

  // Drag and drop onto map
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        try {
          const layer = await loadSpatialFile(files[i]);
          addLayer(layer);
          if (layer.bounds && mapRef.current) {
            mapRef.current.fitBounds(layer.bounds, { padding: 60 });
          }
        } catch (err) {
          alert(`Failed to load dropped file: ${err}`);
        }
      }
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Drag & Drop Visual Indicator */}
      {isDragOver && (
        <div className="absolute inset-4 z-50 border-2 border-dashed border-[#f47fa3] rounded-3xl bg-[#0a0a0c]/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none animate-fadeIn">
          <span className="text-sm font-semibold text-[#f5f5f7] mb-1">Drop Spatial Data File</span>
          <span className="text-xs text-[#9d9da8]">
            GeoJSON, CSV with lat/lon, GeoParquet, PMTiles, or COG (.tif)
          </span>
        </div>
      )}
    </div>
  );
};
