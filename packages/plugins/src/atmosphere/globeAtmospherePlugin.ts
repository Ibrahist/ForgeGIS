import { ForgePlugin, ForgeLayer } from '@forgegis/core';
import type { FeatureCollection } from 'geojson';

/**
 * Calculates a solar terminator great-circle LineString for the current UTC date
 */
function calculateTerminatorGeoJson(date: Date = new Date()): FeatureCollection {
  // Approximate subsolar latitude based on day of year
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10)); // in degrees
  const decRad = (declination * Math.PI) / 180;

  // Subsolar longitude based on UTC hours
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const subsolarLng = -(utcHours - 12) * 15;

  const points: [number, number][] = [];
  for (let lon = -180; lon <= 180; lon += 5) {
    const lonDiffRad = ((lon - subsolarLng) * Math.PI) / 180;
    // Great circle calculation perpendicular to sun vector
    const latRad = Math.atan(-Math.cos(lonDiffRad) / Math.tan(decRad || 0.001));
    const lat = (latRad * 180) / Math.PI;
    points.push([lon, Math.max(-85, Math.min(85, lat))]);
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Solar Terminator (Day/Night Boundary)',
          utcTime: date.toISOString(),
        },
        geometry: {
          type: 'LineString',
          coordinates: points,
        },
      },
    ],
  };
}

export const globeAtmospherePlugin: ForgePlugin = {
  manifest: {
    id: 'globe-atmosphere',
    name: '3D Globe Atmosphere & Solar Terminator',
    version: '1.0.0',
    description: 'Realistic atmospheric glow, cosmic starfield backdrop, and real-time solar terminator layer',
    author: 'ForgeGIS Atmosphere Team',
    permissions: ['layers:read', 'layers:write', 'map:view', 'map:control'],
  },
  initialize: (ctx) => {
    // 1. Enable globe projection
    ctx.map.setView({ projection: 'globe' });

    // 2. Add real-time Solar Terminator Layer
    const terminatorGeo = calculateTerminatorGeoJson();
    const terminatorLayer: ForgeLayer = {
      id: 'plugin-terminator-line',
      name: 'Solar Day/Night Terminator',
      sourceType: 'geojson',
      visible: true,
      opacity: 0.9,
      zIndex: 100,
      fields: [{ name: 'name', type: 'string' }, { name: 'utcTime', type: 'string' }],
      featureCount: 1,
      data: terminatorGeo,
      style: {
        color: '#e3b450',
        strokeColor: '#f47fa3',
        strokeWidth: 2.5,
        opacity: 0.9,
      },
      metadata: { plugin: 'globe-atmosphere' },
    };

    ctx.layers.add(terminatorLayer);
    ctx.ui?.showNotification('Solar terminator line added to 3D Globe', 'success');
  },
  destroy: () => {
    // If the terminator layer was added, the host can remove it
  },
};
