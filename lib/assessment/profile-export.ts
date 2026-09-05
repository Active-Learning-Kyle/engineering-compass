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

export function pdfPageBreaks(
  height: number,
  pageHeight: number,
  blocks: Array<{ top: number; bottom: number }>,
) {
  if (
    !Number.isFinite(height) ||
    !Number.isFinite(pageHeight) ||
    height < 0 ||
    pageHeight <= 0
  )
    throw new Error('Invalid PDF page size.');
  const breaks = [0];
  while (breaks[breaks.length - 1] < height) {
    const start = breaks[breaks.length - 1];
    let end = Math.min(start + pageHeight, height);
    for (const block of [...blocks].sort((a, b) => b.top - a.top)) {
      if (
        block.top > start &&
        block.top < end &&
        block.bottom > end &&
        block.bottom - block.top <= pageHeight
      )
        end = block.top;
    }
    breaks.push(end);
  }
  return breaks;
}

export function visiblePortraitVariant(secondOpacity: number) {
  return Number.isFinite(secondOpacity) && secondOpacity >= 0.5
    ? 'second'
    : 'first';
}

export function portraitCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  frameWidth: number,
  frameHeight: number,
  positionX = 0.5,
  positionY = 0.24,
) {
  if (
    ![sourceWidth, sourceHeight, frameWidth, frameHeight].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  )
    throw new Error('Invalid portrait dimensions.');
  const coverScale = Math.max(
    frameWidth / sourceWidth,
    frameHeight / sourceHeight,
  );
  const width = frameWidth / coverScale;
  const height = frameHeight / coverScale;
  return {
    left: (sourceWidth - width) * positionX,
    top: (sourceHeight - height) * positionY,
    width,
    height,
  };
}

export function pdfPortraitPlacement(
  box: { left: number; top: number; width: number; height: number },
  pageStart: number,
  pdfScale: number,
  margin = 20,
) {
  return {
    x: margin + box.left * pdfScale,
    y: margin + (box.top - pageStart) * pdfScale,
    width: box.width * pdfScale,
    height: box.height * pdfScale,
  };
}

