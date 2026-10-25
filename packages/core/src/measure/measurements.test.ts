import { describe, it, expect } from 'vitest';
import {
  calculateDistanceMeters,
  calculatePathLengthMeters,
  calculatePolygonAreaSquareMeters,
  formatDistance,
  formatArea,
} from './measurements';

describe('measurements', () => {
  it('calculates distance between coordinates accurately', () => {
    // San Francisco (-122.4194, 37.7749) to Oakland (-122.2711, 37.8044) is approx 13.5 km
    const d = calculateDistanceMeters([-122.4194, 37.7749], [-122.2711, 37.8044]);
    expect(d).toBeGreaterThan(13000);
    expect(d).toBeLessThan(14500);
  });

  it('calculates multi-point path length', () => {
    const coords: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
    ];
    const total = calculatePathLengthMeters(coords);
    expect(total).toBeGreaterThan(200000); // 2 degrees of Earth circumference ~222km
  });

  it('calculates spherical polygon area', () => {
    // 1 degree by 1 degree box at equator (~111km x 111km = ~12,300 km²)
    const box: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const area = calculatePolygonAreaSquareMeters(box);
    expect(area).toBeGreaterThan(1.2e10); // > 12,000 km²
    expect(area).toBeLessThan(1.3e10);
  });

  it('formats distance nicely in meters or kilometers', () => {
    expect(formatDistance(450)).toBe('450.0 m');
    expect(formatDistance(12500)).toBe('12.50 km');
  });

  it('formats area nicely in m², hectares, or km²', () => {
    expect(formatArea(500)).toBe('500.0 m²');
    expect(formatArea(25000)).toBe('2.50 ha');
    expect(formatArea(5000000)).toBe('5.00 km²');
  });
});
