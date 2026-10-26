const { chromium } = require('../e2e/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');

async function generatePdf() {
  console.log('Generating publication-grade ForgeGIS Platform User Guide PDF...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ForgeGIS — Complete Platform Guide & Operation Manual</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 9.2pt;
      margin: 0;
      padding: 0;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      height: 260mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24mm 14mm 16mm 14mm;
      background: linear-gradient(135deg, #0a0a0c 0%, #121217 60%, #181820 100%);
      color: #f5f5f7;
      border-radius: 12px;
    }

    .cover-brand {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .cover-logo-box {
      width: 68px;
      height: 68px;
      border-radius: 16px;
      background: #1c1c24;
      border: 1px solid rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6);
    }

    .cover-title {
      font-size: 34pt;
      font-weight: 800;
      letter-spacing: -0.04em;
      margin: 0 0 6px 0;
      line-height: 1.1;
    }

    .cover-title span.accent {
      color: #f47fa3;
    }

    .cover-subtitle {
      font-size: 13.5pt;
      color: #9d9da8;
      font-weight: 400;
      margin-bottom: 24px;
      line-height: 1.4;
    }

    .cover-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 8.5pt;
      font-family: monospace;
      background: rgba(227, 180, 80, 0.15);
      border: 1px solid rgba(227, 180, 80, 0.3);
      color: #e3b450;
      margin-bottom: 16px;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin: 28px 0;
    }

    .cover-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 14px 16px;
    }

    .cover-card h4 {
      margin: 0 0 6px 0;
      color: #38bdf8;
      font-size: 9.8pt;
      font-weight: 600;
    }

    .cover-card p {
      margin: 0;
      font-size: 8.5pt;
      color: #9d9da8;
      line-height: 1.45;
    }

    .cover-meta {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #71717a;
    }

    /* Headings */
    h1, h2, h3, h4 {
      color: #0f172a;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    h1 {
      font-size: 15pt;
      margin-top: 18pt;
      margin-bottom: 8pt;
      padding-bottom: 4pt;
      border-bottom: 1.5px solid #e2e8f0;
      page-break-after: avoid;
    }

    .section-num {
      color: #f47fa3;
      margin-right: 6px;
    }

    h2 {
      font-size: 11.5pt;
      margin-top: 12pt;
      margin-bottom: 6pt;
      color: #1e293b;
      page-break-after: avoid;
    }

    h3 {
      font-size: 9.8pt;
      margin-top: 10pt;
      margin-bottom: 4pt;
      color: #334155;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 6pt 0;
      text-align: justify;
    }

    /* Table of contents */
    .toc-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 20px;
      margin-bottom: 18pt;
      page-break-inside: avoid;
    }

    .toc-title {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }

    .toc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 20px;
      font-size: 8.5pt;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      color: #334155;
      border-bottom: 1px dotted #cbd5e1;
      padding-bottom: 1px;
    }

    .toc-num {
      color: #f47fa3;
      font-weight: 600;
      margin-right: 4px;
    }

    /* Callouts */
    .callout {
      border-radius: 6px;
      padding: 10px 14px;
      margin: 8pt 0;
      page-break-inside: avoid;
      font-size: 8.8pt;
    }

    .callout-info {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #22c55e;
      color: #14532d;
    }

    .callout-warning {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-left: 4px solid #eab308;
      color: #713f12;
    }

    .callout-tip {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-left: 4px solid #0ea5e9;
      color: #0369a1;
    }

    .callout strong {
      font-weight: 600;
      display: block;
      margin-bottom: 3px;
    }

    /* Code Blocks */
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 12px;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "JetBrains Mono", monospace;
      font-size: 8pt;
      line-height: 1.4;
      overflow-x: auto;
      margin: 8pt 0;
      border: 1px solid #1e293b;
      page-break-inside: avoid;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "JetBrains Mono", monospace;
      font-size: 8.2pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8pt 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    th {
      background: #f8fafc;
      color: #334155;
      font-weight: 600;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #fdfdfd;
    }

    kbd {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-bottom: 2px solid #94a3b8;
      border-radius: 3px;
      padding: 1px 4px;
      font-size: 7.5pt;
      font-family: monospace;
      font-weight: 600;
      color: #334155;
    }

    .page-break {
      page-break-before: always;
    }

    ul, ol {
      margin: 0 0 8pt 0;
      padding-left: 18px;
    }

    li {
      margin-bottom: 3px;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: COVER PAGE ================= -->
  <div class="cover-page">
    <div>
      <div class="cover-brand">
        <div class="cover-logo-box">
          <svg width="44" height="44" viewBox="0 0 113 113" fill="none">
            <path d="M56.5 14 L96 35 L56.5 56 L17 35 Z" fill="#4a2810"/>
            <path d="M17 49 L56.5 70 L96 49 L96 57 L56.5 78 L17 57 Z" fill="#8c5828"/>
            <path d="M17 71 L56.5 92 L96 71 L96 79 L56.5 100 L17 79 Z" fill="#4a2810"/>
          </svg>
        </div>
        <div>
          <div class="cover-pill">LOCAL-FIRST • CLOUD-NATIVE • WEBASSEMBLY</div>
          <h1 class="cover-title">Forge<span class="accent">GIS</span></h1>
          <div class="cover-subtitle">Complete Platform Operation Manual & System Guideline</div>
        </div>
      </div>

      <div class="cover-grid">
        <div class="cover-card">
          <h4>🚀 100% In-Browser & Local-First</h4>
          <p>Zero mandatory server dependencies. Full spatial SQL (DuckDB-WASM), 17 geoprocessing tools, and interactive Python scripting running directly on client hardware.</p>
        </div>
        <div class="cover-card">
          <h4>🗺️ Cloud-Native Spatial Formats</h4>
          <p>Direct streaming and high-speed parsing of GeoParquet, PMTiles, Cloud-Optimized GeoTIFFs (COG), GeoJSON, CSV, and Shapefiles (.zip/.shp).</p>
        </div>
        <div class="cover-card">
          <h4>🌍 East Africa & Global Focus</h4>
          <p>Native configuration tuned for coastal monitoring, marine telemetry, Great Lakes, and Swahili Coast resilience mapping with high-resolution global basemaps.</p>
        </div>
        <div class="cover-card">
          <h4>💻 Multi-Platform Deployment</h4>
          <p>Seamless operation as a high-performance React/Vite Web App, Tauri v2 native desktop application, and Jupyter Notebook AnyWidget.</p>
        </div>
      </div>
    </div>

    <div class="cover-meta">
      <div><strong>Platform:</strong> ForgeGIS Monorepo v0.1.0</div>
      <div><strong>Architecture:</strong> Rust + TypeScript + DuckDB-WASM</div>
      <div><strong>Focus:</strong> East Africa Coastal & Global Geospatial Intelligence</div>
    </div>
  </div>

  <!-- ================= PAGE 2: TOC & SECTION 1 ================= -->
  <div class="toc-container">
    <div class="toc-title">Table of Contents</div>
    <div class="toc-grid">
      <div class="toc-item"><span><span class="toc-num">01.</span> Platform Architecture & Philosophy</span><span>Page 2</span></div>
      <div class="toc-item"><span><span class="toc-num">02.</span> Getting Started & Setup</span><span>Page 3</span></div>
      <div class="toc-item"><span><span class="toc-num">03.</span> Basemaps & CARTO API Key Setup</span><span>Page 3</span></div>
      <div class="toc-item"><span><span class="toc-num">04.</span> Data Ingestion & Supported Formats</span><span>Page 4</span></div>
      <div class="toc-item"><span><span class="toc-num">05.</span> Map Canvas, 2D/3D & Projections</span><span>Page 4</span></div>
      <div class="toc-item"><span><span class="toc-num">06.</span> Layer Management & Symbology</span><span>Page 5</span></div>
      <div class="toc-item"><span><span class="toc-num">07.</span> Attribute Table & Data Inspection</span><span>Page 5</span></div>
      <div class="toc-item"><span><span class="toc-num">08.</span> Spatial SQL with DuckDB-WASM</span><span>Page 6</span></div>
      <div class="toc-item"><span><span class="toc-num">09.</span> Geoprocessing Toolbox (17 Tools)</span><span>Page 7</span></div>
      <div class="toc-item"><span><span class="toc-num">10.</span> In-Browser Python Workspace</span><span>Page 8</span></div>
      <div class="toc-item"><span><span class="toc-num">11.</span> Modular Plugin Architecture</span><span>Page 8</span></div>
      <div class="toc-item"><span><span class="toc-num">12.</span> Sharing, Export & HTML Reports</span><span>Page 9</span></div>
      <div class="toc-item"><span><span class="toc-num">13.</span> Desktop Shell (Tauri v2)</span><span>Page 9</span></div>
      <div class="toc-item"><span><span class="toc-num">14.</span> Keyboard Shortcuts Reference</span><span>Page 10</span></div>
      <div class="toc-item"><span><span class="toc-num">15.</span> Troubleshooting & FAQ</span><span>Page 10</span></div>
    </div>
  </div>

  <h1><span class="section-num">01.</span> Platform Architecture & Philosophy</h1>
  <p><strong>ForgeGIS</strong> is an open-source, local-first geospatial analytics and visualization platform built to deliver GIS workstation capabilities without heavy backend servers. The platform leverages modern browser standards (WebAssembly, WebGL, Web Workers, and SIMD) to process complex spatial datasets completely in memory.</p>

  <h3>Monorepo Topology</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Package</th>
        <th style="width: 25%;">Technology</th>
        <th>Role & Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>apps/web</code></td>
        <td>React 18, Vite 6, Tailwind</td>
        <td>Main web application providing map canvas, docks, modals, and user interface.</td>
      </tr>
      <tr>
        <td><code>apps/desktop</code></td>
        <td>Tauri v2, Rust</td>
        <td>Native desktop wrapper with direct disk I/O, OS file dialogs, and low memory overhead.</td>
      </tr>
      <tr>
        <td><code>packages/core</code></td>
        <td>TypeScript, DuckDB-WASM</td>
        <td>Headless engine containing data loaders, spatial schema, project store, and measurement math.</td>
      </tr>
      <tr>
        <td><code>packages/ui</code></td>
        <td>VoiceStudio CSS Tokens</td>
        <td>Design system components: Modals, Buttons, BasemapSwitcher, Panels, and Workspaces.</td>
      </tr>
      <tr>
        <td><code>packages/plugins</code></td>
        <td>TypeScript Plugin API</td>
        <td>Capability-sandboxed plugins: Temporal Time Slider, Planetary Globes, and Solar Terminator.</td>
      </tr>
      <tr>
        <td><code>python/</code></td>
        <td>AnyWidget, Python 3.9+</td>
        <td>JupyterLab and Google Colab interactive widget integration.</td>
      </tr>
    </tbody>
  </table>

  <!-- ================= PAGE 3: SETUP & BASEMAPS ================= -->
  <div class="page-break"></div>
  <h1><span class="section-num">02.</span> Getting Started & Setup</h1>
  <p>ForgeGIS can be run in development mode or built for production across web and desktop environments.</p>

  <h3>Installation & Monorepo Setup</h3>
  <pre><code># 1. Clone repository and install dependencies
git clone https://github.com/your-org/ForgeGIS.git
cd ForgeGIS
pnpm install

# 2. Launch web application in development mode
pnpm --filter @forgegis/web dev</code></pre>
  <p>The application starts at <code>http://localhost:3000</code> with instant Hot Module Replacement (HMR).</p>

  <h1><span class="section-num">03.</span> Basemaps & CARTO API Key Setup</h1>
  <p>ForgeGIS ships with multiple high-resolution basemap providers, including Carto Dark Matter, Carto Positron, Esri Dark Gray, OpenStreetMap, and World Imagery Satellite.</p>

  <div class="callout callout-warning">
    <strong>CARTO Basemaps Policy Requirement</strong>
    CARTO raster tile services require an authorized API key (appended as <code>?key=YOUR_API_KEY</code>). Without a valid key, tiles show an <em>"API KEY REQUIRED"</em> watermark.
  </div>

  <h3>Option A: In-App Configuration (Instant — No Restart)</h3>
  <ol>
    <li>Click the <strong>Key icon button</strong> (<kbd>🔑</kbd>) on the top-right header (or open the Basemap switcher and click <strong>"Configure API Keys..."</strong>).</li>
    <li>Paste your CARTO key into the <strong>CARTO Basemaps API Key</strong> input. Free keys are available instantly at <a href="https://carto.com/basemaps/apikey/">carto.com/basemaps/apikey/</a>.</li>
    <li>Click <strong>Save & Apply</strong>. The map reloads tiles immediately with no watermark.</li>
  </ol>

  <h3>Option B: Workspace Environment Variable</h3>
  <p>Open <code>apps/web/.env</code> or <code>apps/web/.env.local</code> and define:</p>
  <pre><code># CARTO Basemaps API Key (removes watermarks)
VITE_CARTO_API_KEY=cb1_4v80_1_7c3351a523f9e7b274c6e776

# Optional: Mapbox Access Token for custom styles
VITE_MAPBOX_TOKEN=pk.eyJ1Ijo...</code></pre>

  <h3>Option C: Free Watermark-Free Alternatives (No Key Needed)</h3>
  <p>If operating offline or without an API key, switch the basemap dropdown to <strong>Esri Dark Gray (No Key Required)</strong>, <strong>OpenStreetMap</strong>, or <strong>World Imagery (Satellite)</strong> for 100% free, watermark-free operation.</p>

  <!-- ================= PAGE 4: DATA INGESTION & MAP CANVAS ================= -->
  <div class="page-break"></div>
  <h1><span class="section-num">04.</span> Data Ingestion & Formats</h1>
  <p>ForgeGIS provides seamless drag-and-drop loading and remote URL fetching for both vector and raster data formats without server conversion pipelines.</p>

  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Format</th>
        <th style="width: 25%;">Extensions</th>
        <th>Loading Mechanism & Capabilities</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>GeoJSON</strong></td>
        <td><code>.geojson</code>, <code>.json</code></td>
        <td>Streaming JSON parser. Instant auto-bounding and symbology generation.</td>
      </tr>
      <tr>
        <td><strong>Delimited CSV</strong></td>
        <td><code>.csv</code></td>
        <td>Auto-detects latitude/longitude coordinate columns (e.g., <code>lat</code>, <code>lon</code>, <code>latitude</code>, <code>longitude</code>).</td>
      </tr>
      <tr>
        <td><strong>Shapefile</strong></td>
        <td><code>.zip</code>, <code>.shp</code>, <code>.dbf</code></td>
        <td>Parses binary shapefiles and attribute tables client-side in WebAssembly.</td>
      </tr>
      <tr>
        <td><strong>GeoParquet</strong></td>
        <td><code>.parquet</code>, <code>.geoparquet</code></td>
        <td>Reads columnar Apache Parquet files directly via DuckDB-WASM for blazing fast queries.</td>
      </tr>
      <tr>
        <td><strong>PMTiles</strong></td>
        <td><code>.pmtiles</code></td>
        <td>Cloud-native vector/raster tile pyramids with single-file HTTP range requests.</td>
      </tr>
      <tr>
        <td><strong>Cloud TIFF (COG)</strong></td>
        <td><code>.tif</code>, <code>.tiff</code>, <code>.cog</code></td>
        <td>Streams high-resolution satellite imagery tiles via HTTP byte range headers.</td>
      </tr>
    </tbody>
  </table>

  <h3>Sample Datasets (East Africa Focus)</h3>
  <ul>
    <li><strong>East Africa Marine Sensor Buoys:</strong> Real-time water temperature, wave height, tide levels, and salinity across Mombasa, Malindi, Lamu, Zanzibar, Dar es Salaam, Mafia Island, and Lake Victoria.</li>
    <li><strong>East Africa Coastal & Marine Resilience Zones:</strong> High-resolution spatial polygons protecting Lamu Mangrove Biospheres, Mombasa Harbor Sanctuary, Watamu Marine Park, and Zanzibar Menai Bay.</li>
  </ul>

  <h1><span class="section-num">05.</span> Map Canvas, 2D/3D & Projections</h1>
  <p>The map canvas is powered by MapLibre GL JS with custom Deck.gl layers and reactive projection switching.</p>
  <ul>
    <li><strong>2D Mercator Map:</strong> Standard high-performance planar map view for local and regional analysis.</li>
    <li><strong>3D Spherical Globe:</strong> Click the <strong>Globe</strong> button (<kbd>2D Map</kbd> / <kbd>Globe</kbd>) on the top-right toolbar to wrap coordinates onto a true 3D spherical globe with smooth horizon rendering.</li>
    <li><strong>3D Terrain & Pitch:</strong> Click the <kbd>3D</kbd> button to tilt the camera to a 50° pitch angle and enable digital elevation model terrain relief.</li>
    <li><strong>North Compass Reset:</strong> Floating dynamic compass icon re-orients the map due North on click.</li>
    <li><strong>Geodesic Measurement:</strong> Press <kbd>M</kbd> or click <strong>Distance</strong> / <strong>Area</strong> to compute geodesic lengths and surface areas.</li>
  </ul>

  <!-- ================= PAGE 5: LAYERS & ATTRIBUTE TABLE ================= -->
  <div class="page-break"></div>
  <h1><span class="section-num">06.</span> Layer Management & Symbology</h1>
  <p>The left-side collapsible dock (<kbd>L</kbd>) displays all loaded project layers with instant re-ordering, visibility toggling, opacity control, and styling tools.</p>

  <h3>Symbology Classification Types</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Mode</th>
        <th style="width: 35%;">Use Case</th>
        <th>Configuration Options</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Single Symbol</strong></td>
        <td>Uniform color for points, lines, or polygons.</td>
        <td>Point radius (px), stroke color, fill color, and global opacity slider (0–100%).</td>
      </tr>
      <tr>
        <td><strong>Categorized (Unique)</strong></td>
        <td>Nominal attributes (e.g., Risk Level: <em>High, Medium, Low</em>).</td>
        <td>Select categorical field; automatically assigns distinctive color palette per category.</td>
      </tr>
      <tr>
        <td><strong>Graduated Bins</strong></td>
        <td>Continuous numerical variables (e.g., Wave Height, Salinity).</td>
        <td>Configures ramp thresholds (e.g., 0–1m, 1–2m, 2m+) with sequential color ramps.</td>
      </tr>
      <tr>
        <td><strong>3D Polygon Extrusion</strong></td>
        <td>Urban density, flood depth, or elevation visualization.</td>
        <td>Ties polygon height extrusion in meters to numeric fields (e.g., <code>flood_depth_m * 100</code>).</td>
      </tr>
    </tbody>
  </table>

  <h1><span class="section-num">07.</span> Attribute Table & Data Inspection</h1>
  <p>Click the <strong>Table icon</strong> on any layer dock card to open the interactive Attribute Table bottom sheet.</p>
  <ul>
    <li><strong>Sorting:</strong> Click any column header to toggle ascending or descending sorting.</li>
    <li><strong>Search & Filter:</strong> Type in the filter bar to instantaneously filter across all fields in real time.</li>
    <li><strong>Row Zoom:</strong> Click the expand icon (<kbd>⤢</kbd>) next to any record to fly the map camera directly to that specific feature's geometry.</li>
    <li><strong>CSV Export:</strong> Click <kbd>Export CSV</kbd> to save the filtered tabular dataset to your local drive.</li>
  </ul>

  <!-- ================= PAGE 6: SPATIAL SQL ================= -->
  <div class="page-break"></div>
  <h1><span class="section-num">08.</span> In-Browser Spatial SQL with DuckDB-WASM</h1>
  <p>ForgeGIS embeds <strong>DuckDB-WASM</strong> with the official spatial extension. When any layer is loaded, it is automatically registered as a virtual table ready for high-performance SQL analytics.</p>

  <h3>Supported Spatial Functions</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 30%;">Function</th>
        <th>Description & Typical Application</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>ST_Point(lon, lat)</code></td>
        <td>Constructs point geometries from tabular longitude and latitude columns.</td>
      </tr>
      <tr>
        <td><code>ST_Distance(geom1, geom2)</code></td>
        <td>Calculates planar distance between two spatial geometry entities.</td>
      </tr>
      <tr>
        <td><code>ST_Intersects(geom1, geom2)</code></td>
        <td>Evaluates topological intersection between polygons, lines, or points.</td>
      </tr>
      <tr>
        <td><code>ST_Within(geom1, geom2)</code></td>
        <td>Tests whether geometry 1 is strictly inside the boundary of geometry 2.</td>
      </tr>
      <tr>
        <td><code>ST_Area(geom)</code></td>
        <td>Calculates exact polygon surface area in projected coordinates.</td>
      </tr>
      <tr>
        <td><code>ST_Centroid(geom)</code></td>
        <td>Computes the geographic center of mass for irregular boundary polygons.</td>
      </tr>
    </tbody>
  </table>

  <h3>Example 1: Filter High-Wave Telemetry Buoys</h3>
  <pre><code>SELECT
  station_id, station_name, wave_height_m, water_temp_c,
  ST_Point(longitude, latitude) AS geom
FROM "East Africa Marine Sensor Buoys"
WHERE wave_height_m > 1.0
ORDER BY wave_height_m DESC;</code></pre>

  <h3>Example 2: Spatial Join & Sensor Aggregation per Protected Zone</h3>
  <pre><code>SELECT
  z.zone_name,
  count(s.station_id) AS buoy_count,
  round(avg(s.salinity_psu), 2) AS mean_salinity,
  round(avg(s.water_temp_c), 1) AS mean_temp
FROM "East Africa Coastal & Marine Resilience Zones" z
JOIN "East Africa Marine Sensor Buoys" s
  ON ST_Within(ST_Point(s.longitude, s.latitude), z.geom)
GROUP BY z.zone_name;</code></pre>

  <!-- ================= PAGE 7: GEOPROCESSING TOOLBOX ================= -->
  <div class="page-break"></div>
  <h1><span class="section-num">09.</span> Geoprocessing Toolbox (17 WASM Tools)</h1>
  <p>Press <kbd>T</kbd> or click <strong>Toolbox</strong> on the top header to access the 17 built-in WebAssembly geoprocessing operations. Tools execute client-side via dedicated Web Workers without freezing the UI.</p>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Category</th>
        <th style="width: 30%;">Tool Name & ID</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td rowspan="5"><strong>Vector Analysis</strong></td>
        <td>Buffer (<code>vector-buffer</code>)</td>
        <td>Generates equidistant geodesic buffer zones around points, lines, or polygons.</td>
      </tr>
      <tr>
        <td>Dissolve (<code>vector-dissolve</code>)</td>
        <td>Merges adjacent or overlapping polygons sharing an attribute value.</td>
      </tr>
      <tr>
        <td>Clip (<code>vector-clip</code>)</td>
        <td>Clips features of an input vector layer to a boundary polygon layer.</td>
      </tr>
      <tr>
        <td>Convex Hull (<code>vector-convex-hull</code>)</td>
        <td>Computes the minimum enclosing convex polygon for a point cloud.</td>
      </tr>
      <tr>
        <td>Centroid (<code>vector-centroid</code>)</td>
        <td>Derives the center of mass point for each polygon feature.</td>
      </tr>
      <tr>
        <td rowspan="3"><strong>Spatial Meshing</strong></td>
        <td>Voronoi (<code>vector-voronoi</code>)</td>
        <td>Creates Dirichlet/Voronoi tessellation polygons around point sets.</td>
      </tr>
      <tr>
        <td>Delaunay (<code>vector-delaunay</code>)</td>
        <td>Constructs planar Delaunay triangle meshes from point locations.</td>
      </tr>
      <tr>
        <td>Simplify (<code>vector-simplify</code>)</td>
        <td>Douglas-Peucker vertex reduction for high-resolution polylines.</td>
      </tr>
      <tr>
        <td rowspan="2"><strong>Terrain Analysis</strong></td>
        <td>Contour Isolines (<code>terrain-contour</code>)</td>
        <td>Generates elevation and bathymetric contour lines from raster grids.</td>
      </tr>
      <tr>
        <td>Hillshade (<code>terrain-hillshade</code>)</td>
        <td>Analytical multi-directional terrain shading from elevation DEMs.</td>
      </tr>
      <tr>
        <td rowspan="2"><strong>Conversion</strong></td>
        <td>PMTiles Converter (<code>conv-pmtiles</code>)</td>
        <td>Converts vector layers to single-file serverless tile pyramids.</td>
      </tr>
      <tr>
        <td>GeoParquet Serializer (<code>conv-geoparquet</code>)</td>
        <td>Exports layers into columnar GeoParquet format for cloud analytics.</td>
      </tr>
    </tbody>
  </table>

  <h3>Deep-Linking & Headless Execution</h3>
  <pre><code>http://localhost:3000/?tool=vector-buffer&distance=5000&units=meters&autorun=true</code></pre>

  <!-- ================= PAGE 8: PYTHON & PLUGINS ================= -->
  <div class="page-break"></div>
  <h1><span class="section-num">10.</span> In-Browser Python Workspace (Pyodide)</h1>
  <p>Press <kbd>Y</kbd> or click <strong>Python</strong> on the navigation header to open the WebAssembly Python environment powered by <strong>Pyodide</strong>.</p>

  <pre><code>import json

# 1. Inspect loaded layers
layers = json.loads(forgegis.get_layers())
print(f"Total active layers: {len(layers)}")

# 2. Programmatically animate camera to East Africa
forgegis.set_view(39.67, -4.04, 12.5)

# 3. Generate and add a layer from Python code
sample_data = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"station": "Mombasa Reef Alpha", "salinity": 35.2},
            "geometry": {"type": "Point", "coordinates": [39.67, -4.04]}
        }
    ]
}
forgegis.add_layer(json.dumps(sample_data), "Mombasa Python Survey", "#34d399")</code></pre>

  <h1><span class="section-num">11.</span> Modular Plugin Architecture</h1>
  <p>Press <kbd>P</kbd> or click <strong>Plugins</strong> to open the Capability Plugin Manager. Plugins operate within a strict capability security model (declaring <code>map:view</code>, <code>layers:read</code>, <code>layers:write</code>, <code>sql:execute</code>, etc.).</p>

  <ul>
    <li><strong>Time Series Temporal Slider:</strong> Floating timeline scrubber that plays back temporal telemetry with play/pause, scrub speed controls (1x, 2x, 5x, 10x), and timestamp simulation.</li>
    <li><strong>Planetary Basemaps:</strong> Switches map textures to high-resolution USGS Moon, Mars MOLA elevation, and NASA Earth at Night with true spherical globe projection.</li>
    <li><strong>Solar Terminator:</strong> Real-time astronomical great-circle algorithm visualizing day and night twilight transitions across the globe.</li>
  </ul>

  <!-- ================= PAGE 9: EXPORT & DESKTOP ================= -->
  <div class="page-break"></div>
  <h1><span class="section-num">12.</span> Sharing, Export & HTML Reports</h1>
  <p>Press <kbd>E</kbd> or click <strong>Share</strong> on the top-right header:</p>
  <ul>
    <li><strong>Project JSON:</strong> Export complete workspace state (layers, styles, view orientation, SQL queries, plugins) into a standardized <code>.project.json</code> file.</li>
    <li><strong>Standalone HTML Report:</strong> Generates a self-contained single-file HTML document containing the MapLibre engine, basemaps, and embedded GeoJSON data. Can be emailed or opened offline in any browser with zero dependencies.</li>
    <li><strong>Embed Iframe:</strong> Generates responsive <code>&lt;iframe&gt;</code> embed codes for embedding live interactive maps into web portals, blogs, or dashboards.</li>
  </ul>

  <h1><span class="section-num">13.</span> Native Desktop Shell (Tauri v2)</h1>
  <p>ForgeGIS includes a native desktop edition built with <strong>Tauri v2</strong> and Rust.</p>
  <ul>
    <li><strong>Direct SSD I/O:</strong> Bypass browser file upload memory sandboxes to stream multi-gigabyte GeoParquet and Shapefile archives directly from your SSD.</li>
    <li><strong>Native System Windows:</strong> Native file dialogs, background worker threads, and negligible RAM consumption compared to Electron.</li>
  </ul>

  <pre><code># Run desktop shell in development
