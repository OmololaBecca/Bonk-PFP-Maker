import { test, expect } from '@playwright/test';
import { PfpMakerPage } from '../pages/PfpMakerPage.js';
import { readPng } from '../utils/images.js';

// Bugs found by this suite. Each test describes the CORRECT behaviour and is marked
// test.fail(), so the run stays green while the bug exists. When a bug is fixed, its
// test "unexpectedly passes" and the run goes red: a reminder to move it into the
// regular suite.
test.describe('Known issues', () => {
  let editor;

  test.beforeEach(async ({ page }) => {
    editor = new PfpMakerPage(page);
    await editor.goto();
  });

  test.fail(
    'download is 1024x1024 as promised on the home page',
    {
      annotation: {
        type: 'bug',
        description: 'Export is 320x320. The "High-res Export" card on the home page promises 1024x1024.',
      },
    },
    async () => {
      const download = await editor.downloadPfp();
      const png = await readPng(await download.path());
      expect(png.width).toBe(1024);
      expect(png.height).toBe(1024);
    },
  );

  test.fail(
    'SSX community loads its own sticker pack',
    {
      annotation: {
        type: 'bug',
        description: 'The home page lists 3 SSX stickers, but the editor shows the Bonk sticker files for SSX.',
      },
    },
    async () => {
      await editor.communityButton('SSX').click();
      await expect
        .poll(async () => (await editor.stickerImageSources()).some((src) => /ssx/i.test(src)), {
          timeout: 5_000,
        })
        .toBe(true);
    },
  );

  test.fail(
    'preview popup is exposed to screen readers as a dialog',
    {
      annotation: {
        type: 'accessibility',
        description: 'The preview popup has no role="dialog", so screen readers do not announce it.',
      },
    },
    async ({ page }) => {
      await editor.openPreview();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3_000 });
    },
  );
});
