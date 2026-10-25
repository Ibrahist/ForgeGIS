import { ToolDefinition } from '../types/tools';

export const TOOL_REGISTRY: ToolDefinition[] = [
  // 1. Vector Buffer
  {
    id: 'vector-buffer',
    name: 'Buffer Geometry',
    category: 'vector',
    description: 'Calculates a buffer polygon around points, lines, or polygons by specified distance',
    icon: 'CircleDot',
    parameters: [
      { name: 'inputLayerId', label: 'Input Layer', description: 'Layer to buffer', type: 'layer', required: true },
      { name: 'distance', label: 'Distance', description: 'Buffer radius distance', type: 'number', default: 500, min: 1, max: 100000, step: 10 },
      {
        name: 'units',
        label: 'Units',
        description: 'Unit of distance',
        type: 'select',
        default: 'meters',
        options: [
          { label: 'Meters', value: 'meters' },
          { label: 'Kilometers', value: 'kilometers' },
          { label: 'Miles', value: 'miles' },
          { label: 'Feet', value: 'feet' },
        ],
      },
      { name: 'steps', label: 'Resolution Steps', description: 'Polygon smoothness steps', type: 'number', default: 16, min: 4, max: 64 },
    ],
    output: { type: 'vector', defaultLayerName: 'Buffered Layer' },
    runner: 'vector-buffer',
  },

  // 2. Vector Dissolve
  {
    id: 'vector-dissolve',
    name: 'Dissolve Boundaries',
    category: 'vector',
    description: 'Merges adjacent or overlapping polygons sharing a common property into unified features',
    icon: 'Unite',
    parameters: [
      { name: 'inputLayerId', label: 'Input Polygon Layer', description: 'Layer to dissolve', type: 'layer', required: true },
      { name: 'property', label: 'Dissolve Field', description: 'Attribute field to group by (optional)', type: 'field', dependsOn: 'inputLayerId' },
    ],
    output: { type: 'vector', defaultLayerName: 'Dissolved Layer' },
    runner: 'vector-dissolve',
  },

  // 3. Vector Clip
  {
    id: 'vector-clip',
    name: 'Clip Layer by Mask',
    category: 'vector',
    description: 'Clips features of an input layer to the boundaries of a masking polygon layer',
    icon: 'Scissors',
    parameters: [
      { name: 'inputLayerId', label: 'Input Layer', description: 'Layer to be clipped', type: 'layer', required: true },
      { name: 'maskLayerId', label: 'Clipping Mask Layer', description: 'Polygon mask boundary', type: 'layer', required: true },
    ],
    output: { type: 'vector', defaultLayerName: 'Clipped Layer' },
    runner: 'vector-clip',
  },

  // 4. Vector Spatial Join
  {
    id: 'vector-spatial-join',
    name: 'Spatial Join',
    category: 'vector',
    description: 'Transfers attributes from a target layer to input features based on spatial containment',
    icon: 'GitFork',
    parameters: [
      { name: 'inputLayerId', label: 'Target Points/Features', description: 'Features receiving attributes', type: 'layer', required: true },
      { name: 'joinLayerId', label: 'Joining Polygon Layer', description: 'Layer containing attributes', type: 'layer', required: true },
    ],
    output: { type: 'vector', defaultLayerName: 'Spatial Join Result' },
    runner: 'vector-spatial-join',
  },

  // 5. Vector Convex Hull
  {
    id: 'vector-convex-hull',
    name: 'Convex Hull',
    category: 'vector',
    description: 'Computes the minimum enclosing convex polygon for a point or feature cluster',
    icon: 'Hexagon',
    parameters: [
      { name: 'inputLayerId', label: 'Input Layer', description: 'Point or polygon cluster', type: 'layer', required: true },
    ],
    output: { type: 'vector', defaultLayerName: 'Convex Hull' },
    runner: 'vector-convex-hull',
  },

  // 6. Vector Simplify
  {
    id: 'vector-simplify',
    name: 'Simplify Geometries',
    category: 'vector',
    description: 'Reduces the vertex density of complex coastlines and boundaries using Douglas-Peucker algorithm',
    icon: 'Minimize2',
    parameters: [
      { name: 'inputLayerId', label: 'Input Layer', description: 'Lines or polygons to simplify', type: 'layer', required: true },
      { name: 'tolerance', label: 'Tolerance', description: 'Simplification tolerance degree', type: 'number', default: 0.001, min: 0.0001, max: 0.1, step: 0.0005 },
      { name: 'highQuality', label: 'High Quality', description: 'Preserves topology at cost of speed', type: 'boolean', default: true },
    ],
    output: { type: 'vector', defaultLayerName: 'Simplified Layer' },
    runner: 'vector-simplify',
  },

  // 7. Vector Centroids
  {
    id: 'vector-centroids',
    name: 'Calculate Centroids',
    category: 'vector',
    description: 'Generates center-of-mass point features for every polygon or multipolygon',
    icon: 'Target',
    parameters: [
      { name: 'inputLayerId', label: 'Input Polygon Layer', description: 'Polygons to calculate center', type: 'layer', required: true },
    ],
    output: { type: 'vector', defaultLayerName: 'Polygon Centroids' },
    runner: 'vector-centroids',
  },

  // 8. Vector Voronoi
  {
    id: 'vector-voronoi',
    name: 'Voronoi / Thiessen Polygons',
    category: 'vector',
    description: 'Generates Voronoi coverage polygons from point distributions (e.g. sensor influence zones)',
    icon: 'Network',
    parameters: [
      { name: 'inputLayerId', label: 'Point Sensor Layer', description: 'Seed points for Voronoi cells', type: 'layer', required: true },
    ],
    output: { type: 'vector', defaultLayerName: 'Voronoi Polygons' },
    runner: 'vector-voronoi',
  },

  // 9. Vector Bounding Box
  {
    id: 'vector-bbox',
    name: 'Bounding Box Envelopes',
    category: 'vector',
    description: 'Computes rectangular bounding box envelopes around features or clusters',
    icon: 'Square',
    parameters: [
      { name: 'inputLayerId', label: 'Input Layer', description: 'Target layer for envelopes', type: 'layer', required: true },
      { name: 'perFeature', label: 'Per-Feature Bounding Box', description: 'Envelope per feature vs entire layer', type: 'boolean', default: false },
    ],
    output: { type: 'vector', defaultLayerName: 'Bounding Envelopes' },
    runner: 'vector-bbox',
  },

  // 10. Vector Points Along Line
  {
    id: 'vector-points-along-line',
    name: 'Points Along Line',
    category: 'vector',
    description: 'Interpolates coastal survey or transect points along a line geometry at equidistant intervals',
    icon: 'Route',
    parameters: [
      { name: 'inputLayerId', label: 'Input Line Layer', description: 'Line path to sample', type: 'layer', required: true },
      { name: 'distance', label: 'Interval Distance', description: 'Step distance between points', type: 'number', default: 1, min: 0.1, max: 100 },
      {
        name: 'units',
        label: 'Units',
        description: 'Unit of distance',
        type: 'select',
        default: 'kilometers',
        options: [
          { label: 'Kilometers', value: 'kilometers' },
          { label: 'Meters', value: 'meters' },
          { label: 'Miles', value: 'miles' },
        ],
      },
    ],
    output: { type: 'vector', defaultLayerName: 'Transect Sample Points' },
    runner: 'vector-points-along-line',
  },

  // 11. Terrain Hillshade
  {
    id: 'terrain-hillshade',
    name: 'Hillshade Shaded Relief',
    category: 'terrain',
    description: 'Simulates illumination on terrain elevations from an illumination source',
    icon: 'Sun',
    parameters: [
      { name: 'inputLayerId', label: 'Elevation / Contour Layer', description: 'Elevation contours or points', type: 'layer', required: true },
      { name: 'azimuth', label: 'Sun Azimuth', description: 'Compass angle of sun illumination (0-360°)', type: 'number', default: 315, min: 0, max: 360 },
      { name: 'altitude', label: 'Sun Altitude', description: 'Sun elevation angle (0-90°)', type: 'number', default: 45, min: 0, max: 90 },
    ],
    output: { type: 'vector', defaultLayerName: 'Hillshade Relief' },
    runner: 'terrain-hillshade',
  },

  // 12. Terrain Slope
  {
    id: 'terrain-slope',
    name: 'Calculate Slope',
    category: 'terrain',
    description: 'Computes terrain slope in degrees (0° to 90°) to identify cliff hazards and coastal erosion risk',
    icon: 'TrendingUp',
    parameters: [
      { name: 'inputLayerId', label: 'Elevation Layer', description: 'Elevation points or contours', type: 'layer', required: true },
      { name: 'elevationField', label: 'Elevation Field', description: 'Numeric elevation column', type: 'field', dependsOn: 'inputLayerId' },
    ],
    output: { type: 'vector', defaultLayerName: 'Terrain Slope' },
    runner: 'terrain-slope',
  },

  // 13. Terrain Aspect
  {
    id: 'terrain-aspect',
    name: 'Calculate Aspect',
    category: 'terrain',
    description: 'Calculates the compass facing direction of coastal cliffs and slopes (0° North to 360°)',
    icon: 'Compass',
    parameters: [
      { name: 'inputLayerId', label: 'Elevation Layer', description: 'Elevation points or contours', type: 'layer', required: true },
      { name: 'elevationField', label: 'Elevation Field', description: 'Numeric elevation column', type: 'field', dependsOn: 'inputLayerId' },
    ],
    output: { type: 'vector', defaultLayerName: 'Slope Aspect' },
    runner: 'terrain-aspect',
  },

  // 14. Raster NDVI / NDWI Index
  {
    id: 'raster-ndvi-ndwi',
    name: 'Vegetation & Water Indices (NDVI / NDWI)',
    category: 'raster',
    description: 'Calculates Normalized Difference Vegetation or Water Index to monitor coastal wetland health and shoreline water bodies',
    icon: 'Waves',
    parameters: [
      { name: 'inputLayerId', label: 'Multispectral Feature Layer', description: 'Layer with spectral band values', type: 'layer', required: true },
      {
        name: 'indexType',
        label: 'Index Type',
        description: 'Spectral index to compute',
        type: 'select',
        default: 'NDVI',
        options: [
          { label: 'NDVI (Normalized Difference Vegetation Index)', value: 'NDVI' },
          { label: 'NDWI (Normalized Difference Water Index)', value: 'NDWI' },
        ],
      },
      { name: 'bandA', label: 'Primary Band (NIR / Green)', description: 'Attribute field for Band A', type: 'field', dependsOn: 'inputLayerId' },
      { name: 'bandB', label: 'Secondary Band (Red / NIR)', description: 'Attribute field for Band B', type: 'field', dependsOn: 'inputLayerId' },
    ],
    output: { type: 'vector', defaultLayerName: 'Spectral Index Layer' },
    runner: 'raster-ndvi-ndwi',
  },

  // 15. CRS Reproject
  {
    id: 'crs-reproject',
    name: 'Reproject Coordinates',
    category: 'conversion',
    description: 'Transforms vector layer coordinates between EPSG systems using Proj4js (e.g. WGS84 to UTM Zone 10N)',
    icon: 'RotateCw',
    parameters: [
      { name: 'inputLayerId', label: 'Input Layer', description: 'Layer to reproject', type: 'layer', required: true },
      {
        name: 'targetCRS',
        label: 'Target Coordinate System',
        description: 'Target EPSG projection',
        type: 'select',
        default: 'EPSG:3857',
        options: [
          { label: 'Web Mercator (EPSG:3857)', value: 'EPSG:3857' },
          { label: 'WGS84 Lat/Lon (EPSG:4326)', value: 'EPSG:4326' },
          { label: 'UTM Zone 10N - California (EPSG:32610)', value: 'EPSG:32610' },
          { label: 'UTM Zone 11N - SoCal (EPSG:32611)', value: 'EPSG:32611' },
          { label: 'California Albers (EPSG:3310)', value: 'EPSG:3310' },
        ],
      },
    ],
    output: { type: 'vector', defaultLayerName: 'Reprojected Layer' },
    runner: 'crs-reproject',
  },

  // 16. Convert to GeoParquet
  {
    id: 'convert-geojson-to-geoparquet',
    name: 'Export to GeoParquet',
    category: 'conversion',
    description: 'Serializes vector GeoJSON features into cloud-native Apache GeoParquet format client-side',
    icon: 'FileCode',
    parameters: [
      { name: 'inputLayerId', label: 'Input Vector Layer', description: 'Layer to convert', type: 'layer', required: true },
    ],
    output: { type: 'table', defaultLayerName: 'GeoParquet File' },
    runner: 'convert-geojson-to-geoparquet',
  },

  // 17. Convert to PMTiles
  {
    id: 'convert-geojson-to-pmtiles',
    name: 'Export to PMTiles Archive',
    category: 'conversion',
    description: 'Generates single-file serverless PMTiles archive package from vector features',
    icon: 'Package',
    parameters: [
      { name: 'inputLayerId', label: 'Input Vector Layer', description: 'Layer to package', type: 'layer', required: true },
      { name: 'maxZoom', label: 'Max Zoom Level', description: 'Deepest zoom level to tile', type: 'number', default: 14, min: 0, max: 18 },
    ],
    output: { type: 'table', defaultLayerName: 'PMTiles Archive' },
    runner: 'convert-geojson-to-pmtiles',
  },
];
