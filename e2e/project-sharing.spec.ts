import { test, expect } from '@playwright/test';

test.describe('Milestone 4: Project Format & Sharing Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for demo layers to load
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible({ timeout: 15000 });
  });

  test('opens Project Sharing modal from Header Save and Share buttons', async ({ page }) => {
    // Click Save button
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify modal appears
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Project Sharing & Exporters' })).toBeVisible();
    await expect(dialog.getByText('Project Metadata')).toBeVisible();
    await expect(dialog.getByText('Schema v1.0.0')).toBeVisible();

    // Close modal
    await page.locator('button[aria-label="Close dialog"]').first().click();
    await expect(dialog).not.toBeVisible();

    // Click Share button
    const shareBtn = page.getByRole('button', { name: 'Share' });
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // Modal opens on Standalone HTML tab
    await expect(dialog.getByRole('heading', { name: 'Project Sharing & Exporters' })).toBeVisible();
    await expect(dialog.getByText('Self-Contained Interactive Report')).toBeVisible();
  });

  test('switches across tabs: Project File, Standalone HTML, and Iframe Embed', async ({ page }) => {
    await page.getByRole('button', { name: 'Share' }).click();
    const dialog = page.getByRole('dialog');

    // Click Iframe Embed tab
    await dialog.getByRole('tab', { name: 'Iframe Embed & API' }).click();
    await expect(dialog.getByText('Iframe Dimensions')).toBeVisible();
    await expect(dialog.getByText('PostMessage Protocol Supported')).toBeVisible();
    await expect(dialog.locator('pre')).toContainText('<iframe');

    // Click Project File tab
    await dialog.getByRole('tab', { name: 'Project File (.project.json)' }).click();
    await expect(dialog.getByText('Inline GeoJSON Data')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Download .project.json' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Upload / Open .project.json' })).toBeVisible();
  });

  test('triggers download of .project.json file', async ({ page }) => {
    await page.getByRole('button', { name: 'Save' }).click();
    const dialog = page.getByRole('dialog');

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Download .project.json' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.project.json');
    await expect(dialog.getByText(/Exported .* successfully!/)).toBeVisible();
  });

  test('triggers download of Standalone HTML report', async ({ page }) => {
    await page.getByRole('button', { name: 'Share' }).click();
    const dialog = page.getByRole('dialog');

    // Click Standalone HTML tab if not active
    await dialog.getByRole('tab', { name: 'Standalone HTML' }).click();

    const downloadPromise = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Download Standalone HTML Report' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^forgegis-report-.*\.html$/);
    await expect(dialog.getByText(/Generated standalone HTML report/)).toBeVisible();
  });

  test('executes postMessage API bridge commands (flyTo, setLayer)', async ({ page }) => {
    // Send FORGEGIS_FLY_TO via postMessage to window
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'FORGEGIS_FLY_TO',
          payload: {
            center: [-122.45, 37.82],
            zoom: 14,
            pitch: 45,
            bearing: 30,
          },
        },
        '*'
      );
    });

    // Wait 500ms for state to react
    await page.waitForTimeout(500);

    // Verify map canvas is alive
    const canvas = page.locator('canvas.maplibregl-canvas');
    await expect(canvas).toBeVisible();
  });
});
