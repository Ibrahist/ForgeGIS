import { describe, it, expect } from 'vitest';
import { parseCsvToGeoJSON, detectCoordinateColumns } from './csvLoader';

describe('csvLoader', () => {
  it('detects latitude and longitude column variants', () => {
    expect(detectCoordinateColumns(['id', 'lat', 'lon', 'value'])).toEqual({
      latCol: 'lat',
      lonCol: 'lon',
    });

    expect(detectCoordinateColumns(['Station', 'Latitude', 'Longitude', 'Depth'])).toEqual({
      latCol: 'Latitude',
      lonCol: 'Longitude',
    });

    expect(detectCoordinateColumns(['name', 'y', 'x'])).toEqual({
      latCol: 'y',
      lonCol: 'x',
    });
  });

  it('parses CSV text into a GeoJSON Point collection', () => {
    const csv = `station_id,latitude,longitude,water_temp_c,status
SF_BAY_01,37.78,-122.42,14.8,active
SF_BAY_02,37.82,-122.38,15.2,active
SF_BAY_03,37.75,-122.31,14.5,maintenance`;

    const result = parseCsvToGeoJSON(csv);
    expect(result.featureCollection.features.length).toBe(3);
    expect(result.featureCollection.features[0].geometry.coordinates).toEqual([-122.42, 37.78]);
    expect(result.featureCollection.features[0].properties?.station_id).toBe('SF_BAY_01');
    expect(result.featureCollection.features[0].properties?.water_temp_c).toBe(14.8);
    expect(result.bounds).toBeDefined();
    expect(result.latColumn).toBe('latitude');
    expect(result.lonColumn).toBe('longitude');
  });

  it('throws an error if coordinate columns cannot be identified', () => {
    const invalidCsv = `id,name,value\n1,Alpha,100\n2,Beta,200`;
    expect(() => parseCsvToGeoJSON(invalidCsv)).toThrow(/Could not automatically detect/);
  });
});
