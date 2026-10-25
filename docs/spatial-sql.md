# Spatial SQL with DuckDB-WASM

ForgeGIS embeds **DuckDB-WASM** with the official spatial extension compiled to WebAssembly.

---

## Architecture

When vector datasets (GeoJSON, CSV, GeoParquet) are added to the map, ForgeGIS automatically registers them as virtual in-memory SQL tables:

```
GeoJSON / CSV / Parquet
       │
       ▼
DuckDB-WASM In-Memory Table
       │
       ▼
Spatial SQL Query Execution
       │
       ▼
GeoJSON Converter ──► Map Layer / Attribute Table
```

---

## Supported Spatial Functions

- `ST_Point(lon, lat)`: Creates a point geometry.
- `ST_Distance(geom1, geom2)`: Computes Euclidean or planar distance.
- `ST_Intersects(geom1, geom2)`: Evaluates whether two geometries share space.
- `ST_Area(geom)`: Computes polygon surface area.
- `ST_Within(geom1, geom2)`: Tests whether geometry 1 is entirely inside geometry 2.
- `ST_Centroid(geom)`: Returns geometric center.

---

## Example Queries

### Filter Marine Buoys with High Waves
```sql
SELECT
  station_id,
  wave_height_m,
  water_temp_c,
  ST_Point(longitude, latitude) as geom
FROM "sf-sensors"
WHERE wave_height_m > 2.0
ORDER BY wave_height_m DESC;
```

### Aggregate Sensor Counts per Flood Risk Zone
```sql
SELECT
  z.zone_name,
  count(s.station_id) as total_buoys,
  round(avg(s.salinity_psu), 2) as avg_salinity
FROM "sf-coastline" z
JOIN "sf-sensors" s
  ON ST_Within(ST_Point(s.longitude, s.latitude), z.geom)
GROUP BY z.zone_name;
```
