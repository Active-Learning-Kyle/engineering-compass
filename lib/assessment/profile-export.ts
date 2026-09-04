import { toBlob } from 'html-to-image';

export function profileExportOptions(width: number, height: number, dpr = 1) {
  width = Math.ceil(width);
  height = Math.ceil(height);
  if (!(width > 0 && height > 0))
    throw new Error('The profile has no exportable dimensions.');
  // Bound long Pro exports by total pixels as well as maximum canvas dimension.
  const pixelRatio = Math.min(
    2,
    Math.max(1, dpr),
    Math.sqrt(12_000_000 / (width * height)),
    16000 / width,
    16000 / height,
  );
  return {
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio,
    backgroundColor: '#f7faf6',
    style: {
      // Computed auto margins become used pixel values when cloned. In a
      // foreignObject those shift the entire report right and clip its edge.
      margin: '0',
      marginInline: '0',
      marginBlock: '0',
      marginLeft: '0',
      marginRight: '0',
      marginTop: '0',
      marginBottom: '0',
      position: 'relative',
      left: '0',
      top: '0',
      inset: 'auto',
      transform: 'none',
      translate: 'none',
      maxWidth: 'none',
      maxHeight: 'none',
      boxSizing: 'border-box',
      overflow: 'visible',
    },
  };
}

export async function exportProfileImage(root: HTMLElement, filename: string) {
  await document.fonts.ready;
  const includedImages = Array.from(root.querySelectorAll('img')).filter(
    (image) => image.dataset.captureExclude !== 'true',
  );
  await Promise.all(
    includedImages.map(async (image) => {
      await image.decode();
      if (!image.naturalWidth)
        throw new Error('A profile illustration has not loaded.');
    }),
  );
  const bounds = root.getBoundingClientRect();
  const options = profileExportOptions(
    Math.max(root.scrollWidth, bounds.width),
    Math.max(root.scrollHeight, bounds.height),
    window.devicePixelRatio,
  );
  const blob = await toBlob(root, {
    ...options,
    filter: (node) =>
      !(node instanceof HTMLElement && node.dataset.captureExclude === 'true'),
  });
  if (!blob || !blob.size)
    throw new Error('The browser could not create the profile image.');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Leave enough time for mobile browsers to pick up the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
