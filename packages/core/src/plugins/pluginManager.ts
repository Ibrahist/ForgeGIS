import {
  ForgePlugin,
  PluginManifest,
  PluginContext,
  PluginPermission,
} from '../types/plugins';
import { ForgeLayer } from '../types/layers';
import { ViewState } from '../types/project';

export interface PluginManagerHostHooks {
  getView: () => ViewState;
  setView: (view: Partial<ViewState>) => void;
  getLayers: () => ReadonlyArray<ForgeLayer>;
  getLayer: (id: string) => ForgeLayer | undefined;
  addLayer: (layer: ForgeLayer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, patch: Partial<ForgeLayer>) => void;
  executeSql?: (query: string) => Promise<{ columns: string[]; rows: unknown[][]; durationMs: number }>;
  showNotification?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export class PluginManager {
  private plugins = new Map<string, ForgePlugin>();
  private activePluginIds = new Set<string>();
  private hostHooks: PluginManagerHostHooks;
  private listeners = new Set<() => void>();

  constructor(hooks: PluginManagerHostHooks) {
    this.hostHooks = hooks;
  }

  /**
   * Update host hooks if store instance changes
   */
  public updateHooks(hooks: PluginManagerHostHooks): void {
    this.hostHooks = hooks;
  }

  /**
   * Register a plugin into the manager
   */
  public registerPlugin(plugin: ForgePlugin): void {
    if (!plugin || !plugin.manifest?.id) {
      throw new Error('Invalid plugin: missing manifest or id');
    }
    this.plugins.set(plugin.manifest.id, plugin);
    this.notify();
  }

  /**
   * Unregister a plugin and destroy if active
   */
  public unregisterPlugin(id: string): void {
    if (this.activePluginIds.has(id)) {
      this.disablePlugin(id);
    }
    this.plugins.delete(id);
    this.notify();
  }

  /**
   * Returns list of all registered plugins
   */
  public getRegisteredPlugins(): ForgePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if a plugin is currently enabled
   */
  public isPluginEnabled(id: string): boolean {
    return this.activePluginIds.has(id);
  }

  /**
   * Enable and initialize a registered plugin
   */
  public async enablePlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Cannot enable plugin "${id}": plugin not registered`);
    }

    if (this.activePluginIds.has(id)) {
      return true; // Already active
    }

    const context = this.createContext(plugin.manifest);
    try {
      await plugin.initialize(context);
      this.activePluginIds.add(id);
      this.notify();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to initialize plugin "${id}":`, msg);
      if (this.hostHooks.showNotification) {
        this.hostHooks.showNotification(`Error enabling plugin "${plugin.manifest.name}": ${msg}`, 'error');
      }
      return false;
    }
  }

  /**
   * Disable and destroy an active plugin
   */
  public disablePlugin(id: string): void {
    const plugin = this.plugins.get(id);
    if (!plugin || !this.activePluginIds.has(id)) {
      return;
    }

    try {
      if (typeof plugin.destroy === 'function') {
        plugin.destroy();
      }
    } catch (err: unknown) {
      console.error(`Error destroying plugin "${id}":`, err);
    } finally {
      this.activePluginIds.delete(id);
      this.notify();
    }
  }

  /**
   * Subscribe to plugin manager state changes
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('Error in plugin listener:', e);
      }
    });
  }

  /**
   * Creates a capability-restricted context sandbox for a given plugin
   */
  public createContext(manifest: PluginManifest): PluginContext {
    const hasPermission = (perm: PluginPermission): boolean => {
      return manifest.permissions.includes(perm);
    };

    return {
      manifest,
      hasPermission,
      map: {
        getView: () => {
          if (!hasPermission('map:view')) {
            throw new Error(`Permission denied: Plugin "${manifest.id}" lacks "map:view" permission`);
          }
          return this.hostHooks.getView();
        },
        setView: (view: Partial<ViewState>) => {
          if (!hasPermission('map:control')) {
            throw new Error(`Permission denied: Plugin "${manifest.id}" lacks "map:control" permission`);
          }
          this.hostHooks.setView(view);
        },
      },
      layers: {
        list: () => {
          if (!hasPermission('layers:read')) {
            throw new Error(`Permission denied: Plugin "${manifest.id}" lacks "layers:read" permission`);
          }
          return this.hostHooks.getLayers();
        },
        get: (id: string) => {
          if (!hasPermission('layers:read')) {
            throw new Error(`Permission denied: Plugin "${manifest.id}" lacks "layers:read" permission`);
          }
          return this.hostHooks.getLayer(id);
        },
        add: (layer: ForgeLayer) => {
          if (!hasPermission('layers:write')) {
            throw new Error(`Permission denied: Plugin "${manifest.id}" lacks "layers:write" permission`);
          }
          this.hostHooks.addLayer(layer);
        },
        remove: (id: string) => {
          if (!hasPermission('layers:write')) {
            throw new Error(`Permission denied: Plugin "${manifest.id}" lacks "layers:write" permission`);
          }
          this.hostHooks.removeLayer(id);
        },
        update: (id: string, patch: Partial<ForgeLayer>) => {
          if (!hasPermission('layers:write')) {
            throw new Error(`Permission denied: Plugin "${manifest.id}" lacks "layers:write" permission`);
          }
          this.hostHooks.updateLayer(id, patch);
        },
      },
      sql: this.hostHooks.executeSql
        ? {
            execute: async (query: string) => {
              if (!hasPermission('sql:execute')) {
                throw new Error(`Permission denied: Plugin "${manifest.id}" lacks "sql:execute" permission`);
              }
              return this.hostHooks.executeSql!(query);
            },
          }
        : undefined,
      ui: {
        showNotification: (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
          this.hostHooks.showNotification?.(msg, type);
        },
      },
    };
  }
}
