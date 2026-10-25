import { test, expect } from '@playwright/test';

test.describe('Milestone 1: Core Map App Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial demo layers to load
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible({ timeout: 15000 });
  });

  test('loads ForgeGIS with VoiceStudio branding and header pills', async ({ page }) => {
    await expect(page).toHaveTitle(/ForgeGIS/);
    await expect(page.getByText('ForgeGIS')).toBeVisible();
    await expect(page.getByText('v0.1.0')).toBeVisible();
    await expect(page.getByText('Coastal & Marine Intelligence')).toBeVisible();
  });

  test('renders layers panel with initial coastal demo layers', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Layers' })).toBeVisible();
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible();
    await expect(page.getByText('Coastal Flood & Erosion Risk Zones').first()).toBeVisible();
  });

  test('toggles layer visibility', async ({ page }) => {
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible();
    const visibilityBtn = page.locator('button[title="Hide layer"]').first();
    await visibilityBtn.click();
    await expect(page.locator('button[title="Show layer"]').first()).toBeVisible();
  });

  test('opens and interacts with Basemap switcher', async ({ page }) => {
    const basemapBtn = page.locator('button:has-text("Carto Dark Matter")');
    await expect(basemapBtn).toBeVisible();
    await basemapBtn.click();

    // Verify basemap options
    await expect(page.getByRole('button', { name: 'Carto Positron' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'OpenStreetMap' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'World Imagery (Satellite)' })).toBeVisible();

    // Click Positron
    await page.getByRole('button', { name: 'Carto Positron' }).click();
    await expect(page.locator('button:has-text("Carto Positron")')).toBeVisible();
  });

  test('activates measurement mode and shows live HUD', async ({ page }) => {
    const distanceBtn = page.locator('button:has-text("Distance")');
    await expect(distanceBtn).toBeVisible();
    await distanceBtn.click();

    // Live measurement HUD should be visible
    await expect(page.getByText('0.0 m')).toBeVisible();
    await expect(page.getByText('(0 pts)')).toBeVisible();
  });

  test('opens attribute table with search and per-row zoom buttons', async ({ page }) => {
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible();
    const tableBtn = page.locator('button[title="Open attribute table"]').first();
    await tableBtn.click();

    // Attribute table drawer
    await expect(page.getByText(/Attribute Table:/)).toBeVisible();
    await expect(page.locator('input[placeholder="Filter attributes..."]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();

    // Close table
    await page.locator('button[title="Close Table"]').click();
    await expect(page.getByText('Attribute Table: SF Bay Marine Sensor Buoys')).not.toBeVisible();
  });

  test('opens style editor and displays categorized & graduated tabs', async ({ page }) => {
    await expect(page.getByText('Coastal Flood & Erosion Risk Zones').first()).toBeVisible();
    const styleBtn = page.locator('button[title="Data-driven styling"]').first();
    await styleBtn.click();

    await expect(page.getByText('Layer Styling & Symbology')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Categorized' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Graduated' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '3D Extrusion' })).toBeVisible();

    // Switch to Categorized tab
    await page.getByRole('tab', { name: 'Categorized' }).click();
    await expect(page.getByText('Attribute Field')).toBeVisible();
    await expect(page.getByText('Color Ramp')).toBeVisible();
  });

  test('opens Add Layer modal with demo coastal presets and drag-and-drop', async ({ page }) => {
    const addLayerBtn = page.locator('button:has-text("Add Layer")').first();
    await addLayerBtn.click();

    await expect(page.getByText('Add Geospatial Layer')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Coastal Demos' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Local File' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Remote URL' })).toBeVisible();

    // Switch to Local File tab
    await page.getByRole('tab', { name: 'Local File' }).click();
    await expect(page.getByText('Drop your spatial files here, or click to browse')).toBeVisible();
  });
});
