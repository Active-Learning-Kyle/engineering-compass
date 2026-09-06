import { drawVisiblePortrait } from './portrait-layout';

export const roleShareSize = { width: 1080, height: 1350 } as const;

export type RoleShareCardData = {
  brand: string;
  roleLabel: string;
  code: string;
  role: string;
  competency: string;
  description: string;
  keywords: string;
  scope: string;
  disclaimer: string;
  imageUrls: string[];
  logoUrl: string;
  qrUrl: string;
  qrCaption: string;
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
    ? text
        .trim()
        .split(/\s+/)
        .map((token) => `${token} `)
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
    if (context.measureText(text).width <= maxWidth) return size;
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

function drawPortraitGroup(
  context: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (images.length === 1) {
    drawVisiblePortrait(context, images[0], x, y, width, height, {
      occupancy: 0.88,
      verticalBias: 0.48,
    });
    return;
  }
  const cellWidth = width / 2;
  drawVisiblePortrait(context, images[0], x, y, cellWidth, height, {
    flip: true,
    occupancy: 0.94,
  });
  drawVisiblePortrait(context, images[1], x + cellWidth, y, cellWidth, height, {
    occupancy: 0.94,
  });
  context.fillStyle = 'rgba(18, 52, 33, 0.14)';
  context.fillRect(x + cellWidth, y, 1, height);
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
  const [portraits, logo, qr] = await Promise.all([
    Promise.all(data.imageUrls.slice(0, 2).map(loadImage)),
    loadImage(data.logoUrl),
    loadImage(data.qrUrl),
  ]);
  if (!portraits.length) throw new Error('The role illustration is missing.');
  const canvas = document.createElement('canvas');
  canvas.width = roleShareSize.width;
  canvas.height = roleShareSize.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the share card.');

  context.fillStyle = '#eef4ef';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#ffffff';
  roundedRect(context, 40, 30, 1000, 1290, 44);
  context.fill();
  context.save();
  roundedRect(context, 40, 30, 1000, 1290, 44);
  context.clip();
  context.fillStyle = data.accent;
  context.fillRect(40, 30, 1000, 14);
  context.restore();

  context.fillStyle = '#f8faf8';
  roundedRect(context, 76, 156, 928, 744, 32);
  context.fill();

  context.drawImage(logo, 78, 66, 62, 62);
  context.fillStyle = '#173d28';
  context.font = '700 28px Arial, sans-serif';
  context.fillText(data.brand, 158, 108);

  context.save();
  roundedRect(context, 90, 170, 900, 716, 24);
  context.clip();
  context.fillStyle = data.tint;
  context.fillRect(90, 170, 900, 716);
  context.fillStyle = 'rgba(255,255,255,.98)';
  context.beginPath();
  context.ellipse(530, 690, 610, 300, -0.035, Math.PI, Math.PI * 2);
  context.lineTo(1140, 930);
  context.lineTo(-80, 930);
  context.closePath();
  context.fill();

  context.fillStyle = data.accent;
  context.font = '800 18px Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText(data.roleLabel.toUpperCase(), 540, 228);
  context.fillStyle = '#183326';
  const roleFont = fitFont(
    context,
    data.role,
    770,
    52,
    38,
    'Arial, sans-serif',
  );
  context.font = `800 ${roleFont}px Arial, sans-serif`;
  context.fillText(data.role, 540, 288);
  context.fillStyle = data.accent;
  context.font = '900 28px Arial, sans-serif';
  context.fillText(`(${data.code})`, 540, 330);
  context.textAlign = 'left';

  drawPortraitGroup(context, portraits, 150, 322, 780, 520);
  context.restore();

  context.fillStyle = '#ffffff';
  roundedRect(context, 108, 718, 138, 155, 18);
  context.fill();
  context.strokeStyle = data.accent;
  context.lineWidth = 2;
  context.stroke();
  context.drawImage(qr, 119, 729, 116, 116);
  context.fillStyle = '#173d28';
  context.font = '800 12px Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText(data.qrCaption.toUpperCase(), 177, 862);
  context.textAlign = 'left';

  context.fillStyle = data.accent;
  context.font = '800 19px Arial, sans-serif';
  context.fillText(data.competency.toUpperCase(), 86, 950);
  context.fillStyle = '#173d28';
  context.font = '700 24px Arial, sans-serif';
  context.fillText(data.keywords, 86, 994);
  context.fillStyle = '#4f6758';
  context.font = '400 26px Arial, sans-serif';
  drawWrappedText(context, data.description, 86, 1045, 908, 37, 3);

  context.fillStyle = '#173d28';
  context.font = '700 19px Arial, sans-serif';
  context.fillText(data.scope, 86, 1187);
  context.fillStyle = '#64796c';
  context.font = '600 17px Arial, sans-serif';
  context.textAlign = 'right';
  context.fillText(data.siteUrl.replace(/^https?:\/\//, ''), 994, 1187);
  context.textAlign = 'left';

  context.fillStyle = '#72857a';
  context.font = '400 16px Arial, sans-serif';
  drawWrappedText(context, data.disclaimer, 86, 1237, 908, 22, 2);

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
