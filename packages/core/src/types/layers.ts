import type { FeatureCollection } from 'geojson';
import { LayerStyle } from './styles';

export type LayerSourceType =
  | 'geojson'
  | 'csv'
  | 'geoparquet'
  | 'pmtiles'
  | 'cog'
  | 'sql-result';

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

export interface ForgeLayer {
  id: string;
  name: string;
  sourceType: LayerSourceType;
  sourceUrl?: string;
  data?: FeatureCollection;
  visible: boolean;
  opacity: number; // 0.0 to 1.0
  zIndex: number;
  bounds?: [west: number, south: number, east: number, north: number];
  fields: FieldDefinition[];
  featureCount: number;
  style: LayerStyle;
  metadata?: Record<string, unknown>;
}
