# ForgeGIS 🌊

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![DuckDB-WASM](https://img.shields.io/badge/DuckDB-WASM_v1.29-FFF000.svg?logo=duckdb)](https://duckdb.org/)
[![MapLibre GL JS](https://img.shields.io/badge/MapLibre_GL-v4.7-brightgreen.svg?logo=maplibre)](https://maplibre.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-24C8D8.svg?logo=tauri)](https://tauri.app/)
[![AnyWidget](https://img.shields.io/badge/Jupyter-AnyWidget-orange.svg?logo=jupyter)](https://anywidget.dev/)
[![CI](https://github.com/opengeos/ForgeGIS/actions/workflows/ci.yml/badge.svg)](https://github.com/opengeos/ForgeGIS/actions)


> **A local-first, cloud-native geospatial exploration platform that runs in the browser, as a desktop app, and inside Jupyter notebooks from one shared codebase.**

Inspired by the open‑source community.

---

## 🌟 Vision & Key Highlights

- **🔒 Local-First & Zero-Server**: Data never leaves your machine unless you explicitly export or share it. No backend servers required for full analytical functionality.
- **⚡ In-Browser Analytical Spatial SQL**: Full DuckDB-WASM query engine with spatial extension support. Query millions of GeoParquet records, CSVs, and GeoJSON in milliseconds directly inside your browser.
- **🛠️ 17 In-Browser Geoprocessing Tools**: Pure client-side WASM algorithms (Buffer, Dissolve, Clip, Convex Hull, Voronoi, Delaunay, Point-in-Poly, Simplify, Split, Contour, Hillshade, Slope, PMTiles, GeoParquet, CRS Reproject, Zonal Stats).
- **🌊 Coastal & Marine Intelligence Domain**: Pre-tuned for coastal monitoring (sea level rise, tidal erosion, storm surge inundation, NOAA buoy telemetry, benthic hypoxia, and blue carbon).
- **🖥️ True Multi-Platform**:
  - **Web SPA**: Static bundle deployable on GitHub Pages, Cloudflare Pages, S3, or NGINX.
  - **Desktop Shell**: Tauri v2 (Rust) with zero-sandbox direct OS filesystem I/O.
  - **Jupyter Notebook**: `forgegis` AnyWidget with bidirectional Python-JavaScript synchronization.
  - **In-Browser Python**: Pyodide WASM Python Workspace with live JS bridge.
- **🔌 Sandboxed Plugin Ecosystem**: Capability-restricted plugin manager with live plugins (Time-Series Temporal Slider, Planetary Basemaps: Mars/Moon/Earth at Night, 3D Globe Atmosphere with Solar Terminator).
- **🏛️ 10 Curated Open-Data Coastal Projects**: 1-click loading of SF Bay SLR, Chesapeake Bay Hypoxia, Gulf Storm Surge, Great Barrier Reef Bleaching, Arctic Sea Ice, Puget Sound Orca Sanctuary, Venice MOSE Gates, Florida Mangrove Carbon, North Sea Wind, and Tokyo Bay Tsunami Defense.
- **📤 Open Project Format & Offline Reports**: Schema v1.0.0 validated `.project.json`, self-contained single-file offline HTML reports, and iframe embed `postMessage` bridge.

---

## 🏗️ Monorepo Architecture

```
ForgeGIS/
├── apps/
│   ├── web/               # React 18 + Vite + MapLibre GL JS + PMTiles + Deck.gl
│   └── desktop/           # Tauri v2 (Rust backend + Web frontend) with native OS I/O
├── packages/
│   ├── core/              # Data loaders, DuckDB engine, 17 geoprocessing tools, project schema, plugins host
│   ├── ui/                # VoiceStudio tokens, Bento cards, Dock, SQL workspace, Toolbox, modals
│   └── plugins/           # Time slider, Planetary basemaps, 3D Globe solar terminator
├── python/
│   └── forgegis/          # Jupyter AnyWidget (ForgeMap, add_layer, execute_sql, to_html)
├── docs/                  # MkDocs Material documentation site
└── e2e/                   # 32 Playwright end-to-end integration tests
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v20+` (or `v22+` / `v25+`)
- **pnpm**: `v9+`
- **Rust & Cargo**: (Optional, for Tauri desktop shell)
- **Python**: `3.10+` (Optional, for Jupyter AnyWidget)

### 2. Installation
```bash
git clone https://github.com/opengeos/ForgeGIS.git
cd ForgeGIS
pnpm install
```

### 3. Running the Web Application
```bash
pnpm --filter @forgegis/web dev
# Accessible at http://localhost:3000
```

### 4. Running the Desktop Application (Tauri v2)
```bash
pnpm --filter @forgegis/desktop tauri dev
```

### 5. Running with Docker
```bash
docker build -t forgegis:latest .
docker run -p 8080:80 forgegis:latest
# Open http://localhost:8080
```

---

## 🐍 Python SDK & Jupyter AnyWidget

Install and use ForgeGIS inside JupyterLab, VS Code Notebooks, or Google Colab:

```python
from forgegis import ForgeMap

# Initialize map centered on East Africa study region
m = ForgeMap(center=(37.5, -1.5), zoom=6.0)

# Add GeoJSON layer with custom styling
m.add_layer(
    data="https://example.com/noaa_buoys.geojson",
    name="NOAA Buoy Telemetry",
    style={"color": "#e3b450", "pointRadius": 8}
)

# Execute spatial SQL via DuckDB WASM
m.execute_sql("SELECT station_id, wave_height_m FROM buoys WHERE wave_height_m > 2.0")

# Export self-contained offline HTML report
m.to_html("coastal_report.html")

# Display interactive AnyWidget in notebook cell
m
```

---

## ⌨️ Power-User Keyboard Shortcuts

| Shortcut | Description |
|---|---|
| <kbd>?</kbd> | Open Keyboard Shortcuts Cheat-Sheet |
| <kbd>G</kbd> | Open Coastal Open-Data Demo Projects Gallery (10 studies) |
| <kbd>S</kbd> | Open DuckDB-WASM Spatial SQL Workspace |
| <kbd>T</kbd> | Open In-Browser Geoprocessing Toolbox (17 pure WASM tools) |
| <kbd>P</kbd> | Open Modular Plugin Ecosystem Manager |
| <kbd>Y</kbd> | Open In-Browser Python Workspace (Pyodide WASM) |
| <kbd>A</kbd> | Open Add Layer Dialog (Presets, Drag & Drop GeoJSON/CSV/PMTiles/Parquet) |
| <kbd>L</kbd> | Toggle / Expand Layers Panel |
| <kbd>E</kbd> | Open Project Sharing & Standalone HTML Exporter |
| <kbd>M</kbd> | Toggle Distance / Area Geodesic Measurement Toolbar |
| <kbd>0</kbd> | Reset map bearing to North |

---

## 🧪 Testing & Verification

ForgeGIS features comprehensive test coverage:

- **53 Vitest Unit Tests** in `@forgegis/core` (Loaders, measurements, symbology, project schema, DuckDB, geoprocessing tools, plugins manager, demo gallery).
- **4 Vitest Unit Tests** in `@forgegis/plugins` (Time-series playback, planetary basemaps, solar terminator).
- **5 Python Unit Tests** in `python/forgegis/` (Map initialization, layer binding, view camera, SQL queue, HTML export).
- **32 Playwright E2E Tests** covering full browser user workflows, modal interactions, SQL executions, tool computations, plugin rendering, and mobile viewport drawer responsiveness.

Run all tests:
```bash
# Unit tests
pnpm --filter @forgegis/core test -- --run
pnpm --filter @forgegis/plugins test

# Python tests
python -c "import sys; sys.path.insert(0, 'python'); from tests import test_forgegis; test_forgegis.test_map_initialization(); test_forgegis.test_add_geojson_layer(); test_forgegis.test_set_view(); test_forgegis.test_execute_sql(); test_forgegis.test_to_html_export(); print('All Python tests passed!')"

# End-to-end browser tests
pnpm --filter @forgegis/e2e test
```

---

## 📄 License & Acknowledgements

ForgeGIS is open-source software licensed under the [MIT License](LICENSE).

See [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md) for full attribution of foundational open-source dependencies including MapLibre GL JS, deck.gl, DuckDB-WASM, Turf.js, PMTiles, Tauri, and Pyodide.
