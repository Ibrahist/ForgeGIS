# ForgeGIS

**Lightweight, Local-First, Cloud-Native Geospatial Exploration Platform**

Inspired by the open‑source community and designed with the sleek, dark aesthetic of VoiceStudio, ForgeGIS is an open-source GIS platform that runs in the browser, as a native desktop application, and inside Jupyter notebooks from a single unified codebase.

---

## 🌟 Key Highlights

- **🔒 Local-First & Private by Default**: All your datasets stay on your device. Zero cloud server roundtrips required for map rendering, vector styling, measurements, or geoprocessing.
- **⚡ In-Browser Analytical SQL**: DuckDB-WASM engine with spatial functions (`ST_Point`, `ST_Distance`, `ST_Intersects`, `ST_Area`, `ST_Within`).
- **🛠️ 17 Pure Client-Side Geoprocessing Tools**: Buffer, convex hull, Voronoi polygons, Delaunay triangulation, isolines, and multi-format conversion running in WASM & Web Workers.
- **🧩 Sandboxed Modular Plugins**: Extend capabilities with capability-restricted plugins like temporal time-series playback, planetary basemaps (Mars, Moon), and 3D globe atmospheres.
- **🐍 Python & Jupyter AnyWidget Integration**: Interactive two-way Jupyter notebook widget + in-browser Pyodide WASM workspace.
- **🖥️ Multi-Platform Desktop**: Native desktop application powered by Tauri v2 with zero-sandbox direct local filesystem access.
- **📦 Single-File HTML Reports**: Export fully self-contained offline HTML reports that can be shared via email, USB, or static hosting.

---

## 🌊 Focus Domain: Coastal & Marine Intelligence

ForgeGIS comes pre-loaded with open-data coastal and marine telemetry:
- Sea level rise inundation risk zones
- NOAA offshore oceanographic buoy sensors (wave height, water temperature, salinity)
- Tidal flood zones and coastal bluff erosion vulnerability
- Great Barrier Reef thermal bleaching surveillance
- Arctic sea ice retreat and permafrost thawing dynamics

---

## 🚀 Quick Launch

### Web App
```bash
pnpm install
pnpm --filter @forgegis/web dev
```

### Desktop Shell (Tauri v2)
```bash
pnpm --filter @forgegis/desktop dev
```

### Python Package (Jupyter AnyWidget)
```bash
pip install -e python/
```
```python
from forgegis import ForgeMap

m = ForgeMap(center=(37.5, -1.5), zoom=6.0)
m.add_layer("coastal_sensors.csv", name="East Africa Marine Buoys")
m
```
