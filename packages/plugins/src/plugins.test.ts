import { describe, it, expect, vi } from 'vitest';
import { timeSliderManager, timeSliderPlugin } from './timeSlider/timeSliderPlugin';
import { planetaryBasemapsPlugin, PLANETARY_BASEMAPS } from './planetary/planetaryBasemapsPlugin';
import { globeAtmospherePlugin } from './atmosphere/globeAtmospherePlugin';
import { PluginContext } from '@forgegis/core';

describe('Builtin Production Plugins', () => {
  const createMockContext = (manifest: any): PluginContext => ({
    manifest,
    hasPermission: () => true,
    map: {
      getView: vi.fn(() => ({
        longitude: 0,
        latitude: 0,
        zoom: 2,
        pitch: 0,
        bearing: 0,
        projection: 'mercator' as const,
        terrain3d: { enabled: false, exaggeration: 1 },
      })),
      setView: vi.fn(),
    },
    layers: {
      list: vi.fn(() => []),
      get: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      update: vi.fn(),
    },
    ui: {
      showNotification: vi.fn(),
    },
  });

  describe('Time Series Slider Plugin', () => {
    it('manages temporal playback state and calculations', () => {
      const ctx = createMockContext(timeSliderPlugin.manifest);
      timeSliderPlugin.initialize(ctx);

      const state1 = timeSliderManager.getState();
      expect(state1.enabled).toBe(true);
      expect(state1.isPlaying).toBe(false);

      // Play and Pause
      timeSliderManager.play();
      expect(timeSliderManager.getState().isPlaying).toBe(true);

      timeSliderManager.pause();
      expect(timeSliderManager.getState().isPlaying).toBe(false);

      // Progress & formatted time
      timeSliderManager.setProgress(50);
      const state50 = timeSliderManager.getState();
      expect(state50.progress).toBe(50);
      expect(state50.currentTimeFormatted).toContain('12:00 UTC');

      // Speed change
      timeSliderManager.setSpeed(5);
      expect(timeSliderManager.getState().speed).toBe(5);

      timeSliderPlugin.destroy?.();
      expect(timeSliderManager.getState().enabled).toBe(false);
    });
  });

  describe('Planetary Basemaps Plugin', () => {
    it('provides Mars, Moon, and Earth at Night basemaps', () => {
      expect(PLANETARY_BASEMAPS).toHaveLength(3);
      const mars = PLANETARY_BASEMAPS.find((b) => b.id === 'mars-mola');
      expect(mars).toBeDefined();
      expect(mars?.type).toBe('planetary');
      expect(mars?.attribution).toContain('NASA');

      const moon = PLANETARY_BASEMAPS.find((b) => b.id === 'moon-lro');
      expect(moon).toBeDefined();
      expect(moon?.attribution).toContain('USGS');
    });

    it('switches view projection to globe on activation', () => {
      const ctx = createMockContext(planetaryBasemapsPlugin.manifest);
      planetaryBasemapsPlugin.initialize(ctx);

      expect(ctx.map.setView).toHaveBeenCalledWith({
        projection: 'globe',
      });
      expect(ctx.ui?.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Planetary basemaps enabled'),
        'success'
      );
    });
  });

  describe('Globe Atmosphere & Solar Terminator Plugin', () => {
    it('adds real-time solar terminator layer to globe', () => {
      const ctx = createMockContext(globeAtmospherePlugin.manifest);
      globeAtmospherePlugin.initialize(ctx);

      expect(ctx.map.setView).toHaveBeenCalledWith({
        projection: 'globe',
      });
      expect(ctx.layers.add).toHaveBeenCalledTimes(1);

      const addedLayer = (ctx.layers.add as any).mock.calls[0][0];
      expect(addedLayer.id).toBe('plugin-terminator-line');
      expect(addedLayer.data.type).toBe('FeatureCollection');
      expect(addedLayer.data.features[0].geometry.type).toBe('LineString');
      expect(addedLayer.data.features[0].geometry.coordinates.length).toBeGreaterThan(10);
    });
  });
});
