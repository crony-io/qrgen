export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ModuleShape = 'square' | 'dot' | 'rounded' | 'diamond';
export type CornerSquareStyle = 'square' | 'rounded' | 'dot';
export type CornerDotStyle = 'square' | 'dot' | 'diamond';

export type GradientType = 'linear' | 'radial';

export interface GradientOptions {
  enabled: boolean;
  type: GradientType;
  angle: number;
  stops: Array<{ offset: number; color: string }>;
}

export interface LogoOptions {
  enabled: boolean;
  src: string;
  sizeRatio: number;
  padding: number;
  shape: 'square' | 'circle';
  backgroundColor: string;
}

export interface QRStyleOptions {
  moduleShape: ModuleShape;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
}

export type MarkerCorner = 'topLeft' | 'topRight' | 'bottomLeft';

export interface MarkerCornerColors {
  border: string;
  center: string;
}

export interface MarkerColorOptions {
  enabled: boolean;
  border: string;
  center: string;
  perCornerEnabled: boolean;
  corners: Record<MarkerCorner, MarkerCornerColors>;
}

export interface QRColorOptions {
  foreground: string;
  background: string;
  transparentBackground: boolean;
  foregroundGradient: GradientOptions;
  backgroundGradient: GradientOptions;
  markers: MarkerColorOptions;
}

export interface QROptions {
  size: number;
  margin: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  colors: QRColorOptions;
  style: QRStyleOptions;
  logo: LogoOptions;
}

export const DEFAULT_GRADIENT: GradientOptions = {
  enabled: false,
  type: 'linear',
  angle: 0,
  stops: [
    { offset: 0, color: '#000000' },
    { offset: 1, color: '#000000' },
  ],
};

export const DEFAULT_LOGO: LogoOptions = {
  enabled: false,
  src: '',
  sizeRatio: 0.25,
  padding: 4,
  shape: 'square',
  backgroundColor: '#FFFFFF',
};

export const DEFAULT_STYLE: QRStyleOptions = {
  moduleShape: 'square',
  cornerSquareStyle: 'square',
  cornerDotStyle: 'square',
};

export const DEFAULT_MARKER_COLORS: MarkerColorOptions = {
  enabled: false,
  border: '#000000',
  center: '#000000',
  perCornerEnabled: false,
  corners: {
    topLeft: { border: '#000000', center: '#000000' },
    topRight: { border: '#000000', center: '#000000' },
    bottomLeft: { border: '#000000', center: '#000000' },
  },
};

export const DEFAULT_COLORS: QRColorOptions = {
  foreground: '#000000',
  background: '#FFFFFF',
  transparentBackground: false,
  foregroundGradient: { ...DEFAULT_GRADIENT },
  backgroundGradient: { ...DEFAULT_GRADIENT },
  markers: { ...DEFAULT_MARKER_COLORS },
};

export const DEFAULT_QR_OPTIONS: QROptions = {
  size: 256,
  margin: 2,
  errorCorrectionLevel: 'M',
  colors: { ...DEFAULT_COLORS },
  style: { ...DEFAULT_STYLE },
  logo: { ...DEFAULT_LOGO },
};

export function createDefaultQROptions(): QROptions {
  return {
    size: DEFAULT_QR_OPTIONS.size,
    margin: DEFAULT_QR_OPTIONS.margin,
    errorCorrectionLevel: DEFAULT_QR_OPTIONS.errorCorrectionLevel,
    colors: {
      foreground: DEFAULT_COLORS.foreground,
      background: DEFAULT_COLORS.background,
      transparentBackground: DEFAULT_COLORS.transparentBackground,
      foregroundGradient: { ...DEFAULT_GRADIENT, stops: [...DEFAULT_GRADIENT.stops] },
      backgroundGradient: { ...DEFAULT_GRADIENT, stops: [...DEFAULT_GRADIENT.stops] },
      markers: {
        enabled: DEFAULT_MARKER_COLORS.enabled,
        border: DEFAULT_MARKER_COLORS.border,
        center: DEFAULT_MARKER_COLORS.center,
        perCornerEnabled: DEFAULT_MARKER_COLORS.perCornerEnabled,
        corners: {
          topLeft: { ...DEFAULT_MARKER_COLORS.corners.topLeft },
          topRight: { ...DEFAULT_MARKER_COLORS.corners.topRight },
          bottomLeft: { ...DEFAULT_MARKER_COLORS.corners.bottomLeft },
        },
      },
    },
    style: { ...DEFAULT_STYLE },
    logo: { ...DEFAULT_LOGO },
  };
}

export function getRecommendedECC(hasLogo: boolean): ErrorCorrectionLevel {
  return hasLogo ? 'H' : 'M';
}
