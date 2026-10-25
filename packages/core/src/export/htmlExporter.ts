import { ForgeProject } from '../types/project';

export interface StandaloneHtmlOptions {
  title?: string;
  subtitle?: string;
  includeMeasurements?: boolean;
}

/**
 * Generates an offline, single-file interactive HTML report containing
 * the complete project state, inlined GeoJSON datasets, MapLibre GL viewer,
 * VoiceStudio-themed UI controls, and interactive attribute inspector.
 */
export function generateStandaloneHtml(
  project: ForgeProject,
  options: StandaloneHtmlOptions = {}
): string {
  const title = options.title || project.title || 'ForgeGIS Interactive Map Report';
  const subtitle = options.subtitle || project.description || 'Exported from ForgeGIS Platform';
  const projectJson = JSON.stringify(project).replace(/<\/script>/gi, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  
  <!-- MapLibre GL JS -->
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #0a0a0c;
      --card-bg: rgba(18, 18, 23, 0.88);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-main: #f5f5f7;
      --text-muted: #9d9da8;
      --accent-gold: #e3b450;
      --accent-rose: #f47fa3;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--bg);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: var(--text-main);
    }

    #map {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }

    /* Glass Panels */
    .glass-panel {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      z-index: 10;
    }

    /* Header Bar */
    .header-bar {
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: auto;
    }

    .brand-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .badge-pill {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 9999px;
      background: rgba(227, 180, 80, 0.15);
      color: var(--accent-gold);
      border: 1px solid rgba(227, 180, 80, 0.3);
    }

    /* Layers Sidebar */
    .layers-sidebar {
      position: absolute;
      top: 76px;
      left: 16px;
      width: 280px;
      max-height: calc(100vh - 100px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .layers-list {
      padding: 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .layer-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .layer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .layer-name {
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 14px;
      padding: 2px 6px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .toggle-btn.active {
      color: var(--accent-gold);
    }

    /* Legend */
    .legend-panel {
      position: absolute;
      bottom: 24px;
      right: 16px;
      max-width: 260px;
      padding: 12px 14px;
    }

    .legend-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      color: var(--text-muted);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      margin-bottom: 4px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    /* Popup */
    .maplibregl-popup-content {
      background: var(--card-bg) !important;
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      color: var(--text-main);
      padding: 12px !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
      font-family: inherit;
      font-size: 11px;
      max-width: 280px;
    }

    .maplibregl-popup-close-button {
      color: var(--text-muted);
      font-size: 16px;
      padding: 4px 8px;
    }

    .popup-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }

    .popup-table td {
      padding: 3px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .popup-key {
      color: var(--text-muted);
      font-weight: 500;
      width: 40%;
    }

    .popup-val {
      font-family: 'JetBrains Mono', monospace;
      text-align: right;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- Header -->
  <div class="glass-panel header-bar">
    <div class="brand-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e3b450" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
      <div>
        <h1 style="font-size: 13px; font-weight: 700; letter-spacing: -0.01em;">${escapeHtml(title)}</h1>
        <p style="font-size: 10px; color: var(--text-muted);">${escapeHtml(subtitle)}</p>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span class="badge-pill">Self-Contained Report</span>
      <span class="badge-pill" style="color: var(--accent-rose); border-color: rgba(244, 127, 163, 0.3); background: rgba(244, 127, 163, 0.1);">
        ${project.layers.length} Layers
      </span>
    </div>
  </div>

  <!-- Layers Sidebar -->
  <div class="glass-panel layers-sidebar">
    <div class="sidebar-header">
      <span>Layers</span>
      <span style="font-size: 10px; color: var(--accent-gold);">${project.layers.length} Total</span>
    </div>
    <div class="layers-list" id="layers-list"></div>
  </div>

  <!-- Legend -->
  <div class="glass-panel legend-panel">
    <div class="legend-title">Legend</div>
    <div id="legend-list"></div>
  </div>

  <!-- Inlined Project Data -->
  <script id="forgegis-project" type="application/json">
    ${projectJson}
  </script>

  <!-- Viewer Script -->
  <script>
    (function() {
      const projectData = JSON.parse(document.getElementById('forgegis-project').textContent);
      const layers = projectData.layers || [];
      const view = projectData.view || { longitude: 0, latitude: 0, zoom: 2, pitch: 0, bearing: 0 };
      const basemap = projectData.basemap || { url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png' };

      // Initialize MapLibre GL
      const map = new maplibregl.Map({
        container: 'map',
        style: {
          version: 8,
          sources: {
            'basemap-raster': {
              type: 'raster',
              tiles: [basemap.url],
              tileSize: 256,
              attribution: basemap.attribution || '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'basemap-tiles',
              type: 'raster',
              source: 'basemap-raster',
              minzoom: 0,
              maxzoom: 22
            }
          ]
        },
        center: [view.longitude, view.latitude],
        zoom: view.zoom,
        pitch: view.pitch,
        bearing: view.bearing
      });

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

      map.on('load', () => {
        layers.forEach((layer) => {
          const layerData = layer.data || layer.source?.data;
          if (!layerData) return;

          const sourceId = 'src-' + layer.id;
          const fillLayerId = 'layer-fill-' + layer.id;
          const lineLayerId = 'layer-line-' + layer.id;
          const circleLayerId = 'layer-circle-' + layer.id;

          map.addSource(sourceId, {
            type: 'geojson',
            data: layerData
          });

          const fillColor = layer.style?.color || '#e3b450';
          const strokeColor = layer.style?.strokeColor || '#ffffff';
          const opacity = layer.opacity !== undefined ? layer.opacity : 0.8;
          const visible = layer.visible !== false ? 'visible' : 'none';

          // Polygon Fill
          map.addLayer({
            id: fillLayerId,
            type: 'fill',
            source: sourceId,
            filter: ['==', '$type', 'Polygon'],
            layout: { visibility: visible },
            paint: {
              'fill-color': fillColor,
              'fill-opacity': opacity * 0.7
            }
          });

          // Line
          map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            filter: ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
            layout: { visibility: visible },
            paint: {
              'line-color': strokeColor,
              'line-width': layer.style?.strokeWidth || 1.5,
              'line-opacity': opacity
            }
          });

          // Circle Points
          map.addLayer({
            id: circleLayerId,
            type: 'circle',
            source: sourceId,
            filter: ['==', '$type', 'Point'],
            layout: { visibility: visible },
            paint: {
              'circle-radius': layer.style?.pointRadius || 6,
              'circle-color': fillColor,
              'circle-stroke-color': strokeColor,
              'circle-stroke-width': 1.5,
              'circle-opacity': opacity
            }
          });

          // Click popup
          [fillLayerId, lineLayerId, circleLayerId].forEach((lid) => {
            map.on('click', lid, (e) => {
              if (!e.features || !e.features[0]) return;
              const feat = e.features[0];
              const props = feat.properties || {};

              let html = '<div style="font-weight:600;margin-bottom:4px;color:var(--accent-gold);">' + (layer.name || 'Feature') + '</div>';
              html += '<table class="popup-table">';
              for (const [k, v] of Object.entries(props)) {
                if (k.startsWith('_')) continue;
                html += '<tr><td class="popup-key">' + escapeHtml(k) + '</td><td class="popup-val">' + escapeHtml(String(v)) + '</td></tr>';
              }
              html += '</table>';

              new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);
            });

            map.on('mouseenter', lid, () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', lid, () => { map.getCanvas().style.cursor = ''; });
          });
        });

        renderUi();
      });

      function renderUi() {
        const layersListEl = document.getElementById('layers-list');
        const legendListEl = document.getElementById('legend-list');

        layersListEl.innerHTML = '';
        legendListEl.innerHTML = '';

        layers.forEach((layer) => {
          const color = layer.style?.color || '#e3b450';

          // Layers panel item
          const item = document.createElement('div');
          item.className = 'layer-card';
          item.innerHTML = \`
            <div class="layer-row">
              <span class="legend-color" style="background: \${color};"></span>
              <span class="layer-name" title="\${escapeHtml(layer.name)}">\${escapeHtml(layer.name)}</span>
              <button class="toggle-btn active" id="toggle-\${layer.id}">👁</button>
            </div>
          \`;
          layersListEl.appendChild(item);

          const toggleBtn = item.querySelector('#toggle-' + layer.id);
          let isVis = layer.visible !== false;
          toggleBtn.onclick = () => {
            isVis = !isVis;
            toggleBtn.classList.toggle('active', isVis);
            const val = isVis ? 'visible' : 'none';
            ['layer-fill-', 'layer-line-', 'layer-circle-'].forEach((p) => {
              const lid = p + layer.id;
              if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', val);
            });
          };

          // Legend item
          const legItem = document.createElement('div');
          legItem.className = 'legend-item';
          legItem.innerHTML = \`
            <span class="legend-color" style="background: \${color};"></span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${escapeHtml(layer.name)}</span>
          \`;
          legendListEl.appendChild(legItem);
        });
      }

      function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (m) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
      }
    })();

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[m]));
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m] || m));
}
