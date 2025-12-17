import QRCode from 'qrcode';
import type {
  QROptions,
  GradientOptions,
  ModuleShape,
  CornerSquareStyle,
  CornerDotStyle,
} from '../types/qrOptions';

const FINDER_PATTERN_SIZE = 7;
const FINDER_OUTER_SIZE = 7;
const FINDER_INNER_SIZE = 3;

function getFinderPatternPositions(size: number): Array<[number, number]> {
  return [
    [0, 0],
    [size - FINDER_PATTERN_SIZE, 0],
    [0, size - FINDER_PATTERN_SIZE],
  ];
}

function isInFinderPattern(row: number, col: number, size: number): boolean {
  const positions = getFinderPatternPositions(size);
  for (const [x, y] of positions) {
    if (row >= y && row < y + FINDER_PATTERN_SIZE && col >= x && col < x + FINDER_PATTERN_SIZE) {
      return true;
    }
  }
  return false;
}

function createGradient(
  ctx: CanvasRenderingContext2D,
  options: GradientOptions,
  width: number,
  height: number,
): CanvasGradient {
  let gradient: CanvasGradient;

  if (options.type === 'radial') {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(width, height) / 2;
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  } else {
    const angleRad = (options.angle * Math.PI) / 180;
    const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;
    const x2 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y2 = height / 2 + (Math.sin(angleRad) * height) / 2;
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  }

  for (const stop of options.stops) {
    gradient.addColorStop(stop.offset, stop.color);
  }

  return gradient;
}

function getFillStyle(
  ctx: CanvasRenderingContext2D,
  color: string,
  gradient: GradientOptions,
  width: number,
  height: number,
): string | CanvasGradient {
  if (gradient.enabled && gradient.stops.length >= 2) {
    return createGradient(ctx, gradient, width, height);
  }
  return color;
}

function drawSquareModule(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.fillRect(x, y, size, size);
}

function drawDotModule(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const radius = size / 2;
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoundedModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number = size * 0.3,
): void {
  const r = Math.min(radius, size / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + r);
  ctx.lineTo(x + size, y + size - r);
  ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
  ctx.lineTo(x + r, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawDiamondModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const half = size / 2;
  ctx.beginPath();
  ctx.moveTo(x + half, y);
  ctx.lineTo(x + size, y + half);
  ctx.lineTo(x + half, y + size);
  ctx.lineTo(x, y + half);
  ctx.closePath();
  ctx.fill();
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: ModuleShape,
): void {
  switch (shape) {
    case 'dot':
      drawDotModule(ctx, x, y, size);
      break;
    case 'rounded':
      drawRoundedModule(ctx, x, y, size);
      break;
    case 'diamond':
      drawDiamondModule(ctx, x, y, size);
      break;
    case 'square':
    default:
      drawSquareModule(ctx, x, y, size);
      break;
  }
}

function drawCornerSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number,
  style: CornerSquareStyle,
): void {
  const outerSize = FINDER_OUTER_SIZE * moduleSize;
  const innerSize = FINDER_INNER_SIZE * moduleSize;

  ctx.save();

  switch (style) {
    case 'dot': {
      const outerRadius = outerSize / 2;
      const innerRadius = innerSize / 2 + moduleSize;

      ctx.beginPath();
      ctx.arc(x + outerRadius, y + outerRadius, outerRadius, 0, Math.PI * 2);
      ctx.arc(x + outerRadius, y + outerRadius, innerRadius, 0, Math.PI * 2, true);
      ctx.fill();
      break;
    }
    case 'rounded': {
      const borderRadius = moduleSize * 1.5;
      const innerBorderRadius = moduleSize;

      ctx.beginPath();
      ctx.roundRect(x, y, outerSize, outerSize, borderRadius);
      ctx.roundRect(
        x + moduleSize,
        y + moduleSize,
        outerSize - 2 * moduleSize,
        outerSize - 2 * moduleSize,
        innerBorderRadius,
      );
      ctx.fill('evenodd');
      break;
    }
    case 'square':
    default: {
      ctx.beginPath();
      ctx.rect(x, y, outerSize, outerSize);
      ctx.rect(
        x + moduleSize,
        y + moduleSize,
        outerSize - 2 * moduleSize,
        outerSize - 2 * moduleSize,
      );
      ctx.fill('evenodd');
      break;
    }
  }

  ctx.restore();
}

function drawCornerDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number,
  style: CornerDotStyle,
): void {
  const innerOffset = 2 * moduleSize;
  const innerSize = FINDER_INNER_SIZE * moduleSize;

  switch (style) {
    case 'dot': {
      const radius = innerSize / 2;
      ctx.beginPath();
      ctx.arc(x + innerOffset + radius, y + innerOffset + radius, radius, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'diamond': {
      drawDiamondModule(ctx, x + innerOffset, y + innerOffset, innerSize);
      break;
    }
    case 'square':
    default: {
      ctx.fillRect(x + innerOffset, y + innerOffset, innerSize, innerSize);
      break;
    }
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasSize: number,
  options: QROptions['logo'],
): void {
  const logoSize = canvasSize * options.sizeRatio;
  const logoX = (canvasSize - logoSize) / 2;
  const logoY = (canvasSize - logoSize) / 2;
  const padding = options.padding;
  const bgSize = logoSize + padding * 2;
  const bgX = logoX - padding;
  const bgY = logoY - padding;

  ctx.save();

  if (options.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, bgSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = options.backgroundColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
  } else {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(bgX, bgY, bgSize, bgSize);
  }

  ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
  ctx.restore();
}

function formatSvgNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(3).replace(/\.?0+$/, '');
}

function svgCirclePath(cx: number, cy: number, r: number): string {
  const cxs = formatSvgNumber(cx);
  const rs = formatSvgNumber(r);
  return `M ${cxs} ${formatSvgNumber(cy - r)} A ${rs} ${rs} 0 1 1 ${cxs} ${formatSvgNumber(
    cy + r,
  )} A ${rs} ${rs} 0 1 1 ${cxs} ${formatSvgNumber(cy - r)} Z`;
}

function svgRectPath(x: number, y: number, w: number, h: number): string {
  const xs = formatSvgNumber(x);
  const ys = formatSvgNumber(y);
  const xe = formatSvgNumber(x + w);
  const ye = formatSvgNumber(y + h);
  return `M ${xs} ${ys} H ${xe} V ${ye} H ${xs} Z`;
}

function svgRoundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  const xs = formatSvgNumber(x);
  const ys = formatSvgNumber(y);
  const xe = formatSvgNumber(x + w);
  const ye = formatSvgNumber(y + h);
  const rs = formatSvgNumber(rr);
  return [
    `M ${formatSvgNumber(x + rr)} ${ys}`,
    `H ${formatSvgNumber(x + w - rr)}`,
    `A ${rs} ${rs} 0 0 1 ${xe} ${formatSvgNumber(y + rr)}`,
    `V ${formatSvgNumber(y + h - rr)}`,
    `A ${rs} ${rs} 0 0 1 ${formatSvgNumber(x + w - rr)} ${ye}`,
    `H ${formatSvgNumber(x + rr)}`,
    `A ${rs} ${rs} 0 0 1 ${xs} ${formatSvgNumber(y + h - rr)}`,
    `V ${formatSvgNumber(y + rr)}`,
    `A ${rs} ${rs} 0 0 1 ${formatSvgNumber(x + rr)} ${ys}`,
    'Z',
  ].join(' ');
}

function svgDiamondPath(x: number, y: number, size: number): string {
  const half = size / 2;
  return `M ${formatSvgNumber(x + half)} ${formatSvgNumber(y)} L ${formatSvgNumber(
    x + size,
  )} ${formatSvgNumber(y + half)} L ${formatSvgNumber(x + half)} ${formatSvgNumber(
    y + size,
  )} L ${formatSvgNumber(x)} ${formatSvgNumber(y + half)} Z`;
}

function svgGradientDef(id: string, gradient: GradientOptions, width: number, height: number): string {
  const stops = gradient.stops
    .map((stop) => {
      const offset = `${Math.max(0, Math.min(1, stop.offset)) * 100}%`;
      return `<stop offset="${offset}" stop-color="${stop.color}" />`;
    })
    .join('');

  if (gradient.type === 'radial') {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(width, height) / 2;
    return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${formatSvgNumber(
      cx,
    )}" cy="${formatSvgNumber(cy)}" r="${formatSvgNumber(r)}">${stops}</radialGradient>`;
  }

  const angleRad = (gradient.angle * Math.PI) / 180;
  const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
  const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;
  const x2 = width / 2 + (Math.cos(angleRad) * width) / 2;
  const y2 = height / 2 + (Math.sin(angleRad) * height) / 2;

  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${formatSvgNumber(
    x1,
  )}" y1="${formatSvgNumber(y1)}" x2="${formatSvgNumber(x2)}" y2="${formatSvgNumber(
    y2,
  )}">${stops}</linearGradient>`;
}

function getSvgFillStyle(
  color: string,
  gradient: GradientOptions,
  width: number,
  height: number,
  defs: string[],
  id: string,
): string {
  if (gradient.enabled && gradient.stops.length >= 2) {
    defs.push(svgGradientDef(id, gradient, width, height));
    return `url(#${id})`;
  }
  return color;
}

function drawModuleSvg(x: number, y: number, size: number, shape: ModuleShape, fill: string): string {
  switch (shape) {
    case 'dot': {
      const r = size / 2;
      return `<circle cx="${formatSvgNumber(x + r)}" cy="${formatSvgNumber(
        y + r,
      )}" r="${formatSvgNumber(r)}" fill="${fill}" />`;
    }
    case 'rounded': {
      const r = Math.min(size * 0.3, size / 2);
      return `<rect x="${formatSvgNumber(x)}" y="${formatSvgNumber(y)}" width="${formatSvgNumber(
        size,
      )}" height="${formatSvgNumber(size)}" rx="${formatSvgNumber(r)}" ry="${formatSvgNumber(
        r,
      )}" fill="${fill}" />`;
    }
    case 'diamond': {
      return `<path d="${svgDiamondPath(x, y, size)}" fill="${fill}" />`;
    }
    case 'square':
    default: {
      return `<rect x="${formatSvgNumber(x)}" y="${formatSvgNumber(y)}" width="${formatSvgNumber(
        size,
      )}" height="${formatSvgNumber(size)}" fill="${fill}" />`;
    }
  }
}

function drawCornerSquareSvg(
  x: number,
  y: number,
  moduleSize: number,
  style: CornerSquareStyle,
  fill: string,
): string {
  const outerSize = FINDER_OUTER_SIZE * moduleSize;
  const innerSize = FINDER_INNER_SIZE * moduleSize;

  switch (style) {
    case 'dot': {
      const outerRadius = outerSize / 2;
      const innerRadius = innerSize / 2 + moduleSize;
      const cx = x + outerRadius;
      const cy = y + outerRadius;
      return `<path fill-rule="evenodd" d="${svgCirclePath(cx, cy, outerRadius)} ${svgCirclePath(
        cx,
        cy,
        innerRadius,
      )}" fill="${fill}" />`;
    }
    case 'rounded': {
      const borderRadius = moduleSize * 1.5;
      const innerBorderRadius = moduleSize;
      const outer = svgRoundedRectPath(x, y, outerSize, outerSize, borderRadius);
      const inner = svgRoundedRectPath(
        x + moduleSize,
        y + moduleSize,
        outerSize - 2 * moduleSize,
        outerSize - 2 * moduleSize,
        innerBorderRadius,
      );
      return `<path fill-rule="evenodd" d="${outer} ${inner}" fill="${fill}" />`;
    }
    case 'square':
    default: {
      const outer = svgRectPath(x, y, outerSize, outerSize);
      const inner = svgRectPath(
        x + moduleSize,
        y + moduleSize,
        outerSize - 2 * moduleSize,
        outerSize - 2 * moduleSize,
      );
      return `<path fill-rule="evenodd" d="${outer} ${inner}" fill="${fill}" />`;
    }
  }
}

function drawCornerDotSvg(
  x: number,
  y: number,
  moduleSize: number,
  style: CornerDotStyle,
  fill: string,
): string {
  const innerOffset = 2 * moduleSize;
  const innerSize = FINDER_INNER_SIZE * moduleSize;

  switch (style) {
    case 'dot': {
      const r = innerSize / 2;
      return `<circle cx="${formatSvgNumber(x + innerOffset + r)}" cy="${formatSvgNumber(
        y + innerOffset + r,
      )}" r="${formatSvgNumber(r)}" fill="${fill}" />`;
    }
    case 'diamond': {
      return `<path d="${svgDiamondPath(x + innerOffset, y + innerOffset, innerSize)}" fill="${fill}" />`;
    }
    case 'square':
    default: {
      return `<rect x="${formatSvgNumber(x + innerOffset)}" y="${formatSvgNumber(
        y + innerOffset,
      )}" width="${formatSvgNumber(innerSize)}" height="${formatSvgNumber(
        innerSize,
      )}" fill="${fill}" />`;
    }
  }
}

export async function renderQRToSVGString(text: string, options: QROptions): Promise<string> {
  const qrData = QRCode.create(text, {
    errorCorrectionLevel: options.logo.enabled ? 'H' : options.errorCorrectionLevel,
    margin: 0,
  });

  const moduleCount = qrData.modules.size;
  const canvasSize = Math.max(1, Math.round(options.size));
  const margin = Math.max(0, Math.round(options.margin));
  const availableSize = Math.max(0, canvasSize - margin * 2);

  const flooredModuleSize = Math.floor(availableSize / moduleCount);
  const moduleSize = flooredModuleSize >= 1 ? flooredModuleSize : availableSize / moduleCount;

  const qrPixelSize = moduleCount * moduleSize;
  const extraPadding = canvasSize - (qrPixelSize + margin * 2);
  const offset = margin + (extraPadding > 0 ? Math.floor(extraPadding / 2) : 0);

  const defs: string[] = [];
  const nodes: string[] = [];

  const fgFill = getSvgFillStyle(
    options.colors.foreground,
    options.colors.foregroundGradient,
    canvasSize,
    canvasSize,
    defs,
    'qrgen-fg-gradient',
  );

  if (!options.colors.transparentBackground) {
    const bgFill = getSvgFillStyle(
      options.colors.background,
      options.colors.backgroundGradient,
      canvasSize,
      canvasSize,
      defs,
      'qrgen-bg-gradient',
    );
    nodes.push(
      `<rect x="0" y="0" width="${formatSvgNumber(canvasSize)}" height="${formatSvgNumber(
        canvasSize,
      )}" fill="${bgFill}" />`,
    );
  }

  const finderPositions = getFinderPatternPositions(moduleCount);

  for (const [fx, fy] of finderPositions) {
    const pixelX = fx * moduleSize + offset;
    const pixelY = fy * moduleSize + offset;

    const cornerKey: 'topLeft' | 'topRight' | 'bottomLeft' =
      fx === 0 && fy === 0 ? 'topLeft' : fy === 0 ? 'topRight' : 'bottomLeft';

    const markers = options.colors.markers;
    const markerBorderColor =
      markers.enabled && markers.perCornerEnabled
        ? markers.corners[cornerKey].border
        : markers.enabled
          ? markers.border
          : fgFill;

    const markerCenterColor =
      markers.enabled && markers.perCornerEnabled
        ? markers.corners[cornerKey].center
        : markers.enabled
          ? markers.center
          : fgFill;

    nodes.push(
      drawCornerSquareSvg(pixelX, pixelY, moduleSize, options.style.cornerSquareStyle, markerBorderColor),
    );
    nodes.push(
      drawCornerDotSvg(pixelX, pixelY, moduleSize, options.style.cornerDotStyle, markerCenterColor),
    );
  }

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isInFinderPattern(row, col, moduleCount)) {
        continue;
      }

      const isDark = qrData.modules.data[row * moduleCount + col];
      if (!isDark) {
        continue;
      }

      const x = col * moduleSize + offset;
      const y = row * moduleSize + offset;

      nodes.push(drawModuleSvg(x, y, moduleSize, options.style.moduleShape, fgFill));
    }
  }

  if (options.logo.enabled && options.logo.src) {
    const logoSize = canvasSize * options.logo.sizeRatio;
    const logoX = (canvasSize - logoSize) / 2;
    const logoY = (canvasSize - logoSize) / 2;
    const padding = options.logo.padding;
    const bgSize = logoSize + padding * 2;
    const bgX = logoX - padding;
    const bgY = logoY - padding;

    if (options.logo.shape === 'circle') {
      const clipId = 'qrgen-logo-clip';
      defs.push(
        `<clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><circle cx="${formatSvgNumber(
          canvasSize / 2,
        )}" cy="${formatSvgNumber(canvasSize / 2)}" r="${formatSvgNumber(
          logoSize / 2,
        )}" /></clipPath>`,
      );

      nodes.push(
        `<circle cx="${formatSvgNumber(canvasSize / 2)}" cy="${formatSvgNumber(
          canvasSize / 2,
        )}" r="${formatSvgNumber(bgSize / 2)}" fill="${options.logo.backgroundColor}" />`,
      );
      nodes.push(
        `<image href="${options.logo.src}" x="${formatSvgNumber(logoX)}" y="${formatSvgNumber(
          logoY,
        )}" width="${formatSvgNumber(logoSize)}" height="${formatSvgNumber(
          logoSize,
        )}" clip-path="url(#${clipId})" preserveAspectRatio="none" />`,
      );
    } else {
      nodes.push(
        `<rect x="${formatSvgNumber(bgX)}" y="${formatSvgNumber(bgY)}" width="${formatSvgNumber(
          bgSize,
        )}" height="${formatSvgNumber(bgSize)}" fill="${options.logo.backgroundColor}" />`,
      );
      nodes.push(
        `<image href="${options.logo.src}" x="${formatSvgNumber(logoX)}" y="${formatSvgNumber(
          logoY,
        )}" width="${formatSvgNumber(logoSize)}" height="${formatSvgNumber(
          logoSize,
        )}" preserveAspectRatio="none" />`,
      );
    }
  }

  const defsBlock = defs.length ? `<defs>${defs.join('')}</defs>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${formatSvgNumber(
      canvasSize,
    )}" height="${formatSvgNumber(canvasSize)}" viewBox="0 0 ${formatSvgNumber(
      canvasSize,
    )} ${formatSvgNumber(canvasSize)}">${defsBlock}${nodes.join('')}</svg>`;
}

