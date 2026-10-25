# ForgeGIS Repository Conventions & Developer Guide

## Repository Overview
ForgeGIS is an open-source, local-first, cloud-native geospatial exploration platform monorepo configured with `pnpm` workspaces:
- `apps/web`: Vite + React web application with MapLibre GL JS & deck.gl
- `apps/desktop`: Tauri v2 desktop shell
- `packages/core`: Core GIS models, loaders, DuckDB-WASM, geoprocessing registry, and plugin sandbox
- `packages/ui`: VoiceStudio-styled UI tokens, components, and bento layouts
- `packages/plugins`: Core extensible plugins (Time Slider, Planetary Basemaps, Atmosphere)
- `python/forgegis`: Python package & AnyWidget for Jupyter notebooks
- `docs/`: MkDocs Material documentation
- `e2e/`: Playwright end-to-end user flow test suite

## Coding Standards & Typing Rules
1. **Strict TypeScript**:
   - Every file must have typed interfaces.
   - **No `any` without an explicit explanatory comment** explaining why the third-party boundary requires it.
2. **Modular Architecture**:
   - Keep modules small, decoupled, and single-purpose (< 300 lines per module).
   - Core packages must not depend on UI packages (`@forgegis/core` is strictly headless).
3. **Design System & Styling**:
   - Inspired by **VoiceStudio.sh**:
     - Backgrounds: `#0a0a0c`, `#121217`, `#181820`
     - Borders: Hairline `rgba(255, 255, 255, 0.08)`
     - Accents: Sunset Rose `#f47fa3`, Warm Gold `#e3b450` / `#fbe7a1`, Cyan `#38bdf8`
     - Controls: Glass pill buttons (`rounded-full`, `px-3.5 py-1.5 text-xs`), micro monospace headers (`font-mono text-[10px] uppercase tracking-wider`).
4. **Testing Requirements**:
   - Every feature must have an associated unit test (`*.test.ts`).
   - Every user flow must have an end-to-end Playwright test (`*.spec.ts`).

## Common Commands
- `pnpm install`: Install dependencies across all workspace packages
- `pnpm dev`: Start the web application development server
- `pnpm build`: Build all packages and the web application
- `pnpm test`: Run unit tests with Vitest
- `pnpm e2e`: Run Playwright end-to-end tests
- `pnpm typecheck`: Run TypeScript compiler typecheck across all packages