async function rasterizePortrait(
  image: HTMLImageElement,
  frameWidth: number,
  frameHeight: number,
) {
  image.loading = 'eager';
  if (!image.complete) await image.decode();
  if (!image.naturalWidth || !image.naturalHeight)
    throw new Error('A profile illustration has not loaded.');
  const scale = Math.min(
    1100 / Math.max(frameWidth, frameHeight),
    image.naturalWidth / frameWidth,
    image.naturalHeight / frameHeight,
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(frameWidth * scale));
  canvas.height = Math.max(1, Math.round(frameHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the portrait.');
  // Match the card's right-side rounded corners. Transparency lets the captured
  // card border and page background remain visible underneath the PDF overlay.
  const radius = Math.min(32 * scale, canvas.width / 2, canvas.height / 2);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(canvas.width - radius, 0);
  context.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
  context.lineTo(canvas.width, canvas.height - radius);
  context.quadraticCurveTo(
    canvas.width,
    canvas.height,
    canvas.width - radius,
    canvas.height,
  );
  context.lineTo(0, canvas.height);
  context.closePath();
  context.clip();
  const containScale = Math.min(
    canvas.width / image.naturalWidth,
    canvas.height / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * containScale;
  const drawHeight = image.naturalHeight * containScale;
  context.drawImage(
    image,
    (canvas.width - drawWidth) / 2,
    (canvas.height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
  return canvas.toDataURL('image/png');
}

export async function exportProfilePdf(root: HTMLElement, filename: string) {
  const { jsPDF } = await import('jspdf');
  await document.fonts.ready;
  const livePortraits = Array.from(
    root.querySelectorAll<HTMLImageElement>('[data-export-portrait]'),
  );
  if (livePortraits.length < 1)
    throw new Error('The profile portraits are missing.');
  const selectedIndex =
    livePortraits.length > 1 &&
    visiblePortraitVariant(
      Number.parseFloat(getComputedStyle(livePortraits[1]).opacity),
    ) === 'second'
      ? 1
      : 0;
  // A separate, fixed-width report prevents the phone's responsive layout and
  // crossfade timing from changing the downloaded artifact.
  const card = root.cloneNode(true) as HTMLElement;
  card.removeAttribute('id');
  card.classList.add('profile-pdf-document');
  const clonedPortraits = Array.from(
    card.querySelectorAll<HTMLImageElement>('[data-export-portrait]'),
  );
  // Safari intermittently omits <img> nodes rendered through the SVG
  // foreignObject used by html-to-image. Capture the card without either
  // portrait and add the selected raster directly to the PDF instead.
  clonedPortraits.forEach((image) => image.remove());
  card
    .querySelectorAll('[data-capture-exclude="true"]')
    .forEach((node) => node.remove());
  card.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  card
    .querySelectorAll<SVGSVGElement>('svg.recharts-surface')
    .forEach((svg) => {
      const width = Number(svg.getAttribute('width'));
      const height = Number(svg.getAttribute('height'));
      if (width && height) {
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', '500');
        svg.setAttribute('height', '500');
        Object.assign(svg.style, {
          width: '100%',
          height: 'auto',
          display: 'block',
        });
        const chart = svg.closest('[data-chart]');
        if (chart) {
          chart.querySelector('.recharts-responsive-container')?.remove();
          chart.appendChild(svg);
        }
      }
    });
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
  let blob: Blob;
  try {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
    const width = 1200;
    const printWidth = pdf.internal.pageSize.getWidth() - 40;
    const pdfScale = printWidth / width;
    const pageHeight = Math.floor(
      ((pdf.internal.pageSize.getHeight() - 60) * width) / printWidth,
    );
    const bounds = card.getBoundingClientRect();
    const modeArt = card.querySelector<HTMLElement>('.mode-art');
    if (!modeArt) throw new Error('The profile portrait frame is missing.');
    const modeArtBounds = modeArt.getBoundingClientRect();
    const portraitBox = {
      left: modeArtBounds.left - bounds.left,
      top: modeArtBounds.top - bounds.top,
      width: modeArtBounds.width,
      height: modeArtBounds.height,
    };
    const selectedPortrait = await rasterizePortrait(
      livePortraits[selectedIndex],
      portraitBox.width,
      portraitBox.height,
    );
    const blocks = Array.from(
      card.querySelectorAll(
        'article, .mode-hero, .toolkit-result-card, .growth-row, .insight-tile, p, h2, h3, svg',
      ),
    ).map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        top: Math.max(0, Math.floor(rect.top - bounds.top)),
        bottom: Math.ceil(rect.bottom - bounds.top),
      };
    });
    // Keep each section heading with its first content row, even for sections
    // too long to keep together on a single page.
    card.querySelectorAll('article').forEach((section) => {
      const first = section.querySelector(
        '.insight-tile, .toolkit-result-card, .growth-row',
      );
      if (first)
        blocks.push({
          top: Math.floor(section.getBoundingClientRect().top - bounds.top),
          bottom: Math.ceil(first.getBoundingClientRect().bottom - bounds.top),
        });
    });
    const breaks = pdfPageBreaks(
      Math.ceil(card.scrollHeight),
      pageHeight,
      blocks,
    );
    const viewport = document.createElement('div');
    Object.assign(viewport.style, {
      width: '1200px',
      overflow: 'hidden',
      backgroundColor: '#f6f9f3',
      position: 'relative',
    });
    holder.appendChild(viewport);
    viewport.appendChild(card);
    for (let i = 0; i < breaks.length - 1; i++) {
      const height = breaks[i + 1] - breaks[i];
      viewport.style.height = `${height}px`;
      card.style.transform = `translateY(-${breaks[i]}px)`;
      const page = await toBlob(viewport, {
        ...profileExportOptions(width, height, 1.5),
        style: {
          ...profileExportOptions(width, height).style,
          overflow: 'hidden',
        },
      });
      if (!page?.size) throw new Error('Could not render a PDF page.');
      if (i) pdf.addPage();
      pdf.addImage(
        new Uint8Array(await page.arrayBuffer()),
        'PNG',
        20,
        20,
        printWidth,
        (height * printWidth) / width,
      );
      const portraitBottom = portraitBox.top + portraitBox.height;
      if (portraitBottom > breaks[i] && portraitBox.top < breaks[i + 1]) {
        const placement = pdfPortraitPlacement(
          portraitBox,
          breaks[i],
          pdfScale,
        );
        pdf.addImage(
          selectedPortrait,
          'PNG',
          placement.x,
          placement.y,
          placement.width,
          placement.height,
        );
      }
      pdf.setFontSize(9);
      pdf.setTextColor(80, 105, 89);
      pdf.text(
        `Engineering Compass  |  ${i + 1} / ${breaks.length - 1}`,
        20,
        pdf.internal.pageSize.getHeight() - 16,
      );
    }
    blob = pdf.output('blob');
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
