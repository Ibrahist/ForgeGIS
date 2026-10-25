// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize)]
pub struct SystemInfo {
    os: String,
    arch: String,
    tauri_version: String,
    is_desktop: bool,
}

#[derive(Serialize, Deserialize)]
pub struct FileMetadata {
    name: String,
    path: String,
    size_bytes: u64,
}

/// Reads a local spatial file directly into a byte buffer for zero-latency processing
#[tauri::command]
fn read_local_file(file_path: String) -> Result<Vec<u8>, String> {
    let path = Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File does not exist: {}", file_path));
    }

    fs::read(path).map_err(|e| format!("Failed to read file {}: {}", file_path, e))
}

/// Writes bytes directly to the local filesystem
#[tauri::command]
fn write_local_file(file_path: String, contents: Vec<u8>) -> Result<u64, String> {
    let path = Path::new(&file_path);
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }

    fs::write(path, &contents).map_err(|e| format!("Failed to write {}: {}", file_path, e))?;
    Ok(contents.len() as u64)
}

/// Returns hardware and OS details for client-side capability tuning
#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        tauri_version: "2.0.0".to_string(),
        is_desktop: true,
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_local_file,
            write_local_file,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running ForgeGIS desktop application");
}
