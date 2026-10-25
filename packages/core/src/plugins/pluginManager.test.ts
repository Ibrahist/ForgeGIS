import { describe, it, expect, vi } from 'vitest';
import { PluginManager } from './pluginManager';
import { ForgePlugin } from '../types/plugins';
import { ForgeLayer } from '../types/layers';
import { ViewState } from '../types/project';

describe('PluginManager Lifecycle and Permission Enforcement', () => {
  const mockView: ViewState = {
    longitude: -122.4,
    latitude: 37.78,
    zoom: 12,
    pitch: 0,
    bearing: 0,
    projection: 'mercator',
    terrain3d: { enabled: false, exaggeration: 1 },
  };

  const mockLayer: ForgeLayer = {
    id: 'layer-mock-1',
    name: 'Sample Layer',
    sourceType: 'geojson',
    visible: true,
    opacity: 1,
    zIndex: 1,
    fields: [],
    featureCount: 1,
    style: { color: '#e3b450' },
  };

  const createMockHooks = () => ({
    getView: vi.fn(() => mockView),
    setView: vi.fn(),
    getLayers: vi.fn(() => [mockLayer]),
    getLayer: vi.fn((id: string) => (id === mockLayer.id ? mockLayer : undefined)),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    updateLayer: vi.fn(),
  });

  it('registers and lists plugins', () => {
    const hooks = createMockHooks();
    const manager = new PluginManager(hooks);

    const plugin: ForgePlugin = {
      manifest: {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'Test plugin description',
        author: 'Tester',
        permissions: ['map:view'],
      },
      initialize: vi.fn(),
    };

    manager.registerPlugin(plugin);
    expect(manager.getRegisteredPlugins()).toHaveLength(1);
    expect(manager.isPluginEnabled('test-plugin')).toBe(false);
  });

  it('initializes and destroys an enabled plugin', async () => {
    const hooks = createMockHooks();
    const manager = new PluginManager(hooks);

    const initFn = vi.fn();
    const destroyFn = vi.fn();

    const plugin: ForgePlugin = {
      manifest: {
        id: 'lifecycle-plugin',
        name: 'Lifecycle Plugin',
        version: '1.0.0',
        description: 'Test lifecycle',
        author: 'Tester',
        permissions: ['map:view', 'layers:read'],
      },
      initialize: initFn,
      destroy: destroyFn,
    };

    manager.registerPlugin(plugin);
    const enabled = await manager.enablePlugin('lifecycle-plugin');
    expect(enabled).toBe(true);
    expect(manager.isPluginEnabled('lifecycle-plugin')).toBe(true);
    expect(initFn).toHaveBeenCalledTimes(1);

    manager.disablePlugin('lifecycle-plugin');
    expect(manager.isPluginEnabled('lifecycle-plugin')).toBe(false);
    expect(destroyFn).toHaveBeenCalledTimes(1);
  });

  it('enforces permission restrictions on plugin context', () => {
    const hooks = createMockHooks();
    const manager = new PluginManager(hooks);

    // Plugin with ONLY map:view permission (no layers:write or map:control)
    const restrictedPlugin: ForgePlugin = {
      manifest: {
        id: 'read-only-plugin',
        name: 'Read Only Plugin',
        version: '1.0.0',
        description: 'Read only',
        author: 'Tester',
        permissions: ['map:view'],
      },
      initialize: (ctx) => {
        // map.getView() should succeed
        expect(ctx.map.getView().zoom).toBe(12);

        // map.setView() should throw permission error
        expect(() => ctx.map.setView({ zoom: 15 })).toThrow(/Permission denied/);

        // layers.add() should throw permission error
        expect(() => ctx.layers.add(mockLayer)).toThrow(/Permission denied/);
      },
    };

    manager.registerPlugin(restrictedPlugin);
    return manager.enablePlugin('read-only-plugin');
  });

  it('isolates plugin errors safely without throwing unhandled exceptions', async () => {
    const hooks = createMockHooks();
    const manager = new PluginManager(hooks);

    const buggyPlugin: ForgePlugin = {
      manifest: {
        id: 'buggy-plugin',
        name: 'Buggy Plugin',
        version: '1.0.0',
        description: 'Throws error on init',
        author: 'Tester',
        permissions: [],
      },
      initialize: () => {
        throw new Error('Something crashed in plugin initialization');
      },
    };

    manager.registerPlugin(buggyPlugin);
    const result = await manager.enablePlugin('buggy-plugin');
    expect(result).toBe(false);
    expect(manager.isPluginEnabled('buggy-plugin')).toBe(false);
  });
});
