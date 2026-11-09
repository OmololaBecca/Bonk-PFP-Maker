import fs from 'node:fs/promises';

const PNG_SIGNATURE = '89504e470d0a1a0a';

// Hex values taken from the swatch buttons in the editor.
export const BACKGROUND_COLOURS = {
  'Bonk Orange': [255, 92, 1],
  'Bonk Yellow': [255, 211, 2],
  'Bonk Navy': [43, 54, 73],
  'Bonk Black': [0, 2, 5],
  'Bonk White': [253, 255, 247],
};

// Largest difference on any RGB channel. Small gaps come from browser colour handling.
export function colourDistance(actual, expected) {
  return Math.max(...expected.map((value, i) => Math.abs(actual[i] - value)));
}

// Reads the PNG header: the 8-byte signature, then width and height from the IHDR chunk.
export async function readPng(filePath) {
  const bytes = await fs.readFile(filePath);
  return {
    bytes,
    isPng: bytes.subarray(0, 8).toString('hex') === PNG_SIGNATURE,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

// Decodes the PNG in the browser and returns [r, g, b, a] of one pixel.
export async function pixelFromPng(page, bytes, x, y) {
  const dataUrl = `data:image/png;base64,${bytes.toString('base64')}`;
  return page.evaluate(
    async ({ src, px, py }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return Array.from(ctx.getImageData(px, py, 1, 1).data);
    },
    { src: dataUrl, px: x, py: y },
  );
}
