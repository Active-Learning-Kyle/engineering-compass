import { toBlob } from 'html-to-image';

export function profileExportOptions(width: number, height: number, dpr = 1) {
  width = Math.ceil(width);
  height = Math.ceil(height);
  if (!(width > 0 && height > 0))
    throw new Error('The profile has no exportable dimensions.');
  // Bound high-DPI summary exports for mobile canvas memory limits.
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
    // Preserve the captured element's background. html-to-image applies this
    // option to the cloned element itself, not just the surrounding canvas.
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
  // A separate, fixed-width card prevents the phone's responsive layout and
  // crossfade timing from changing the downloaded artifact.
  const card = root.cloneNode(true) as HTMLElement;
  card.removeAttribute('id');
  card.classList.add('profile-export-card');
  card
    .querySelectorAll('[data-capture-exclude="true"]')
    .forEach((node) => node.remove());
  card.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  for (const element of [
    card,
    ...Array.from(card.querySelectorAll<HTMLElement>('*')),
  ]) {
    element.style.setProperty('animation', 'none', 'important');
    element.style.setProperty('transition', 'none', 'important');
  }
  const holder = document.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.inert = true;
  Object.assign(holder.style, {
    position: 'fixed',
    left: '-20000px',
    top: '0',
    width: '1200px',
    pointerEvents: 'none',
  });
  holder.appendChild(card);
  document.body.appendChild(holder);
  let blob: Blob | null;
  try {
    const portraits = Array.from(card.querySelectorAll('img'));
    if (!portraits.length) throw new Error('The profile portrait is missing.');
    await Promise.all(
      portraits.map(async (image) => {
        image.loading = 'eager';
        await image.decode();
        if (!image.naturalWidth)
          throw new Error('A profile illustration has not loaded.');
        // Embed a decoded still PNG, not a remotely fetched image or animated
        // element. Export stops on decode/canvas failure instead of saving blank art.
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not prepare the portrait.');
        context.drawImage(image, 0, 0);
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        image.src = canvas.toDataURL('image/png');
        image.style.setProperty('opacity', '1', 'important');
        image.style.setProperty('visibility', 'visible', 'important');
        await image.decode();
      }),
    );
    const bounds = card.getBoundingClientRect();
    const options = profileExportOptions(
      1200,
      Math.max(card.scrollHeight, bounds.height),
      1.5,
    );
    blob = await toBlob(card, {
      ...options,
      style: {
        ...options.style,
        backgroundColor: getComputedStyle(root).backgroundColor,
        overflow: 'hidden',
      },
    });
  } finally {
    holder.remove();
  }
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
