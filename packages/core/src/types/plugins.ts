import { ForgeLayer } from './layers';
import { ViewState } from './project';

export type PluginPermission =
  | 'layers:read'
  | 'layers:write'
  | 'map:view'
  | 'map:control'
  | 'sql:execute'
  | 'storage:local'
  | 'ui:panel'
  | 'ui:toolbar';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: PluginPermission[];
}

export interface PluginContext {
  manifest: PluginManifest;
  hasPermission: (perm: PluginPermission) => boolean;
  map: {
    getView: () => ViewState;
    setView: (view: Partial<ViewState>) => void;
  };
  layers: {
    list: () => ReadonlyArray<ForgeLayer>;
    get: (id: string) => ForgeLayer | undefined;
    add: (layer: ForgeLayer) => void;
    remove: (id: string) => void;
  };
}

export interface ForgePlugin {
  manifest: PluginManifest;
  initialize: (ctx: PluginContext) => Promise<void> | void;
  destroy?: () => void;
}
