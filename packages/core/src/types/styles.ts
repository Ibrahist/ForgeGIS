export type ClassificationType = 'single' | 'categorized' | 'graduated';

export interface CategorizedRule {
  value: string | number;
  color: string;
  label?: string;
}

export interface GraduatedBin {
  min: number;
  max: number;
  color: string;
  label: string;
}

export interface ExtrusionConfig {
  enabled: boolean;
  property?: string;
  multiplier: number;
  baseHeight?: number;
}

export interface LayerStyle {
  // Vector basics
  color: string;
  opacity?: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  pointRadius?: number;

  // Thematic classification
  classification?: {
    type: ClassificationType;
    property: string;
    method?: 'quantile' | 'equal-interval';
    bins?: number;
    colorRampName?: string;
    rules?: CategorizedRule[];
    graduatedBins?: GraduatedBin[];
  };

  // 3D extrusion for polygons
  extrusion?: ExtrusionConfig;
}

export interface LegendItem {
  color: string;
  label: string;
  value?: string | number;
}

export interface LayerLegend {
  layerId: string;
  layerName: string;
  type: ClassificationType;
  items: LegendItem[];
}