export async function renderQRToCanvas(
  text: string,
  options: QROptions,
): Promise<HTMLCanvasElement> {
  const qrData = QRCode.create(text, {
    errorCorrectionLevel: options.logo.enabled ? 'H' : options.errorCorrectionLevel,
    margin: 0,
  });

  const moduleCount = qrData.modules.size;
  const canvasSize = Math.max(1, Math.round(options.size));
  const margin = Math.max(0, Math.round(options.margin));
  const availableSize = Math.max(0, canvasSize - margin * 2);

  const flooredModuleSize = Math.floor(availableSize / moduleCount);
  const moduleSize = flooredModuleSize >= 1 ? flooredModuleSize : availableSize / moduleCount;

  const qrPixelSize = moduleCount * moduleSize;
  const extraPadding = canvasSize - (qrPixelSize + margin * 2);
  const offset = margin + (extraPadding > 0 ? Math.floor(extraPadding / 2) : 0);

  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  if (!options.colors.transparentBackground) {
    const bgFill = getFillStyle(
      ctx,
      options.colors.background,
      options.colors.backgroundGradient,
      canvasSize,
      canvasSize,
    );
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }

  const fgFill = getFillStyle(
    ctx,
    options.colors.foreground,
    options.colors.foregroundGradient,
    canvasSize,
    canvasSize,
  );
  ctx.fillStyle = fgFill;

  const finderPositions = getFinderPatternPositions(moduleCount);

  for (const [fx, fy] of finderPositions) {
    const pixelX = fx * moduleSize + offset;
    const pixelY = fy * moduleSize + offset;

    const cornerKey = fx === 0 && fy === 0 ? 'topLeft' : fy === 0 ? 'topRight' : 'bottomLeft';
    const markers = options.colors.markers;
    const markerBorderColor =
      markers.enabled && markers.perCornerEnabled
        ? markers.corners[cornerKey].border
        : markers.enabled
          ? markers.border
          : fgFill;
    const markerCenterColor =
      markers.enabled && markers.perCornerEnabled
        ? markers.corners[cornerKey].center
        : markers.enabled
          ? markers.center
          : fgFill;

    ctx.fillStyle = markerBorderColor;
    drawCornerSquare(ctx, pixelX, pixelY, moduleSize, options.style.cornerSquareStyle);
    ctx.fillStyle = markerCenterColor;
    drawCornerDot(ctx, pixelX, pixelY, moduleSize, options.style.cornerDotStyle);
  }

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isInFinderPattern(row, col, moduleCount)) {
        continue;
      }

      const isDark = qrData.modules.data[row * moduleCount + col];
      if (!isDark) {
        continue;
      }

      const x = col * moduleSize + offset;
      const y = row * moduleSize + offset;

      ctx.fillStyle = fgFill;
      drawModule(ctx, x, y, moduleSize, options.style.moduleShape);
    }
  }

  if (options.logo.enabled && options.logo.src) {
    try {
      const logoImg = await loadImage(options.logo.src);
      drawLogo(ctx, logoImg, canvasSize, options.logo);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to load logo image:', error);
      }
    }
  }

  return canvas;
}

