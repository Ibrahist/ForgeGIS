import { describe, it, expect } from 'vitest';
import type { FeatureCollection } from 'geojson';
import {
  generateCategorizedStyle,
  generateGraduatedStyle,
  buildLegendForStyle,
  COLOR_RAMPS,
} from './classification';

describe('classification & styling', () => {
  const sampleData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { type: 'Marsh', depth: 1.2 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { type: 'Dune', depth: 4.8 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { type: 'Reef', depth: 12.5 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { type: 'Marsh', depth: 2.1 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { type: 'Dune', depth: 6.3 } },
    ],
  };

  it('generates categorized rules for categorical attributes', () => {
    const { rules, legend } = generateCategorizedStyle(sampleData, 'type', 'roseGold');
    expect(rules.length).toBe(3); // Marsh, Dune, Reef
    expect(rules.map(r => r.value).sort()).toEqual(['Dune', 'Marsh', 'Reef']);
    expect(legend.type).toBe('categorized');
    expect(legend.items.length).toBe(3);
  });

  it('generates graduated bins for numeric attributes with quantile method', () => {
    const { bins, legend } = generateGraduatedStyle(sampleData, 'depth', 3, 'quantile', 'coastal');
    expect(bins.length).toBe(3);
    expect(bins[0].min).toBe(1.2);
    expect(bins[bins.length - 1].max).toBe(12.5);
    expect(legend.type).toBe('graduated');
    expect(legend.items.length).toBe(3);
  });

  it('generates graduated bins for numeric attributes with equal-interval method', () => {
    const { bins } = generateGraduatedStyle(sampleData, 'depth', 4, 'equal-interval', 'viridis');
    expect(bins.length).toBe(4);
    expect(bins[0].min).toBeCloseTo(1.2);
    expect(bins[3].max).toBeCloseTo(12.5);
  });

  it('builds a legend structure for a layer style', () => {
    const singleLegend = buildLegendForStyle('layer1', 'Coastline', {
      color: '#f47fa3',
      opacity: 0.8,
    });
    expect(singleLegend.type).toBe('single');
    expect(singleLegend.items[0].color).toBe('#f47fa3');
    expect(singleLegend.items[0].label).toBe('Coastline');
  });
});
