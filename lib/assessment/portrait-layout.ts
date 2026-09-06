export type PortraitSourceRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const FULL_IMAGE_FALLBACK = (image: HTMLImageElement): PortraitSourceRect => ({
  left: 0,
  top: 0,
  width: image.naturalWidth,
  height: image.naturalHeight,
});

/**
 * Finds the visible artwork inside a transparent role PNG. Generated portraits
 * intentionally use a square canvas, but their transparent margins vary. Using
 * the alpha bounds keeps the perceived character size consistent across cards.
 */
export function visiblePortraitBounds(
  image: HTMLImageElement,
  alphaThreshold = 8,
): PortraitSourceRect {
  if (!image.naturalWidth || !image.naturalHeight)
    return FULL_IMAGE_FALLBACK(image);

  const sampleLimit = 320;
  const sampleScale = Math.min(
    1,
    sampleLimit / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const sampleWidth = Math.max(1, Math.round(image.naturalWidth * sampleScale));
  const sampleHeight = Math.max(
    1,
    Math.round(image.naturalHeight * sampleScale),
  );
  const canvas = document.createElement('canvas');
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return FULL_IMAGE_FALLBACK(image);

  try {
    context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
    const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
    let minX = sampleWidth;
    let minY = sampleHeight;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < sampleHeight; y += 1) {
      for (let x = 0; x < sampleWidth; x += 1) {
        if (pixels[(y * sampleWidth + x) * 4 + 3] <= alphaThreshold) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    if (maxX < minX || maxY < minY) return FULL_IMAGE_FALLBACK(image);

    const inverseScale = 1 / sampleScale;
    const rawLeft = minX * inverseScale;
    const rawTop = minY * inverseScale;
    const rawWidth = (maxX - minX + 1) * inverseScale;
    const rawHeight = (maxY - minY + 1) * inverseScale;
    const padding = Math.max(rawWidth, rawHeight) * 0.025;
    const left = Math.max(0, rawLeft - padding);
    const top = Math.max(0, rawTop - padding);
    const right = Math.min(image.naturalWidth, rawLeft + rawWidth + padding);
    const bottom = Math.min(image.naturalHeight, rawTop + rawHeight + padding);
    return { left, top, width: right - left, height: bottom - top };
  } catch {
    // Cross-origin images without canvas permission still receive a safe layout.
    return FULL_IMAGE_FALLBACK(image);
  }
}

export function drawVisiblePortrait(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { flip?: boolean; occupancy?: number; verticalBias?: number } = {},
) {
  const source = visiblePortraitBounds(image);
  const occupancy = Math.min(1, Math.max(0.5, options.occupancy ?? 0.9));
  const scale = Math.min(
    (width * occupancy) / source.width,
    (height * occupancy) / source.height,
  );
  const drawWidth = source.width * scale;
  const drawHeight = source.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const verticalBias = Math.min(1, Math.max(0, options.verticalBias ?? 0.52));
  const drawY = y + (height - drawHeight) * verticalBias;

  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  if (options.flip) {
    context.translate(drawX + drawWidth, 0);
    context.scale(-1, 1);
    context.drawImage(
      image,
      source.left,
      source.top,
      source.width,
      source.height,
      0,
      drawY,
      drawWidth,
      drawHeight,
    );
  } else {
    context.drawImage(
      image,
      source.left,
      source.top,
      source.width,
      source.height,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
    );
  }
  context.restore();
}
