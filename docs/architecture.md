# System Architecture

ForgeGIS is structured as an npm/pnpm workspaces monorepo:

```
forgegis/
├── apps/
│   ├── web/          # React + Vite web application
│   └── desktop/      # Tauri v2 Rust native desktop container
├── packages/
│   ├── core/         # Data loaders, Project Schema, Measurements, DuckDB engine, Tool Registry
│   ├── ui/           # VoiceStudio design system, React components, Tailwind tokens
│   └── plugins/      # Time slider, Planetary basemaps, Atmosphere terminator
├── python/           # Jupyter AnyWidget package (forgegis)
├── docs/             # MkDocs Material documentation site
└── e2e/              # Playwright multi-platform test suite
```

---

## 🎨 VoiceStudio Dark Aesthetic Design System

ForgeGIS strictly adheres to the VoiceStudio design philosophy:
- Dark background canvas (`#0a0a0c`, `#0e0e13`, `#121217`, `#181820`)
- Subtle hairline borders (`border-white/8`, `border-white/10`)
- Curved pill controls (`rounded-full`, `rounded-2xl`)
- Curated color accents: Warm Gold (`#e3b450`) & Rose Pink (`#f47fa3`)
- Modern typography: Plus Jakarta Sans for UI, JetBrains Mono for coordinates & SQL
