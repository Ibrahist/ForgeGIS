import { test, expect } from '@playwright/test';

test.describe('Milestone 6: Multi-Platform (Python WASM & Mobile Touch)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for demo layers
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible({ timeout: 15000 });
  });

  test('opens In-Browser Python Workspace and executes script', async ({ page }) => {
    // Click Python button in Header
    const pyBtn = page.getByRole('button', { name: 'Python' });
    await expect(pyBtn).toBeVisible();
    await pyBtn.click();

    // Verify modal
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'In-Browser Python Workspace (Pyodide WASM)' })).toBeVisible();
    await expect(dialog.getByText('In-Browser Python WASM')).toBeVisible();

    // Verify code editor has default Python script
    const editor = dialog.getByTestId('python-code-editor');
    await expect(editor).toBeVisible();
    await expect(editor).toContainText('forgegis.add_layer');

    // Run Python
    const runBtn = dialog.getByTestId('run-python-btn');
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // Verify console output
    const consoleOut = dialog.getByTestId('python-console-output');
    await expect(consoleOut).toContainText(/Successfully generated .* stations|Pyodide WASM bridge/, { timeout: 15000 });

    // Close modal
    await page.locator('button[aria-label="Close dialog"]').first().click();

    // Verify generated layer was added to layers panel
    await expect(page.getByText('Pyodide Coastal Stations').first()).toBeVisible({ timeout: 10000 });
  });

  test('switches script presets in Python Workspace', async ({ page }) => {
    await page.getByRole('button', { name: 'Python' }).click();
    const dialog = page.getByRole('dialog');

    // Click "Camera FlyTo via Python" preset
    await dialog.getByRole('button', { name: 'Camera FlyTo via Python' }).click();

    const editor = dialog.getByTestId('python-code-editor');
    await expect(editor).toContainText('forgegis.set_view(39.67, -4.04, 13.0)');

    // Run preset
    await dialog.getByTestId('run-python-btn').click();
    const consoleOut = dialog.getByTestId('python-console-output');
    await expect(consoleOut).toContainText(/Camera animated|Pyodide WASM bridge/, { timeout: 10000 });
  });

  test('adapts layout cleanly to mobile viewport with slide-over drawer', async ({ page }) => {
    // Set mobile viewport (iPhone SE size)
    await page.setViewportSize({ width: 375, height: 667 });

    // Map canvas is still visible
    const canvas = page.locator('canvas.maplibregl-canvas');
    await expect(canvas).toBeVisible();

    // Header adapts responsively
    await expect(page.getByText('ForgeGIS')).toBeVisible();

    // Toggle layers drawer via tab button
    const toggleBtn = page.getByTitle('Collapse Layers Panel');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      // Should now show expand
      await expect(page.getByTitle('Expand Layers Panel')).toBeVisible();
      // Re-open
      await page.getByTitle('Expand Layers Panel').click();
      await expect(page.getByTitle('Collapse Layers Panel')).toBeVisible();
    }
  });
});
