import type { FeatureCollection } from 'geojson';
import {
  ClassificationType,
  CategorizedRule,
  GraduatedBin,
  LayerLegend,
  LegendItem,
  LayerStyle,
} from '../types/styles';

export const COLOR_RAMPS: Record<string, string[]> = {
  roseGold: ['#ffd0db', '#f47fa3', '#e3b450', '#a8731f'],
  coastal: ['#e0f2fe', '#38bdf8', '#0284c7', '#0369a1', '#082f49'],
  viridis: ['#fde725', '#5ec962', '#21918c', '#3b528b', '#440154'],
  magma: ['#fcfdbf', '#feb078', '#f1605d', '#b73779', '#721f81', '#000004'],
  emerald: ['#d1fae5', '#6ee7b7', '#10b981', '#047857', '#064e3b'],
  spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
};

export function interpolateColor(ramp: string[], factor: number): string {
  const clamped = Math.max(0, Math.min(1, factor));
  if (ramp.length === 1) return ramp[0];
  const position = clamped * (ramp.length - 1);
  const index = Math.floor(position);
  if (index >= ramp.length - 1) return ramp[ramp.length - 1];
  return ramp[index];
}

export function generateCategorizedStyle(
  fc: FeatureCollection,
  property: string,
  rampName: keyof typeof COLOR_RAMPS = 'roseGold'
): { rules: CategorizedRule[]; legend: LayerLegend } {
  const ramp = COLOR_RAMPS[rampName] || COLOR_RAMPS.roseGold;
  const uniqueValues = new Set<string | number>();

  for (const feature of fc.features) {
    if (feature.properties && feature.properties[property] !== undefined && feature.properties[property] !== null) {
      uniqueValues.add(feature.properties[property]);
    }
  }

  const valuesArray = Array.from(uniqueValues).slice(0, 20); // Cap at 20 distinct categories
  const rules: CategorizedRule[] = valuesArray.map((val, idx) => {
    const color = ramp[idx % ramp.length];
    return {
      value: val,
      color,
      label: String(val),
    };
  });

  const legendItems: LegendItem[] = rules.map(r => ({
    color: r.color,
    label: r.label || String(r.value),
    value: r.value,
  }));

  const legend: LayerLegend = {
    layerId: '',
    layerName: property,
    type: 'categorized',
    items: legendItems,
  };

  return { rules, legend };
}

export function generateGraduatedStyle(
  fc: FeatureCollection,
  property: string,
  numBins = 5,
  method: 'quantile' | 'equal-interval' = 'quantile',
  rampName: keyof typeof COLOR_RAMPS = 'coastal'
): { bins: GraduatedBin[]; legend: LayerLegend } {
  const ramp = COLOR_RAMPS[rampName] || COLOR_RAMPS.coastal;
  const numbers: number[] = [];

  for (const feature of fc.features) {
    if (feature.properties) {
      const val = feature.properties[property];
      if (typeof val === 'number' && !isNaN(val)) {
        numbers.push(val);
      }
    }
  }

  if (numbers.length === 0) {
    return {
      bins: [],
      legend: { layerId: '', layerName: property, type: 'graduated', items: [] },
    };
  }

  numbers.sort((a, b) => a - b);
  const min = numbers[0];
  const max = numbers[numbers.length - 1];

  const bins: GraduatedBin[] = [];
  const safeBins = Math.max(2, Math.min(numBins, 8));

  if (method === 'equal-interval' || min === max) {
    const step = (max - min) / safeBins;
    for (let i = 0; i < safeBins; i++) {
      const binMin = min + i * step;
      const binMax = i === safeBins - 1 ? max : min + (i + 1) * step;
      const color = ramp[Math.floor((i / (safeBins - 1)) * (ramp.length - 1))];
      bins.push({
        min: binMin,
        max: binMax,
        color,
        label: `${binMin.toFixed(1)} - ${binMax.toFixed(1)}`,
      });
    }
  } else {
    // Quantile
    for (let i = 0; i < safeBins; i++) {
      const startIdx = Math.floor((i / safeBins) * numbers.length);
      const endIdx = i === safeBins - 1 ? numbers.length - 1 : Math.floor(((i + 1) / safeBins) * numbers.length) - 1;
      const binMin = numbers[startIdx];
      const binMax = numbers[Math.max(startIdx, endIdx)];
      const color = ramp[Math.floor((i / (safeBins - 1)) * (ramp.length - 1))];
      bins.push({
        min: binMin,
        max: binMax,
        color,
        label: `${binMin.toFixed(1)} - ${binMax.toFixed(1)}`,
      });
    }
  }

  const legendItems: LegendItem[] = bins.map(b => ({
    color: b.color,
    label: b.label,
  }));

  const legend: LayerLegend = {
    layerId: '',
    layerName: property,
    type: 'graduated',
    items: legendItems,
  };

  return { bins, legend };
}

export function buildLegendForStyle(layerId: string, layerName: string, style: LayerStyle): LayerLegend {
  if (style.classification?.type === 'categorized' && style.classification.rules) {
    return {
      layerId,
      layerName: `${layerName} (${style.classification.property})`,
      type: 'categorized',
      items: style.classification.rules.map(r => ({
        color: r.color,
        label: r.label || String(r.value),
        value: r.value,
      })),
    };
  }

  if (style.classification?.type === 'graduated' && style.classification.graduatedBins) {
    return {
      layerId,
      layerName: `${layerName} (${style.classification.property})`,
      type: 'graduated',
      items: style.classification.graduatedBins.map(b => ({
        color: b.color,
        label: b.label,
      })),
    };
  }

  // Single color default
  return {
    layerId,
    layerName,
    type: 'single',
    items: [
      {
        color: style.fillColor || style.color,
        label: layerName,
      },
    ],
  };
}
