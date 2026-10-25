import { ViewState, ForgeProject } from '../types/project';

export type ForgePostMessageType =
  | 'FORGEGIS_SET_LAYER'
  | 'FORGEGIS_FLY_TO'
  | 'FORGEGIS_GET_VIEW'
  | 'FORGEGIS_GET_PROJECT'
  | 'FORGEGIS_EXECUTE_SQL'
  | 'FORGEGIS_HIGHLIGHT_FEATURE'
  | 'FORGEGIS_VIEW_CHANGED'
  | 'FORGEGIS_PROJECT_DATA'
  | 'FORGEGIS_SQL_RESULT'
  | 'FORGEGIS_ERROR';

export interface SetLayerMessage {
  type: 'FORGEGIS_SET_LAYER';
  payload: {
    layerId: string;
    visible?: boolean;
    opacity?: number;
  };
}

export interface FlyToMessage {
  type: 'FORGEGIS_FLY_TO';
  payload: {
    center: [number, number];
    zoom?: number;
    pitch?: number;
    bearing?: number;
    duration?: number;
  };
}

export interface GetViewMessage {
  type: 'FORGEGIS_GET_VIEW';
}

export interface GetProjectMessage {
  type: 'FORGEGIS_GET_PROJECT';
}

export interface ExecuteSqlMessage {
  type: 'FORGEGIS_EXECUTE_SQL';
  payload: {
    query: string;
  };
}

export interface HighlightFeatureMessage {
  type: 'FORGEGIS_HIGHLIGHT_FEATURE';
  payload: {
    layerId: string;
    featureId: string | number;
  };
}

export type ForgeIncomingMessage =
  | SetLayerMessage
  | FlyToMessage
  | GetViewMessage
  | GetProjectMessage
  | ExecuteSqlMessage
  | HighlightFeatureMessage;

export interface ViewChangedMessage {
  type: 'FORGEGIS_VIEW_CHANGED';
  payload: ViewState;
}

export interface ProjectDataMessage {
  type: 'FORGEGIS_PROJECT_DATA';
  payload: ForgeProject;
}

export interface SqlResultMessage {
  type: 'FORGEGIS_SQL_RESULT';
  payload: {
    query: string;
    columns: string[];
    rows: unknown[][];
    durationMs: number;
    rowCount: number;
  };
}

export interface ErrorMessage {
  type: 'FORGEGIS_ERROR';
  payload: {
    message: string;
    originalType?: string;
  };
}

export type ForgeOutgoingMessage =
  | ViewChangedMessage
  | ProjectDataMessage
  | SqlResultMessage
  | ErrorMessage;

export interface PostMessageBridgeHandlers {
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  flyTo: (params: FlyToMessage['payload']) => void;
  getView: () => ViewState;
  getProject: () => ForgeProject;
  executeSql?: (query: string) => Promise<{ columns: string[]; rows: unknown[][]; durationMs: number }>;
  highlightFeature?: (layerId: string, featureId: string | number) => void;
}

/**
 * Initializes cross-frame message listener for embedded iframe deployments
 */
export function setupPostMessageBridge(
  handlers: PostMessageBridgeHandlers,
  targetWindow: Window = window
): () => void {
  const listener = async (event: MessageEvent) => {
    const data = event.data;
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') {
      return;
    }

    const respond = (message: ForgeOutgoingMessage) => {
      if (event.source && typeof (event.source as Window).postMessage === 'function') {
        (event.source as Window).postMessage(message, event.origin || '*');
      }
    };

    try {
      switch (data.type as ForgePostMessageType) {
        case 'FORGEGIS_SET_LAYER': {
          const { layerId, visible, opacity } = data.payload || {};
          if (typeof visible === 'boolean') {
            handlers.setLayerVisibility(layerId, visible);
          }
          if (typeof opacity === 'number') {
            handlers.setLayerOpacity(layerId, opacity);
          }
          break;
        }

        case 'FORGEGIS_FLY_TO': {
          if (data.payload?.center) {
            handlers.flyTo(data.payload);
          }
          break;
        }

        case 'FORGEGIS_GET_VIEW': {
          const view = handlers.getView();
          respond({ type: 'FORGEGIS_VIEW_CHANGED', payload: view });
          break;
        }

        case 'FORGEGIS_GET_PROJECT': {
          const project = handlers.getProject();
          respond({ type: 'FORGEGIS_PROJECT_DATA', payload: project });
          break;
        }

        case 'FORGEGIS_EXECUTE_SQL': {
          if (handlers.executeSql && data.payload?.query) {
            const res = await handlers.executeSql(data.payload.query);
            respond({
              type: 'FORGEGIS_SQL_RESULT',
              payload: {
                query: data.payload.query,
                columns: res.columns,
                rows: res.rows,
                durationMs: res.durationMs,
                rowCount: res.rows.length,
              },
            });
          }
          break;
        }

        case 'FORGEGIS_HIGHLIGHT_FEATURE': {
          if (handlers.highlightFeature && data.payload) {
            handlers.highlightFeature(data.payload.layerId, data.payload.featureId);
          }
          break;
        }
      }
    } catch (err: unknown) {
      respond({
        type: 'FORGEGIS_ERROR',
        payload: {
          message: err instanceof Error ? err.message : String(err),
          originalType: data.type,
        },
      });
    }
  };

  targetWindow.addEventListener('message', listener);
  return () => {
    targetWindow.removeEventListener('message', listener);
  };
}

/**
 * Generates an iframe embed HTML snippet
 */
export function generateEmbedCode(options: {
  url: string;
  width?: string | number;
  height?: string | number;
  border?: boolean;
}): string {
  const width = options.width !== undefined ? options.width : '100%';
  const height = options.height !== undefined ? options.height : '600px';
  const borderStyle = options.border ? 'border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;' : 'border: none;';

  return `<iframe
  src="${options.url}"
  width="${width}"
  height="${height}"
  style="${borderStyle} overflow: hidden;"
  allow="geolocation; fullscreen"
  loading="lazy"
></iframe>`;
}
