declare module 'qrcode' {
  export type QRCodeErrorCorrectionLevel =
    | 'L'
    | 'M'
    | 'Q'
    | 'H'
    | 'low'
    | 'medium'
    | 'quartile'
    | 'high';

  export interface QRCodeOptions {
    version?: number;
    errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
    margin?: number;
  }

  export interface QRCodeToDataURLOptions extends QRCodeOptions {
    width?: number;
    height?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    type?: 'image/png' | 'image/jpeg' | 'image/webp';
  }

  export interface QRCodeModules {
    size: number;
    data: Uint8Array;
  }

  export interface QRCode {
    modules: QRCodeModules;
    version: number;
    errorCorrectionLevel: { bit: number };
    maskPattern: number;
    segments: Array<{ mode: { id: string }; data: string }>;
  }

  export function create(text: string, options?: QRCodeOptions): QRCode;
  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: QRCodeToDataURLOptions,
  ): Promise<void>;
}
