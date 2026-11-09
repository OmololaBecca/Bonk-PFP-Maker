import { expect } from '@playwright/test';

export class PfpMakerPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Create Your PFP' });
    this.canvas = page.locator('canvas').first();
    this.gradientButton = page.getByRole('button', { name: 'Gradient', exact: true });
    this.previewButton = page.getByRole('button', { name: 'Preview' });
    this.previewTitle = page.getByText('Download your PFP');
    this.downloadButton = page.getByRole('button', { name: 'Download' });
    this.closePreviewButton = page.getByRole('button', { name: 'Close' }).filter({ visible: true });
  }

  async goto() {
    await this.page.goto('/pfp');
    await expect(this.heading).toBeVisible();
    await this.waitForCanvasToSettle();
  }

  communityButton(name) {
    return this.page.getByRole('button', { name: `Select ${name}`, exact: true });
  }

  sampleAvatarButton(number) {
    return this.page.getByRole('button', { name: `Select sample PFP ${number}` });
  }

  // The sticker thumbnails under the canvas add a sticker to the PFP.
  addStickerButton(name) {
    return this.page.getByRole('button', { name: `Edit ${name}`, exact: true });
  }

  // The eye-style toggle in the layer list shows or hides a sticker.
  layerToggle(name) {
    return this.page.getByRole('button', { name: `Toggle ${name}`, exact: true });
  }

  backgroundSwatch(name) {
    return this.page.getByRole('button', { name, exact: true });
  }

  async stickerImageSources() {
    return this.page
      .getByRole('button', { name: /^Edit / })
      .locator('img')
      .evaluateAll((images) => images.map((img) => img.getAttribute('src')));
  }

  async openPreview() {
    await this.previewButton.click();
    await expect(this.previewTitle).toBeVisible();
  }

  async downloadPfp() {
    await this.openPreview();
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadButton.click();
    return downloadPromise;
  }

  // A fingerprint of every pixel on the canvas. It changes whenever the PFP is redrawn.
  async canvasChecksum() {
    return this.canvas.evaluate((canvas) => {
      const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum = (sum + data[i] * ((i % 251) + 1)) % 2147483647;
      return sum;
    });
  }

  // [r, g, b, a] of one canvas pixel. The default (3, 3) is the background corner.
  async canvasPixel(x = 3, y = 3) {
    return this.canvas.evaluate(
      (canvas, [px, py]) => Array.from(canvas.getContext('2d').getImageData(px, py, 1, 1).data),
      [x, y],
    );
  }

  // Images load asynchronously, so wait until two readings in a row match.
  async waitForCanvasToSettle() {
    let previous;
    await expect
      .poll(
        async () => {
          const current = await this.canvasChecksum();
          const settled = current !== 0 && current === previous;
          previous = current;
          return settled;
        },
        { message: 'Canvas never finished drawing', intervals: [300], timeout: 15_000 },
      )
      .toBe(true);
  }

  async expectCanvasToChangeFrom(before) {
    await expect
      .poll(() => this.canvasChecksum(), { message: 'Canvas was not redrawn' })
      .not.toBe(before);
    await this.waitForCanvasToSettle();
  }
}
