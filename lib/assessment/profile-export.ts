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

async function rasterizePortrait(image: HTMLImageElement) {
  image.loading = 'eager';
  if (!image.complete) await image.decode();
  if (!image.naturalWidth || !image.naturalHeight)
    throw new Error('A profile illustration has not loaded.');
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = Math.min(1, 1400 / longestSide);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the portrait.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  // JPEG is substantially smaller than a canvas PNG on memory-constrained
  // mobile browsers, while remaining more than large enough for the PDF.
  return canvas.toDataURL('image/jpeg', 0.9);
}

export async function exportProfilePdf(root: HTMLElement, filename: string) {
  const { jsPDF } = await import('jspdf');
  await document.fonts.ready;
  const livePortraits = Array.from(
    root.querySelectorAll<HTMLImageElement>('[data-export-portrait]'),
  );
  if (livePortraits.length !== 2)
    throw new Error('The profile portraits are missing.');
  const visibleVariant = visiblePortraitVariant(
    Number.parseFloat(getComputedStyle(livePortraits[1]).opacity),
  );
  const selectedIndex = visibleVariant === 'second' ? 1 : 0;
  const selectedPortrait = await rasterizePortrait(
    livePortraits[selectedIndex],
  );
  // A separate, fixed-width report prevents the phone's responsive layout and
  // crossfade timing from changing the downloaded artifact.
  const card = root.cloneNode(true) as HTMLElement;
  card.removeAttribute('id');
  card.classList.add('profile-pdf-document');
  const clonedPortraits = Array.from(
    card.querySelectorAll<HTMLImageElement>('[data-export-portrait]'),
  );
  clonedPortraits.forEach((image, index) => {
    if (index !== selectedIndex) {
      image.remove();
      return;
    }
    image.src = selectedPortrait;
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
    image.removeAttribute('data-export-portrait');
    image.className = 'result-character-exported';
    image.style.setProperty('opacity', '1', 'important');
    image.style.setProperty('visibility', 'visible', 'important');
  });
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
    const portrait = card.querySelector<HTMLImageElement>(
      '.result-character-exported',
    );
    if (!portrait) throw new Error('The profile portrait is missing.');
    await portrait.decode();
    const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
    const width = 1200;
    const printWidth = pdf.internal.pageSize.getWidth() - 40;
    const pageHeight = Math.floor(
      ((pdf.internal.pageSize.getHeight() - 60) * width) / printWidth,
    );
    const bounds = card.getBoundingClientRect();
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
