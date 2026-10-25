import { test, expect } from '@playwright/test';

test.describe('Milestone 3: In-Browser Geoprocessing Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for demo layers to be loaded
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible({ timeout: 15000 });
  });

  test('opens Geoprocessing Toolbox and displays 17 tools', async ({ page }) => {
    const toolboxBtn = page.getByRole('button', { name: 'Toolbox' });
    await expect(toolboxBtn).toBeVisible();
    await toolboxBtn.click();

    await expect(page.getByRole('heading', { name: 'Geoprocessing Toolbox' }).first()).toBeVisible();
    await expect(page.getByText('17 WASM Tools')).toBeVisible();

    // Verify categories
    await expect(page.getByRole('button', { name: 'Vector (10)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Terrain (3)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Conversion (3)' })).toBeVisible();
  });

  test('filters tools by search query', async ({ page }) => {
    await page.getByRole('button', { name: 'Toolbox' }).click();

    const searchInput = page.locator('input[placeholder="Search tools..."]');
    await searchInput.fill('buffer');

    await expect(page.getByText('Buffer Geometry')).toBeVisible();
    await expect(page.getByText('Convex Hull')).not.toBeVisible();
  });

  test('opens tool parameter form and runs geoprocessing algorithm', async ({ page }) => {
    await page.getByRole('button', { name: 'Toolbox' }).click();
    await page.getByText('Buffer Geometry').click();

    // Parameter form
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Buffer Geometry' }).first()).toBeVisible();
    await expect(dialog.getByText(/Input Layer/)).toBeVisible();
    await expect(dialog.getByText('Resolution Steps')).toBeVisible();

    // Execute tool
    const runBtn = page.getByRole('button', { name: 'Execute Tool' });
    await runBtn.click();

    // Output success notification
    await expect(page.getByText(/Success! Created layer "Buffer Geometry Result"/)).toBeVisible({ timeout: 10000 });

    // Close toolbox
    await page.locator('button[aria-label="Close dialog"]').first().click();

    // Verify result layer added to map & layers panel
    await expect(page.getByText('Buffer Geometry Result').first()).toBeVisible();
  });

  test('supports deep-linking via URL query params ?tool=vector-convex-hull', async ({ page }) => {
    // Open app directly with deep link
    await page.goto('/?tool=vector-convex-hull');

    // Wait for demo layers and verify toolbox automatically opened
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Convex Hull' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Execute Tool' })).toBeVisible();
  });
});
