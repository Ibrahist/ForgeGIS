# Desktop Application (Tauri v2)

ForgeGIS Desktop is built using [Tauri v2](https://v2.tauri.app/), providing a native desktop application powered by Rust.

---

## ⚡ Performance Benefits

- **Zero-Sandbox Direct I/O**: Read multi-gigabyte GeoParquet, Shapefile, and PMTiles datasets directly from local SSDs without browser file upload sandboxes.
- **Native OS Dialogs**: Standard system file pickers with folder watching and drag-and-drop.
- **Minimal Memory Footprint**: Uses the OS webview rather than shipping a heavy Chromium binary, resulting in ultra-fast launch times and tiny bundle sizes (< 25MB).

---

## Building from Source

```bash
# Ensure Rust and Cargo are installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI & dependencies
pnpm install

# Run desktop in development mode
pnpm --filter @forgegis/desktop dev

# Build production native installer (exe / dmg / deb)
pnpm --filter @forgegis/desktop tauri build
```
