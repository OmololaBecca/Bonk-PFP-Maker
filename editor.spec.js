import { test, expect } from '@playwright/test';
import { PfpMakerPage } from '../pages/PfpMakerPage.js';
import { BACKGROUND_COLOURS, colourDistance } from '../utils/images.js';

test.describe('PFP editor', () => {
  let editor;

  test.beforeEach(async ({ page }) => {
    editor = new PfpMakerPage(page);
    await editor.goto();
  });

  test('shows the three communities and three sample avatars', async () => {
    for (const name of ['Bonk', 'USD', 'SSX']) {
      await expect(editor.communityButton(name)).toBeVisible();
    }
    for (const number of [1, 2, 3]) {
      await expect(editor.sampleAvatarButton(number)).toBeVisible();
    }
  });

  test('picking a sample avatar redraws the canvas', async () => {
    const before = await editor.canvasChecksum();
    await editor.sampleAvatarButton(2).click();
    await editor.expectCanvasToChangeFrom(before);
  });

  test('adding a sticker draws it on the canvas', async () => {
    const before = await editor.canvasChecksum();
    await editor.addStickerButton('Glasses').click();
    await editor.expectCanvasToChangeFrom(before);
    await expect(editor.addStickerButton('Glasses')).not.toHaveClass(/grayscale/);
  });

  test('hiding a sticker layer removes it from the canvas', async () => {
    const original = await editor.canvasChecksum();
    await editor.addStickerButton('Glasses').click();
    await editor.expectCanvasToChangeFrom(original);

    await editor.layerToggle('Glasses').click();
    await expect.poll(() => editor.canvasChecksum()).toBe(original);
  });

  for (const [name, rgb] of Object.entries(BACKGROUND_COLOURS)) {
    test(`solid background "${name}" fills the canvas`, async () => {
      await editor.backgroundSwatch(name).click();
      await expect
        .poll(async () => colourDistance(await editor.canvasPixel(), rgb))
        .toBeLessThanOrEqual(4);
    });
  }

  test('gradient mode offers gradient backgrounds that repaint the canvas', async () => {
    await editor.gradientButton.click();
    await expect(editor.backgroundSwatch('Bonk Dark Gradient')).toBeVisible();
    await editor.waitForCanvasToSettle();

    const before = await editor.canvasChecksum();
    await editor.backgroundSwatch('Bonk Dark Gradient').click();
    await editor.expectCanvasToChangeFrom(before);
  });

  test('switching to USD loads the USD sticker pack', async () => {
    await editor.communityButton('USD').click();
    await expect(editor.addStickerButton('USD Stacked')).toBeVisible();
    await expect(editor.addStickerButton('USD Packed')).toBeVisible();
  });
});
