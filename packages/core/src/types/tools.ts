export type ToolCategory = 'vector' | 'raster' | 'terrain' | 'conversion';

export interface ToolParameterDefinition {
  name: string;
  label: string;
  description: string;
  type: 'layer' | 'field' | 'number' | 'string' | 'boolean' | 'select';
  required?: boolean;
  default?: unknown;
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  step?: number;
  dependsOn?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string;
  parameters: ToolParameterDefinition[];
  output: {
    type: 'vector' | 'raster' | 'table';
    defaultLayerName: string;
  };
  runner: string;
}

export interface ToolExecutionContext {
  tool: ToolDefinition;
  parameters: Record<string, unknown>;
  getLayerData: (layerId: string) => Promise<GeoJSON.FeatureCollection | undefined>;
}
