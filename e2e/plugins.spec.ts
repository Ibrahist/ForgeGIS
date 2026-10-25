import { test, expect } from '@playwright/test';

test.describe('Milestone 5: Modular Plugin System Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial demo layers to load
    await expect(page.getByText('SF Bay Marine Sensor Buoys').first()).toBeVisible({ timeout: 15000 });
  });

  test('opens Plugin Ecosystem modal and displays all 3 production plugins', async ({ page }) => {
    const pluginsBtn = page.getByRole('button', { name: 'Plugins' });
    await expect(pluginsBtn).toBeVisible();
    await pluginsBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Plugin Ecosystem & Extensions' })).toBeVisible();
    await expect(dialog.getByText('Capability Sandboxing')).toBeVisible();

    // Verify 3 plugins
    await expect(dialog.getByText('Time Series Temporal Slider')).toBeVisible();
    await expect(dialog.getByText('Planetary Basemaps & Terrestrial Night')).toBeVisible();
    await expect(dialog.getByText('3D Globe Atmosphere & Solar Terminator')).toBeVisible();

    // Verify permission tags
    await expect(dialog.getByText('layers:read').first()).toBeVisible();
    await expect(dialog.getByText('map:view').first()).toBeVisible();
  });

  test('enables Time Series Slider and interacts with floating playback widget', async ({ page }) => {
    // Open plugins modal
    await page.getByRole('button', { name: 'Plugins' }).click();
    const dialog = page.getByRole('dialog');

    // Click Enable on time-slider
    const timeSliderToggle = dialog.getByTestId('plugin-toggle-time-slider');
    await expect(timeSliderToggle).toBeVisible();
    await timeSliderToggle.click();

    // Verify active status
    await expect(timeSliderToggle).toHaveText('Enabled');

    // Close modal
    await page.locator('button[aria-label="Close dialog"]').first().click();

    // Verify TimeSliderWidget is rendered and floating
    const widget = page.getByTestId('time-slider-widget');
    await expect(widget).toBeVisible();
    await expect(widget.getByText(/UTC/)).toBeVisible();

    // Click Play button
    const playBtn = page.getByTestId('time-slider-play-btn');
    await expect(playBtn).toBeVisible();
    await playBtn.click();

    // Verify status changes to live
    await expect(widget.getByText('Live Telemetry')).toBeVisible();

    // Scrubber interaction
    const scrubber = page.getByTestId('time-slider-scrubber');
    await scrubber.fill('75');
    await expect(widget.getByText('75%')).toBeVisible();

    // Click Pause
    await playBtn.click();
    await expect(widget.getByText('Paused')).toBeVisible();
  });

  test('enables Globe Atmosphere plugin and verifies Solar Terminator layer', async ({ page }) => {
    await page.getByRole('button', { name: 'Plugins' }).click();
    const dialog = page.getByRole('dialog');

    const atmosphereToggle = dialog.getByTestId('plugin-toggle-globe-atmosphere');
    await atmosphereToggle.click();
    await expect(atmosphereToggle).toHaveText('Enabled');

    // Close modal
    await page.locator('button[aria-label="Close dialog"]').first().click();

    // Verify Solar Terminator layer appears in Layers Panel
    await expect(page.getByText('Solar Day/Night Terminator').first()).toBeVisible({ timeout: 10000 });
  });

  test('enables Planetary Basemaps plugin and activates 3D Globe', async ({ page }) => {
    await page.getByRole('button', { name: 'Plugins' }).click();
    const dialog = page.getByRole('dialog');

    const planetaryToggle = dialog.getByTestId('plugin-toggle-planetary-basemaps');
    await planetaryToggle.click();
    await expect(planetaryToggle).toHaveText('Enabled');

    await page.locator('button[aria-label="Close dialog"]').first().click();

    // Verify Map Canvas remains healthy and responsive
    const canvas = page.locator('canvas.maplibregl-canvas');
    await expect(canvas).toBeVisible();
  });
});
