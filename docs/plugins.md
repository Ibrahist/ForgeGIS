# Modular Plugin Architecture

ForgeGIS features a capability-based plugin system designed to safely extend GIS functionality without risking core application stability.

---

## Plugin Manifest & Permissions

Plugins declare their identity and required capabilities in a `PluginManifest`:

```typescript
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: PluginPermission[];
}
```

### Granular Capabilities
- `map:view`: Read map camera (center, zoom, pitch, bearing).
- `map:control`: Move camera, animate transitions, set projection.
- `layers:read`: Inspect loaded layer metadata and feature geometries.
- `layers:write`: Add, remove, or modify layers and symbology.
- `sql:execute`: Run analytical DuckDB queries.
- `ui:panel`: Render floating UI controls and widgets.

---

## Builtin Production Plugins

1. **Time Series Temporal Slider (`time-slider`)**:
   - Temporal telemetry playback controller with play/pause, scrubber, speed cycle (1x, 2x, 5x, 10x), and tidal phase simulation.
2. **Planetary Basemaps (`planetary-basemaps`)**:
   - Mars MOLA elevation, USGS Moon LRO mosaic, and NASA Earth at Night with 3D spherical globe projection.
3. **Globe Atmosphere & Solar Terminator (`globe-atmosphere`)**:
   - Real-time solar terminator great-circle calculation dividing day and night across the globe.
