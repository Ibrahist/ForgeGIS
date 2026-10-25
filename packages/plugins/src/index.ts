export interface BuiltinPluginSummary {
  id: string;
  name: string;
  version: string;
  description: string;
}

export const BUILTIN_PLUGINS: BuiltinPluginSummary[] = [
  {
    id: 'time-slider',
    name: 'Time Series Slider',
    version: '1.0.0',
    description: 'Temporal data playback and dynamic time-series layer filtering',
  },
  {
    id: 'planetary-basemaps',
    name: 'Planetary Basemap Pack',
    version: '1.0.0',
    description: 'Mars, Moon, and night-lights basemaps with automatic globe projection',
  },
  {
    id: 'globe-atmosphere',
    name: 'Atmosphere & Terminator Effect',
    version: '1.0.0',
    description: 'Custom 3D globe atmosphere shader, terminator line, and space starfield',
  },
];
