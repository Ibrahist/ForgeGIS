# Geoprocessing Toolbox (17 WASM Tools)

ForgeGIS includes **17 high-performance, client-side geoprocessing algorithms** that execute entirely inside the browser using WebAssembly and Web Workers.

---

## 🛠️ Tool Catalog

### Vector Algorithms (10)
1. **Buffer Geometry (`vector-buffer`)**: Calculates equidistant geodesic buffers around points, lines, or polygons.
2. **Dissolve Boundaries (`vector-dissolve`)**: Merges adjacent or overlapping polygons sharing an attribute value into unified multipart polygons.
3. **Clip Layer (`vector-clip`)**: Clips features of an input vector layer to the boundary of a masking polygon layer.
4. **Convex Hull (`vector-convex-hull`)**: Computes the minimum enclosing convex polygon for an input feature collection.
5. **Centroids (`vector-centroid`)**: Computes the geometric center of mass for each feature.
6. **Voronoi Polygons (`vector-voronoi`)**: Generates Dirichlet / Voronoi tessellation partitions across point distributions.
7. **Delaunay Triangulation (`vector-delaunay`)**: Constructs non-overlapping triangle meshes from point sets.
8. **Point in Polygon Count (`vector-point-in-poly`)**: Aggregates spatial point occurrences within boundary polygons.
9. **Simplify Geometries (`vector-simplify`)**: Reduces vertex density using the Douglas-Peucker algorithm.
10. **Line Split (`vector-split`)**: Splits polyline networks at intersection nodes.

### Terrain & Elevation (3)
11. **Contour Isolines (`terrain-contour`)**: Generates elevation or bathymetric isoline contours.
12. **Hillshade Shading (`terrain-hillshade`)**: Computes analytical illumination angle hillshade raster representations.
13. **Slope & Aspect Analysis (`terrain-slope`)**: Calculates maximum rate of elevation change across DEM grids.

### Conversion & Projections (3)
14. **Vector to PMTiles (`conv-pmtiles`)**: Converts GeoJSON layers into single-file tile archives for web map hosting.
15. **GeoJSON to GeoParquet (`conv-geoparquet`)**: Serializes vector geometry into columnar Apache Parquet format.
16. **Reproject CRS (`conv-reproject`)**: Transforms coordinates between EPSG:4326 (WGS84) and EPSG:3857 (Web Mercator).

### Raster (1)
17. **Raster Zonal Statistics (`raster-zonal-stats`)**: Computes mean, min, max, and standard deviation raster values within vector polygon zones.

---

## 🔗 Deep-Linking & Automated Execution

Any tool can be launched directly via URL parameters:

```
https://forgegis.org/?tool=vector-buffer&distance=1000&units=meters&autorun=true
```
