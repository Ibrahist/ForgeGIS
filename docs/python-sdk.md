# Python SDK & Jupyter AnyWidget

ForgeGIS provides first-class Python support both inside interactive Jupyter notebooks and directly in the browser via Pyodide WebAssembly.

---

## 1. Jupyter Notebooks (`forgegis`)

The `forgegis` Python package is built on [AnyWidget](https://anywidget.dev/), providing seamless two-way state synchronization between Python and the MapLibre/Deck.gl canvas.

### Installation
```bash
pip install forgegis
```

### Usage
```python
import forgegis

# Create an interactive map widget
m = forgegis.ForgeMap(center=(-122.38, 37.8), zoom=12.0)

# Add a GeoJSON layer
m.add_layer(
    "coastline.geojson",
    name="Coastal Erosion Zones",
    style={"color": "#f47fa3", "strokeWidth": 2.0}
)

# Export standalone offline HTML report
m.to_html("coastal_study_report.html")

# Display widget in notebook
m
```

---

## 2. In-Browser Python Workspace (Pyodide WASM)

ForgeGIS also includes an embedded **Pyodide WebAssembly** scripting environment inside the web application:
- Zero installation or local Python requirement.
- Injects a live `forgegis` JavaScript bridge into Python globals:
  - `forgegis.get_layers()`: returns JSON list of layers
  - `forgegis.add_layer(geojson_str, name, color)`: generates a new layer on the map in real-time
  - `forgegis.set_view(lon, lat, zoom)`: flies the camera
- Pre-loaded with coastal telemetry generation and spatial statistics presets.
