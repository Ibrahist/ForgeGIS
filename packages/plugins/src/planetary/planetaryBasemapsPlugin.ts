import { ForgePlugin, BasemapConfig } from '@forgegis/core';

export const PLANETARY_BASEMAPS: BasemapConfig[] = [
  {
    id: 'mars-mola',
    name: 'Mars (MOLA / Viking MDIM2.1)',
    type: 'planetary',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MOLA_blend200ppx_HRSC_ClrShade_clon0/1.0.0//default/default028mm/{z}/{y}/{x}.jpg',
    attribution: 'NASA / JPL / USGS Astrogeology',
  },
  {
    id: 'moon-lro',
    name: 'Moon (LRO WAC Mosaic)',
    type: 'planetary',
    url: 'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0//default/default028mm/{z}/{y}/{x}.jpg',
    attribution: 'NASA / GSFC / Arizona State University / USGS',
  },
  {
    id: 'earth-night',
    name: 'Earth at Night (VIIRS Black Marble)',
    type: 'planetary',
    url: 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_Black_Marble/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
    attribution: 'NASA Earth Observatory / NOAA',
  },
];

export const planetaryBasemapsPlugin: ForgePlugin = {
  manifest: {
    id: 'planetary-basemaps',
    name: 'Planetary Basemaps & Terrestrial Night',
    version: '1.0.0',
    description: 'Extraterrestrial Mars & Moon imagery plus NASA VIIRS Earth at Night with 3D Globe Projection',
    author: 'ForgeGIS Planetary Team',
    permissions: ['map:view', 'map:control'],
  },
  initialize: (ctx) => {
    // When enabled, switch projection to globe for true planetary spherical view
    ctx.map.setView({
      projection: 'globe',
    });
    ctx.ui?.showNotification('Planetary basemaps enabled! Switched to 3D Globe view.', 'success');
  },
  destroy: () => {
    // Reverts or preserves projection
  },
};
