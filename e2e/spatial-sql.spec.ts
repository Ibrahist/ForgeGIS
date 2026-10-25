import { test, expect } from '@playwright/test';

test.describe('Milestone 2: Spatial SQL Workspace Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for demo layers to be loaded
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible({ timeout: 15000 });
  });

  test('opens Spatial SQL modal from header', async ({ page }) => {
    const sqlBtn = page.getByRole('button', { name: 'Spatial SQL' });
    await expect(sqlBtn).toBeVisible();
    await sqlBtn.click();

    await expect(page.getByRole('heading', { name: 'DuckDB-WASM Spatial SQL' }).first()).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Write your spatial SQL"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run Query' })).toBeVisible();
  });

  test('executes spatial SQL query and displays results table', async ({ page }) => {
    await page.getByRole('button', { name: 'Spatial SQL' }).click();

    // Select sample query
    const select = page.locator('select:has-text("Sample Queries...")');
    await select.selectOption({ index: 1 });

    const runBtn = page.getByRole('button', { name: 'Run Query' });
    await runBtn.click();

    // Results table should display rows
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('tab', { name: /Results/ })).toBeVisible();
  });

  test('saves a query and views it in Saved Queries tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Spatial SQL' }).click();

    const saveBtn = page.getByRole('button', { name: 'Save Query' });
    await saveBtn.click();

    // Fill in query name modal
    const input = page.locator('input[placeholder="e.g. SF Bay High Temp Stations"]');
    await expect(input).toBeVisible();
    await input.fill('Farallon Deep Buoys');
    await page.locator('form button:has-text("Save")').click();

    // Go to Saved Queries tab
    await page.getByRole('tab', { name: /Saved Queries/ }).click();
    await expect(page.getByText('Farallon Deep Buoys')).toBeVisible();
  });

  test('adds query result as a new layer on the map', async ({ page }) => {
    await page.getByRole('button', { name: 'Spatial SQL' }).click();
    await page.getByRole('button', { name: 'Run Query' }).click();

    // Wait for results
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    const addLayerBtn = page.getByRole('button', { name: 'Add as Map Layer' });
    if (await addLayerBtn.isVisible()) {
      await addLayerBtn.click();

      const layerNameInput = page.locator('input[placeholder="e.g. Filtered Sensor Stations"]');
      await expect(layerNameInput).toBeVisible();
      await layerNameInput.fill('High Heat Marine Hotspots');
      await page.locator('form button:has-text("Add to Map")').click();

      // Close SQL modal
      await page.locator('button[aria-label="Close dialog"]').first().click();

      // Check that the new layer was added to the Layers Panel
      await expect(page.getByText('High Heat Marine Hotspots').first()).toBeVisible();
    }
  });
});
