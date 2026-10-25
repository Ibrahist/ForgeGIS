# ForgeGIS Project Format (.project.json) Specification v1.0.0

ForgeGIS defines a portable, open, and versioned JSON schema for saving and sharing full geospatial analysis projects.

---

## Schema Overview

```json
{
  "$schema": "https://forgegis.org/schemas/v1/project.json",
  "version": "1.0.0",
  "id": "sf-coastal-resilience",
  "title": "SF Bay Coastal Flood & Erosion Study",
  "description": "High-resolution sea level rise and marine sensor telemetry",
  "domain": "coastal-monitoring",
  "createdAt": "2026-10-25T12:00:00Z",
  "updatedAt": "2026-10-25T12:00:00Z",
  "view": {
    "longitude": -122.38,
    "latitude": 37.8,
    "zoom": 11.2,
    "pitch": 25,
    "bearing": 15,
    "projection": "mercator",
    "terrain3d": {
      "enabled": false,
      "exaggeration": 1.5
    }
  },
  "basemap": {
    "id": "carto-dark",
    "name": "Carto Dark Matter",
    "type": "raster",
    "url": "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
    "attribution": "© CartoDB © OpenStreetMap"
  },
  "layers": [
    {
      "id": "layer-sensors",
      "name": "SF Bay Marine Sensor Buoys",
      "sourceType": "geojson",
      "visible": true,
      "opacity": 0.9,
      "zIndex": 1,
      "data": { "type": "FeatureCollection", "features": [] },
      "style": {
        "color": "#e3b450",
        "strokeColor": "#ffffff",
        "strokeWidth": 1.5,
        "opacity": 0.9,
        "pointRadius": 7
      }
    }
  ],
  "sqlWorkspace": {
    "queries": [
      {
        "id": "q1",
        "name": "High Wave Buoys",
        "sql": "SELECT * FROM \"layer-sensors\" WHERE wave_height_m > 2.0;",
        "createdAt": "2026-10-25T12:00:00Z"
      }
    ]
  },
  "geoprocessingHistory": [],
  "plugins": {
    "installed": []
  }
}
```