export async function renderQRToDataURL(
  text: string,
  options: QROptions,
  type: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/svg+xml' = 'image/png',
  quality?: number,
): Promise<string> {
  if (type === 'image/svg+xml') {
    const svg = await renderQRToSVGString(text, options);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  const effectiveOptions =
    type === 'image/jpeg' && options.colors.transparentBackground
      ? {
          ...options,
          colors: {
            ...options.colors,
            transparentBackground: false,
          },
        }
      : options;

  const canvas = await renderQRToCanvas(text, effectiveOptions);
  return canvas.toDataURL(type, quality);
}

export async function renderQRToBlob(
  text: string,
  options: QROptions,
  type: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/svg+xml' = 'image/png',
  quality?: number,
): Promise<Blob> {
  if (type === 'image/svg+xml') {
    const svg = await renderQRToSVGString(text, options);
    return new Blob([svg], { type: 'image/svg+xml' });
  }

  const effectiveOptions =
    type === 'image/jpeg' && options.colors.transparentBackground
      ? {
          ...options,
          colors: {
            ...options.colors,
            transparentBackground: false,
          },
        }
      : options;

  const canvas = await renderQRToCanvas(text, effectiveOptions);

  if (!canvas.toBlob) {
    const dataUrl = canvas.toDataURL(type, quality);
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      type,
      quality,
    );
  });
}
