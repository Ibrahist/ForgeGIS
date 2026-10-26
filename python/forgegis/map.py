import json
import os
from typing import Any, Dict, List, Optional, Union

try:
    import anywidget
    import traitlets
    HAS_ANYWIDGET = True
except ImportError:
    HAS_ANYWIDGET = False

# JavaScript and CSS bundle injected into Jupyter Notebook via AnyWidget
_JS_CODE = """
export function render({ model, el }) {
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '500px';
  container.style.borderRadius = '16px';
  container.style.overflow = 'hidden';
  container.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  container.style.backgroundColor = '#0a0a0c';
  container.style.position = 'relative';

  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.src = model.get('embed_url') || 'https://forgegis.org';

  container.appendChild(iframe);
  el.appendChild(container);

  // Sync layers & view
  model.on('change:layers', () => {
    const layers = model.get('layers');
    iframe.contentWindow?.postMessage({ type: 'FORGEGIS_SYNC_LAYERS', payload: layers }, '*');
  });
}
"""

_CSS_CODE = """
.forgegis-widget-container {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background-color: #0a0a0c;
}
"""

if HAS_ANYWIDGET:
    class _BaseWidget(anywidget.AnyWidget):
        _esm = _JS_CODE
        _css = _CSS_CODE
        embed_url = traitlets.Unicode("https://forgegis.org").tag(sync=True)
        layers = traitlets.List([]).tag(sync=True)
        view_state = traitlets.Dict({}).tag(sync=True)
else:
    class _BaseWidget:
        def __init__(self, **kwargs):
            self.embed_url = kwargs.get("embed_url", "https://forgegis.org")
            self.layers = kwargs.get("layers", [])
            self.view_state = kwargs.get("view_state", {})


class ForgeMap(_BaseWidget):
    """
    ForgeGIS Map Widget for Jupyter Notebooks, Google Colab, and Python scripts.
    """

    def __init__(
        self,
        center: tuple[float, float] = (37.5, -1.5),
        zoom: float = 6.0,
        pitch: float = 0.0,
        bearing: float = 0.0,
        basemap: str = "carto-dark",
        embed_url: str = "https://forgegis.org",
        **kwargs
    ):
        initial_view = {
            "longitude": center[0],
            "latitude": center[1],
            "zoom": zoom,
            "pitch": pitch,
            "bearing": bearing,
            "projection": "mercator",
        }
        super().__init__(embed_url=embed_url, layers=[], view_state=initial_view, **kwargs)
        self.center = center
        self.zoom = zoom
        self.pitch = pitch
        self.bearing = bearing
        self.basemap = basemap
        self._layers: List[Dict[str, Any]] = []

    def add_layer(
        self,
        data: Union[str, Dict[str, Any]],
        name: Optional[str] = None,
        style: Optional[Dict[str, Any]] = None,
        opacity: float = 0.85,
    ) -> "ForgeMap":
        """
        Adds a GeoJSON dictionary, GeoParquet path, or remote URL as a map layer.
        """
        layer_id = f"layer-{len(self._layers) + 1}"
        layer_name = name or f"Python Layer {len(self._layers) + 1}"

        parsed_data = None
        source_url = None

        if isinstance(data, dict):
            parsed_data = data
        elif isinstance(data, str):
            if data.startswith("http://") or data.startswith("https://"):
                source_url = data
            elif os.path.exists(data):
                with open(data, "r", encoding="utf-8") as f:
                    parsed_data = json.load(f)
            else:
                source_url = data

        layer_def = {
            "id": layer_id,
            "name": layer_name,
            "sourceType": "geojson",
            "sourceUrl": source_url,
            "data": parsed_data,
            "visible": True,
            "opacity": opacity,
            "style": style or {"color": "#e3b450", "strokeColor": "#ffffff", "strokeWidth": 1.5, "opacity": opacity},
        }

        self._layers.append(layer_def)
        if hasattr(self, "layers"):
            self.layers = list(self._layers)
        return self

    def set_view(
        self,
        longitude: float,
        latitude: float,
        zoom: Optional[float] = None,
        pitch: Optional[float] = None,
        bearing: Optional[float] = None,
    ) -> "ForgeMap":
        """
        Updates map view camera position.
        """
        current = dict(self.view_state) if hasattr(self, "view_state") else {}
        current["longitude"] = longitude
        current["latitude"] = latitude
        if zoom is not None:
            current["zoom"] = zoom
        if pitch is not None:
            current["pitch"] = pitch
        if bearing is not None:
            current["bearing"] = bearing

        if hasattr(self, "view_state"):
            self.view_state = current
        return self

    def execute_sql(self, query: str) -> Dict[str, Any]:
        """
        Simulates or submits an analytical Spatial SQL query against active layers.
        """
        return {
            "query": query,
            "status": "queued",
            "layers_count": len(self._layers),
        }

    def to_html(self, filename: Optional[str] = None) -> str:
        """
        Exports the current Python map instance to a single-file, self-contained offline HTML report.
        """
        title = "ForgeGIS Python Export"
        project_dict = {
            "$schema": "https://forgegis.org/schemas/v1/project.json",
            "version": "1.0.0",
            "id": "py-export",
            "title": title,
            "view": getattr(self, "view_state", {}),
            "basemap": {
                "id": self.basemap,
                "url": "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
                "attribution": "© CartoDB © OpenStreetMap",
            },
            "layers": self._layers,
        }

        html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>{title}</title>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <style>
    body, html {{ margin: 0; padding: 0; width: 100%; height: 100%; background: #0a0a0c; font-family: sans-serif; }}
    #map {{ width: 100%; height: 100%; position: absolute; }}
    .badge {{ position: absolute; top: 16px; left: 16px; background: rgba(18, 18, 23, 0.9); border: 1px solid rgba(255,255,255,0.1); color: #f5f5f7; padding: 8px 16px; border-radius: 9999px; font-size: 12px; z-index: 10; }}
  </style>
</head>
<body>
  <div class="badge">ForgeGIS Python Export • {len(self._layers)} Layers</div>
  <div id="map"></div>
  <script>
    const proj = {json.dumps(project_dict)};
    const map = new maplibregl.Map({{
      container: 'map',
      style: {{
        version: 8,
        sources: {{
          'carto': {{ type: 'raster', tiles: [proj.basemap.url], tileSize: 256 }}
        }},
        layers: [{{ id: 'base', type: 'raster', source: 'carto' }}]
      }},
      center: [proj.view.longitude, proj.view.latitude],
      zoom: proj.view.zoom
    }});
  </script>
</body>
</html>"""

        if filename:
            with open(filename, "w", encoding="utf-8") as f:
                f.write(html)

        return html


# Alias
Map = ForgeMap
