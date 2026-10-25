import { test, expect } from '@playwright/test';

test.describe('Milestone 7: Open-Data Demo Gallery & Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for demo layers
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible({ timeout: 15000 });
  });

  test('opens Demo Gallery modal and filters by domain and search query', async ({ page }) => {
    // Click Gallery button in Header
    const galleryBtn = page.getByRole('button', { name: 'Gallery' });
    await expect(galleryBtn).toBeVisible();
    await galleryBtn.click();

    // Verify modal dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Open-Data Coastal & Environmental Project Gallery' })).toBeVisible();
    await expect(dialog.getByText('10 pre-configured real-world coastal studies')).toBeVisible();

    // Filter by domain button: "Marine Biology"
    const marineBioFilter = dialog.getByRole('button', { name: 'Marine Biology' });
    await expect(marineBioFilter).toBeVisible();
    await marineBioFilter.click();

    // Verify Chesapeake Bay and Puget Sound are visible
    await expect(dialog.getByText('Chesapeake Bay Estuarine Water Quality')).toBeVisible();
    await expect(dialog.getByText('Puget Sound Hydrophone Telemetry & Orca Corridors')).toBeVisible();

    // Verify non-matching project is hidden
    await expect(dialog.getByText('Great Barrier Reef Coral Bleaching Sentinel')).not.toBeVisible();

    // Search query
    const searchInput = dialog.getByPlaceholder('Search 10 demo projects...');
    await searchInput.fill('Chesapeake');
    await expect(dialog.getByText('Chesapeake Bay Estuarine Water Quality')).toBeVisible();
    await expect(dialog.getByText('Puget Sound Hydrophone Telemetry & Orca Corridors')).not.toBeVisible();
  });

  test('loads Chesapeake Bay demo project and updates map layers', async ({ page }) => {
    // Open gallery
    await page.getByRole('button', { name: 'Gallery' }).click();
    const dialog = page.getByRole('dialog');

    // Click "Load Project" on Chesapeake Bay card
    const loadBtn = dialog.getByTestId('load-demo-btn-chesapeake-bay-wq');
    await expect(loadBtn).toBeVisible();
    await loadBtn.click();

    // Verify modal closes
    await expect(dialog).not.toBeVisible();

    // Verify layers panel updated with new layers from loaded project
    await expect(page.getByText('Chesapeake Monitoring Buoys').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Summer Anoxic Core Zone').first()).toBeVisible({ timeout: 10000 });
  });

  test('triggers Demo Gallery via keyboard hotkey G', async ({ page }) => {
    // Press 'g'
    await page.keyboard.press('g');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Open-Data Coastal & Environmental Project Gallery' })).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('opens Keyboard Shortcuts cheat-sheet via header button and hotkey ?', async ({ page }) => {
    // Click keyboard icon in header
    const shortcutBtn = page.getByTitle('Keyboard Shortcuts Cheat-Sheet (?)');
    await expect(shortcutBtn).toBeVisible();
    await shortcutBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Keyboard Shortcuts & Hotkeys' })).toBeVisible();
    await expect(dialog.getByText('Map Navigation')).toBeVisible();
    await expect(dialog.getByText('Tools & Workspaces')).toBeVisible();
    await expect(dialog.getByText('Layer & Project Management')).toBeVisible();
    await expect(dialog.getByText('DuckDB-WASM Spatial SQL Workspace')).toBeVisible();

    // Close modal
    await page.locator('button[aria-label="Close dialog"]').first().click();
    await expect(dialog).not.toBeVisible();

    // Open via '?'
    await page.keyboard.press('?');
    await expect(dialog.getByRole('heading', { name: 'Keyboard Shortcuts & Hotkeys' })).toBeVisible();
  });
});
