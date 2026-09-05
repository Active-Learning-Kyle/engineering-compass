export const roleShareSize = { width: 1080, height: 1350 } as const;

export type RoleShareCardData = {
  brand: string;
  code: string;
  role: string;
  competency: string;
  description: string;
  keywords: string;
  scope: string;
  disclaimer: string;
  imageUrl: string;
  logoUrl: string;
  accent: string;
  tint: string;
  siteUrl: string;
};

export type RoleShareOutcome = 'shared' | 'downloaded' | 'cancelled';

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.roundRect(x, y, width, height, safeRadius);
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const tokens = /\s/.test(text)
    ? text.trim().split(/\s+/).map((token) => `${token} `)
    : Array.from(text);
  const lines: string[] = [];
  let line = '';
  for (const token of tokens) {
    const candidate = `${line}${token}`;
    if (line && context.measureText(candidate.trimEnd()).width > maxWidth) {
      lines.push(line.trimEnd());
      line = token;
    } else {
      line = candidate;
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = Number.POSITIVE_INFINITY,
) {
  const lines = wrapText(context, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) =>
    context.fillText(line, x, y + lineHeight * index),
  );
  return y + lines.length * lineHeight;
}

function fitFont(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  preferredSize: number,
  minimumSize: number,
  family: string,
) {
  let size = preferredSize;
  do {
    context.font = `700 ${size}px ${family}`;
    if (wrapText(context, text, maxWidth).length <= 2) return size;
    size -= 2;
  } while (size >= minimumSize);
  return minimumSize;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${url}`));
    image.src = url;
  });
}

function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

export function roleShareFilename(code: string) {
  const safeCode = code
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `engineering-compass-${safeCode || 'role'}.png`;
}

export async function createRoleShareFile(data: RoleShareCardData) {
  await document.fonts.ready;
  const [portrait, logo] = await Promise.all([
    loadImage(data.imageUrl),
    loadImage(data.logoUrl),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = roleShareSize.width;
  canvas.height = roleShareSize.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the share card.');

  context.fillStyle = '#f4f8f2';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#123a24';
  roundedRect(context, 48, 48, 984, 1254, 44);
  context.fill();

  context.fillStyle = '#ffffff';
  roundedRect(context, 78, 565, 924, 650, 32);
  context.fill();

  context.drawImage(logo, 86, 88, 74, 74);
  context.fillStyle = '#edf5ee';
  context.font = '700 30px Arial, sans-serif';
  context.fillText(data.brand, 180, 136);

  context.fillStyle = data.accent;
  roundedRect(context, 86, 205, 250, 58, 29);
  context.fill();
  context.fillStyle = '#ffffff';
  context.font = '700 25px Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText(data.code, 211, 243);
  context.textAlign = 'left';

  context.fillStyle = '#d7f43c';
  const roleFont = fitFont(
    context,
    data.role,
    900,
    78,
    58,
    'Georgia, serif',
  );
  context.font = `700 ${roleFont}px Georgia, serif`;
  const roleBottom = drawWrappedText(
    context,
    data.role,
    86,
    350,
    900,
    roleFont * 1.04,
    2,
  );

  context.fillStyle = '#b9d0c0';
  context.font = '700 24px Arial, sans-serif';
  context.fillText(data.competency.toUpperCase(), 88, roleBottom + 22);
  context.fillStyle = '#ffffff';
  context.font = '400 29px Arial, sans-serif';
  drawWrappedText(
    context,
    data.description,
    88,
    roleBottom + 70,
    890,
    41,
    2,
  );

  context.save();
  roundedRect(context, 98, 585, 884, 610, 24);
  context.clip();
  context.fillStyle = data.tint;
  context.fillRect(98, 585, 884, 610);
  drawContainedImage(context, portrait, 128, 602, 824, 520);
  context.restore();

  context.fillStyle = '#173d28';
  context.font = '700 25px Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText(data.keywords, 540, 1160);
  context.textAlign = 'left';

  context.fillStyle = '#b9d0c0';
  context.font = '700 22px Arial, sans-serif';
  context.fillText(data.scope, 88, 1260);
  context.textAlign = 'right';
  context.fillText(data.siteUrl.replace(/^https?:\/\//, ''), 992, 1260);
  context.textAlign = 'left';

  context.fillStyle = '#698374';
  context.font = '400 17px Arial, sans-serif';
  drawWrappedText(context, data.disclaimer, 88, 1290, 904, 24, 2);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );
  if (!blob?.size) throw new Error('Could not create the share card.');
  return new File([blob], roleShareFilename(data.code), { type: 'image/png' });
}

export function downloadRoleShareFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function shareRoleFile(
  file: File,
  title: string,
  text: string,
): Promise<RoleShareOutcome> {
  const shareData: ShareData = { title, text, files: [file] };
  if (
    navigator.share &&
    (!navigator.canShare || navigator.canShare({ files: [file] }))
  ) {
    try {
      await navigator.share(shareData);
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError')
        return 'cancelled';
    }
  }
  downloadRoleShareFile(file);
  return 'downloaded';
}
