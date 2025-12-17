import { ref, readonly } from 'vue';
import { formatQRData } from '../utils/qrFormatters';
import { renderQRToDataURL } from '../utils/qrRenderer';
import type { AllQRData } from '../types/qr';
import type { QROptions } from '../types/qrOptions';
import { createDefaultQROptions } from '../types/qrOptions';

export interface QRGenerationOptions {
  data: AllQRData;
  options?: Partial<QROptions>;
}

export interface QRResult {
  dataUrl: string;
  success: boolean;
  errorCode?: 'data_required' | 'failed_generate';
  errorDetails?: string;
}

export function useQRGenerator() {
  const isGenerating = ref(false);
  const lastResult = ref<QRResult | null>(null);

  const generateQR = async (genOptions: QRGenerationOptions): Promise<QRResult> => {
    const formattedText = formatQRData(genOptions.data);

    if (!formattedText.trim()) {
      return {
        dataUrl: '',
        success: false,
        errorCode: 'data_required',
      };
    }

    isGenerating.value = true;

    try {
      const defaults = createDefaultQROptions();
      const qrOptions: QROptions = {
        ...defaults,
        ...genOptions.options,
        colors: {
          ...defaults.colors,
          ...genOptions.options?.colors,
          transparentBackground:
            genOptions.options?.colors?.transparentBackground ??
            defaults.colors.transparentBackground,
          markers: {
            ...defaults.colors.markers,
            ...genOptions.options?.colors?.markers,
            corners: {
              ...defaults.colors.markers.corners,
              ...genOptions.options?.colors?.markers?.corners,
              topLeft: {
                ...defaults.colors.markers.corners.topLeft,
                ...genOptions.options?.colors?.markers?.corners?.topLeft,
              },
              topRight: {
                ...defaults.colors.markers.corners.topRight,
                ...genOptions.options?.colors?.markers?.corners?.topRight,
              },
              bottomLeft: {
                ...defaults.colors.markers.corners.bottomLeft,
                ...genOptions.options?.colors?.markers?.corners?.bottomLeft,
              },
            },
          },
          foregroundGradient: {
            ...defaults.colors.foregroundGradient,
            ...genOptions.options?.colors?.foregroundGradient,
          },
          backgroundGradient: {
            ...defaults.colors.backgroundGradient,
            ...genOptions.options?.colors?.backgroundGradient,
          },
        },
        style: {
          ...defaults.style,
          ...genOptions.options?.style,
        },
        logo: {
          ...defaults.logo,
          ...genOptions.options?.logo,
        },
      };

      const dataUrl = await renderQRToDataURL(formattedText, qrOptions);

      const result: QRResult = {
        dataUrl,
        success: true,
      };

      lastResult.value = result;
      return result;
    } catch (error) {
      const result: QRResult = {
        dataUrl: '',
        success: false,
        errorCode: 'failed_generate',
        errorDetails: error instanceof Error ? error.message : undefined,
      };

      lastResult.value = result;
      return result;
    } finally {
      isGenerating.value = false;
    }
  };

  const downloadQR = (dataUrl: string, filename: string = 'qrcode.png') => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const copyToClipboard = async (input: string | Blob): Promise<boolean> => {
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.write !== 'function') {
        return false;
      }
      if (typeof ClipboardItem === 'undefined') {
        return false;
      }

      const blob =
        typeof input === 'string'
          ? await (async () => {
              const response = await fetch(input);
              return await response.blob();
            })()
          : input;

      const mimeType = blob.type || 'image/png';
      await navigator.clipboard.write([new ClipboardItem({ [mimeType]: blob })]);

      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to copy to clipboard:', error);
      }
      return false;
    }
  };

  return {
    isGenerating: readonly(isGenerating),
    lastResult: readonly(lastResult),
    generateQR,
    downloadQR,
    copyToClipboard,
  };
}