pnpm --filter @forgegis/desktop dev

# Build native production installer (.exe for Windows, .dmg for macOS, .deb for Linux)
pnpm --filter @forgegis/desktop tauri build</code></pre>

  <!-- ================= PAGE 10: SHORTCUTS & FAQ ================= -->
  <div class="page-break"></div>
  <h1><span class="section-num">14.</span> Keyboard Shortcuts Reference</h1>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Shortcut</th>
        <th style="width: 32%;">Action</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><kbd>M</kbd></td>
        <td>Geodesic Measurement</td>
        <td>Toggle interactive distance line and polygon area measurement tools.</td>
      </tr>
      <tr>
        <td><kbd>S</kbd></td>
        <td>Spatial SQL Workspace</td>
        <td>Open DuckDB-WASM query console for writing and executing spatial SQL.</td>
      </tr>
      <tr>
        <td><kbd>T</kbd></td>
        <td>Geoprocessing Toolbox</td>
        <td>Open 17 client-side WASM geoprocessing algorithms.</td>
      </tr>
      <tr>
        <td><kbd>P</kbd></td>
        <td>Plugin Manager</td>
        <td>Browse, install, configure, and inspect capability-sandboxed plugins.</td>
      </tr>
      <tr>
        <td><kbd>Y</kbd></td>
        <td>Python Workspace</td>
        <td>Open client-side Pyodide WASM Python console and script editor.</td>
      </tr>
      <tr>
        <td><kbd>G</kbd></td>
        <td>Demo Projects Gallery</td>
        <td>Browse 10 curated open-data coastal and marine research projects.</td>
      </tr>
      <tr>
        <td><kbd>L</kbd></td>
        <td>Toggle Layers Dock</td>
        <td>Collapse or expand the left layer management panel.</td>
      </tr>
      <tr>
        <td><kbd>A</kbd></td>
        <td>Add Layer Dialog</td>
        <td>Open modal to upload files, load sample data, or connect remote URLs.</td>
      </tr>
      <tr>
        <td><kbd>E</kbd></td>
        <td>Share & Export Project</td>
        <td>Open project export, standalone HTML report generator, and embed modal.</td>
      </tr>
      <tr>
        <td><kbd>Esc</kbd></td>
        <td>Close Active Modal</td>
        <td>Dismiss any open dialog, workspace sheet, or measurement session.</td>
      </tr>
    </tbody>
  </table>

  <h1><span class="section-num">15.</span> Frequently Asked Questions & Troubleshooting</h1>
  
  <div class="callout callout-info">
    <strong>Q: Why does the basemap say "API KEY REQUIRED"?</strong>
    CARTO updated their tile serving policy. Click the Key button (<kbd>🔑</kbd>) on the top-right header and paste your free CARTO API key (e.g., <code>cb1_4v80_1_7c3351a523f9e7b274c6e776</code>), or switch to <strong>Esri Dark Gray</strong> which requires no key.
  </div>

  <div class="callout callout-tip">
    <strong>Q: Can I use ForgeGIS in an offline / air-gapped environment?</strong>
    Yes! ForgeGIS loads all DuckDB-WASM, Pyodide, and GeoParquet calculation engines client-side. When using PMTiles or local Shapefiles, all processing is 100% local with zero telemetry.
  </div>

  <div class="callout callout-warning">
    <strong>Q: How do I export an interactive map to someone without ForgeGIS installed?</strong>
    Open the Share modal (<kbd>E</kbd>), select <strong>Standalone HTML Report</strong>, and click <strong>Download HTML Report</strong>. The resulting file runs standalone in any browser with no dependencies.
  </div>

