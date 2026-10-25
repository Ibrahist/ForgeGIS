# Getting Started with ForgeGIS

## Prerequisites
- **Node.js**: v20 or newer
- **pnpm**: v9 or newer (`npm install -g pnpm`)
- **Rust & Cargo**: (Optional, only required for Tauri desktop build)
- **Python**: 3.9+ (Optional, for Jupyter AnyWidget)

---

## Installation & Monorepo Setup

```bash
# Clone the repository
git clone https://github.com/opengeos/GeoLibre.git forgegis
cd forgegis

# Install all workspace dependencies
pnpm install
```

---

## Running Applications

### 1. Web Application
```bash
pnpm --filter @forgegis/web dev
```
Open [http://localhost:3000](http://localhost:3000) in any modern browser.

### 2. Desktop Shell (Tauri v2)
```bash
pnpm --filter @forgegis/desktop dev
```
Launches the native window application with local filesystem read/write privileges.

### 3. Unit and E2E Tests
```bash
# Run unit tests
pnpm --filter @forgegis/core test -- --run
pnpm --filter @forgegis/plugins test

# Run complete Playwright E2E suite
pnpm --filter @forgegis/e2e test
```

---

## Keyboard Shortcuts
Press <kbd>?</kbd> anytime inside ForgeGIS to view the power-user cheat-sheet:

| Key | Action |
|-----|--------|
| <kbd>M</kbd> | Toggle Geodesic Measurement (Distance & Area) |
| <kbd>S</kbd> | Open DuckDB-WASM Spatial SQL Workspace |
| <kbd>T</kbd> | Open Geoprocessing Toolbox (17 Tools) |
| <kbd>P</kbd> | Open Plugin Ecosystem Manager |
| <kbd>Y</kbd> | Open In-Browser Python Workspace (Pyodide) |
| <kbd>G</kbd> | Open Demo Projects Gallery (10 Studies) |
| <kbd>L</kbd> | Collapse / Expand Layers Panel |
| <kbd>A</kbd> | Add Layer Modal |
| <kbd>E</kbd> | Export Project / Standalone HTML Report |
| <kbd>?</kbd> | Keyboard Shortcuts Cheat-Sheet |
