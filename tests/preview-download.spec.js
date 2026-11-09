import { test, expect } from '@playwright/test';
import { PfpMakerPage } from '../pages/PfpMakerPage.js';
import { BACKGROUND_COLOURS, colourDistance, pixelFromPng, readPng } from '../utils/images.js';

test.describe('Preview and download', () => {
  let editor;

  test.beforeEach(async ({ page }) => {
    editor = new PfpMakerPage(page);
    await editor.goto();
  });

  test('preview shows the finished PFP with a Download button', async () => {
    await editor.openPreview();
    await expect(editor.downloadButton).toBeVisible();
  });

  test('closing the preview returns to the editor', async () => {
    await editor.openPreview();
    await editor.closePreviewButton.click();
    await expect(editor.previewTitle).toBeHidden();
    await expect(editor.previewButton).toBeVisible();
  });

  test('download saves a valid square PNG named pfp.png', async () => {
    const download = await editor.downloadPfp();
    expect(download.suggestedFilename()).toBe('pfp.png');

    const png = await readPng(await download.path());
    expect(png.isPng).toBe(true);
    expect(png.width).toBeGreaterThan(0);
    expect(png.width).toBe(png.height);
  });

  test('downloaded PFP keeps the background the user picked', async ({ page }) => {
    const navy = BACKGROUND_COLOURS['Bonk Navy'];
    await editor.backgroundSwatch('Bonk Navy').click();
    await expect
      .poll(async () => colourDistance(await editor.canvasPixel(), navy))
      .toBeLessThanOrEqual(4);

    const download = await editor.downloadPfp();
    const png = await readPng(await download.path());
    const corner = await pixelFromPng(page, png.bytes, 2, 2);
    expect(colourDistance(corner, navy)).toBeLessThanOrEqual(4);
  });
});
