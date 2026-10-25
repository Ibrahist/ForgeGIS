export * from './timeSlider/timeSliderPlugin';
export * from './timeSlider/TimeSliderWidget';
export * from './planetary/planetaryBasemapsPlugin';
export * from './atmosphere/globeAtmospherePlugin';

import { timeSliderPlugin } from './timeSlider/timeSliderPlugin';
import { planetaryBasemapsPlugin } from './planetary/planetaryBasemapsPlugin';
import { globeAtmospherePlugin } from './atmosphere/globeAtmospherePlugin';
import { ForgePlugin } from '@forgegis/core';

export const ALL_BUILTIN_PLUGINS: ForgePlugin[] = [
  timeSliderPlugin,
  planetaryBasemapsPlugin,
  globeAtmospherePlugin,
];