</body>
</html>
`;

  const htmlPath = path.resolve(__dirname, 'guide_temp.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });

  const projectPdfPath = path.resolve(__dirname, '../ForgeGIS_Platform_Guide.pdf');
  const desktopPdfPath = 'C:\\Users\\ibrahxbt\\Desktop\\ForgeGIS_Platform_Guide.pdf';

  await page.pdf({
    path: projectPdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 7.5pt; color: #94a3b8; width: 100%; text-align: right; padding-right: 15mm; font-family: sans-serif;">ForgeGIS — Complete Platform Guideline & Operation Manual</div>',
    footerTemplate: '<div style="font-size: 7.5pt; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm; font-family: sans-serif;"><span>ForgeGIS v0.1.0 • Local-First Cloud-Native GIS</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
    margin: {
      top: '16mm',
      bottom: '16mm',
      left: '15mm',
      right: '15mm',
    },
  });

  try {
    fs.copyFileSync(projectPdfPath, desktopPdfPath);
    console.log('Copied PDF to Desktop:', desktopPdfPath);
  } catch (err) {
    console.warn('Could not copy to Desktop:', err.message);
  }

  await browser.close();

  try {
    fs.unlinkSync(htmlPath);
  } catch {}

  console.log('Successfully generated 10-page PDF at:', projectPdfPath);
}

generatePdf().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
