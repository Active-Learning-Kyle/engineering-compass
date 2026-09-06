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
  images: HTMLImageElement[],
  qrImage: HTMLImageElement | null,
  frameWidth: number,
  frameHeight: number,
  background: string,
  roleCode: string,
  roleName: string,
  roleLabel: string,
  qrCaption: string,
  accent: string,
) {
  if (!images.length) throw new Error('A profile illustration is missing.');
  for (const image of images) {
    image.loading = 'eager';
    if (!image.complete) await image.decode();
    if (!image.naturalWidth || !image.naturalHeight)
      throw new Error('A profile illustration has not loaded.');
  }
  if (qrImage && !qrImage.complete) await qrImage.decode();
  const scale = Math.min(
    1100 / Math.max(frameWidth, frameHeight),
    ...images.map((image) => image.naturalHeight / frameHeight),
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
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = accent || '#276347';
  context.fillRect(0, 0, canvas.width, Math.max(4, 7 * scale));
  context.fillStyle = 'rgba(255,255,255,.97)';
  context.beginPath();
  context.moveTo(-canvas.width * 0.1, canvas.height * 0.49);
  context.quadraticCurveTo(
    canvas.width * 0.48,
    canvas.height * 0.39,
    canvas.width * 1.1,
    canvas.height * 0.48,
  );
  context.lineTo(canvas.width * 1.1, canvas.height * 1.1);
  context.lineTo(-canvas.width * 0.1, canvas.height * 1.1);
  context.closePath();
  context.fill();
  context.textAlign = 'center';
  context.fillStyle = accent || '#276347';
  context.font = `800 ${11 * scale}px Arial, sans-serif`;
  context.fillText(roleLabel.toUpperCase(), canvas.width / 2, 34 * scale);
  let roleSize = 27 * scale;
  do {
    context.font = `800 ${roleSize}px Arial, sans-serif`;
    if (context.measureText(roleName).width <= canvas.width * 0.86) break;
    roleSize -= 1 * scale;
  } while (roleSize > 17 * scale);
  context.fillStyle = '#183326';
  context.fillText(roleName, canvas.width / 2, 67 * scale);
  context.fillStyle = accent || '#276347';
  context.font = `900 ${16 * scale}px Arial, sans-serif`;
  context.fillText(`(${roleCode})`, canvas.width / 2, 91 * scale);
  context.textAlign = 'left';
  const portraitTop = 102 * scale;
  const portraitBottom = 14 * scale;
  const portraitHeight = canvas.height - portraitTop - portraitBottom;
  const cellWidth = canvas.width / Math.min(images.length, 2);
  images.slice(0, 2).forEach((image, index) => {
    const drawX = index * cellWidth;
    context.save();
    if (images.length > 1 && index === 0) {
      const coverScale = Math.max(
        cellWidth / image.naturalWidth,
        portraitHeight / image.naturalHeight,
      );
      const sourceWidth = cellWidth / coverScale;
      const sourceHeight = portraitHeight / coverScale;
      const sourceX = (image.naturalWidth - sourceWidth) / 2;
      const sourceY = Math.max(0, (image.naturalHeight - sourceHeight) * 0.24);
      context.translate(drawX + cellWidth, 0);
      context.scale(-1, 1);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        portraitTop,
        cellWidth,
        portraitHeight,
      );
    } else if (images.length > 1) {
      const coverScale = Math.max(
        cellWidth / image.naturalWidth,
        portraitHeight / image.naturalHeight,
      );
      const sourceWidth = cellWidth / coverScale;
      const sourceHeight = portraitHeight / coverScale;
      const sourceX = (image.naturalWidth - sourceWidth) / 2;
      const sourceY = Math.max(0, (image.naturalHeight - sourceHeight) * 0.24);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        drawX,
        portraitTop,
        cellWidth,
        portraitHeight,
      );
    } else {
      const containScale = Math.min(
        cellWidth / image.naturalWidth,
        portraitHeight / image.naturalHeight,
      );
      const drawWidth = image.naturalWidth * containScale;
      const drawHeight = image.naturalHeight * containScale;
      context.drawImage(
        image,
        (cellWidth - drawWidth) / 2,
        portraitTop + (portraitHeight - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
    }
    context.restore();
  });
  if (images.length > 1) {
    context.fillStyle = 'rgba(18, 52, 33, 0.14)';
    context.fillRect(cellWidth, 0, 1, canvas.height);
  }
  if (qrImage?.naturalWidth && qrImage.naturalHeight) {
    const qrSize = Math.min(76 * scale, canvas.width * 0.2);
    const inset = 14 * scale;
    const boxWidth = qrSize + 12 * scale;
    const boxHeight = qrSize + 24 * scale;
    const boxX = inset;
    const boxY = canvas.height - inset - boxHeight;
    context.fillStyle = 'rgba(255, 255, 255, 0.94)';
    context.beginPath();
    context.roundRect(boxX, boxY, boxWidth, boxHeight, 12 * scale);
    context.fill();
    context.strokeStyle = accent || '#276347';
    context.lineWidth = Math.max(1, 2 * scale);
    context.stroke();
    context.drawImage(
      qrImage,
      boxX + 6 * scale,
      boxY + 6 * scale,
      qrSize,
      qrSize,
    );
    context.fillStyle = '#17351f';
    context.font = `800 ${7 * scale}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      qrCaption.toUpperCase(),
      boxX + boxWidth / 2,
      boxY + boxHeight - 9 * scale,
    );
    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';
  }
  return canvas.toDataURL('image/png');
}

export async function exportProfilePdf(root: HTMLElement, filename: string) {
  const { jsPDF } = await import('jspdf');
  await document.fonts.ready;
  const livePortraits = Array.from(
    root.querySelectorAll<HTMLImageElement>('[data-export-portrait]'),
  );
  const liveModeArt = root.querySelector<HTMLElement>('.mode-art');
  const roleCode =
    liveModeArt
      ?.querySelector<HTMLElement>('[data-export-role-code]')
      ?.textContent?.trim() ?? '';
  const roleName =
    liveModeArt
      ?.querySelector<HTMLElement>('[data-export-role-name]')
      ?.textContent?.trim() ?? '';
  const roleLabel =
    liveModeArt
      ?.querySelector<HTMLElement>('.mode-art-role-label')
      ?.textContent?.trim() ?? '';
  const liveQr =
    liveModeArt?.querySelector<HTMLImageElement>('.mode-art-qr img') ?? null;
  const qrCaption =
    liveModeArt
      ?.querySelector<HTMLElement>('.mode-art-qr span')
      ?.textContent?.trim() ?? '';
  const modeArtStyle = liveModeArt ? getComputedStyle(liveModeArt) : null;
  if (livePortraits.length < 1)
    throw new Error('The profile portraits are missing.');
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
  card.querySelector('.mode-art-identity')?.remove();
  card.querySelector('.mode-art-qr')?.remove();
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
      livePortraits,
      liveQr,
      portraitBox.width,
      portraitBox.height,
      getComputedStyle(root.querySelector<HTMLElement>('.mode-art')!)
        .backgroundColor,
      roleCode,
      roleName,
      roleLabel,
      qrCaption,
      modeArtStyle?.getPropertyValue('--mode-accent').trim() || '#276347',
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
