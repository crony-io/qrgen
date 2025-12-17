<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Left Column: Data Input -->
    <div class="space-y-6 w-full lg:w-2/3">
      <!-- Type Selector -->
      <QRTypeSelector v-model="selectedType" @select="handleTypeChange" />

      <!-- Input Section -->
      <div class="panel">
        <h3 class="mb-4 text-lg font-semibold text-body">
          {{ t('qr.generator.enter_info', { type: typeLabel }) }}
        </h3>

        <div class="space-y-4">
          <QRFormInputs :data="qrData" :errors="fieldErrors" @update:data="handleDataUpdate" />

          <div v-if="validationError" class="text-sm text-error" role="alert" aria-live="assertive">
            {{ validationError }}
          </div>

          <button
            @click="handleGenerate"
            :disabled="isGenerating"
            class="btn-primary w-full px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="isGenerating" class="flex items-center justify-center">
              <LoaderCircle class="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {{ $t('common.loading') }}
            </span>
            <span v-else>{{ $t('common.generate') }}</span>
          </button>
        </div>
      </div>

      <!-- Options Panel -->
      <QROptionsPanel :options="qrOptions" @update:options="handleOptionsUpdate" />
    </div>

    <!-- Right Column: Preview -->
    <div class="space-y-6 w-full lg:w-1/3 lg:sticky lg:top-6 lg:self-start">
      <!-- Preview Section -->
      <div class="panel">
        <h3 class="mb-4 text-lg font-semibold text-body">
          {{ t('qr.generator.preview_title') }}
        </h3>

        <div class="flex flex-col items-center space-y-4">
          <!-- QR Code Display -->
          <div class="relative flex w-full items-center justify-center rounded-xl">
            <div class="relative w-full aspect-square">
              <div
                v-if="isGenerating"
                class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80"
              >
                <LoaderCircle class="h-8 w-8 animate-spin text-accent" aria-hidden="true" />
              </div>
              <img
                v-if="lastResult?.success"
                :src="lastResult.dataUrl"
                :alt="t('qr.generator.qr_image_alt')"
                class="h-full w-full rounded-lg object-contain"
              />
              <div
                v-else-if="!lastResult"
                class="flex h-full w-full flex-col items-center justify-center rounded-lg text-center text-muted"
              >
                <QrCode class="mb-2 h-12 w-12 opacity-30" />
                <span class="text-sm">{{ t('qr.generator.preview_placeholder') }}</span>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="lastResult && !lastResult.success" class="text-center">
            <div class="text-error" role="alert" aria-live="assertive">
              {{ resultErrorMessage }}
            </div>
          </div>

          <div v-if="lastResult?.success" class="w-full space-y-3">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div class="sm:col-span-2">
                <label class="form-label text-xs" for="qr-download-filename">{{
                  t('qr.export.filename')
                }}</label>
                <input
                  id="qr-download-filename"
                  v-model="downloadFilename"
                  type="text"
                  class="form-control-inline w-full"
                  maxlength="64"
                />
              </div>

              <div>
                <label class="form-label text-xs" for="qr-download-format">{{
                  t('qr.export.format')
                }}</label>
                <select
                  id="qr-download-format"
                  v-model="downloadFormat"
                  class="form-control-inline w-full"
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
            </div>

            <div v-if="downloadFormat !== 'image/png'" class="w-full">
              <label class="form-label text-xs" for="qr-download-quality">
                {{ t('qr.export.quality') }}: {{ Math.round(downloadQuality * 100) }}%
              </label>
              <input
                id="qr-download-quality"
                v-model.number="downloadQuality"
                type="range"
                :min="0.1"
                :max="1"
                :step="0.05"
                class="w-full"
              />
            </div>

            <div class="flex w-full flex-col gap-3 sm:flex-row">
              <button
                @click="handleDownload"
                :disabled="isGenerating || isExporting"
                class="btn-outline flex-1 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span v-if="isExporting" class="flex items-center justify-center">
                  <LoaderCircle class="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {{ $t('common.loading') }}
                </span>
                <span v-else>
                  <Download class="mr-2 inline-block h-4 w-4" aria-hidden="true" />
                  {{ $t('common.download') }}
                </span>
              </button>

              <button
                @click="handleCopy"
                :disabled="isGenerating || isCopying"
                class="btn-outline flex-1 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span v-if="isCopying" class="flex items-center justify-center">
                  <LoaderCircle class="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {{ $t('common.loading') }}
                </span>
                <span v-else>
                  <Copy class="mr-2 inline-block h-4 w-4" aria-hidden="true" />
                  {{ $t('common.copy') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { Copy, Download, LoaderCircle, QrCode } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useToast } from '../composables/useToast';
import { useQRGenerator } from '../composables/useQRGenerator';
import { formatQRData } from '../utils/qrFormatters';
import { renderQRToDataURL, renderQRToBlob } from '../utils/qrRenderer';
import { getQRFieldErrors, validateQRData } from '../utils/qrValidation';
import { debounce } from '../utils/debounce';
import QRTypeSelector from './QRTypeSelector.vue';
import QRFormInputs from './QRFormInputs.vue';
import QROptionsPanel from './QROptionsPanel.vue';
import type { QRDataType, AllQRData } from '../types/qr';
import type { QROptions } from '../types/qrOptions';
import { createDefaultQROptions } from '../types/qrOptions';

type QRImageType = 'image/png' | 'image/jpeg' | 'image/webp';

const { t } = useI18n();
const toast = useToast();

const selectedType = ref<QRDataType>('text');
const validationError = ref('');
const showValidation = ref(false);

// Initialize QR data based on type
const createInitialData = (type: QRDataType): AllQRData => {
  switch (type) {
    case 'text':
      return { type: 'text', content: '' };
    case 'url':
      return { type: 'url', url: '', protocol: 'https' };
    case 'email':
      return { type: 'email', email: '', subject: '', body: '' };
    case 'phone':
      return { type: 'phone', phone: '', countryCode: '+1' };
    case 'sms':
      return { type: 'sms', phone: '', countryCode: '+1', message: '' };
    case 'wifi':
      return { type: 'wifi', ssid: '', password: '', encryption: 'WPA', hidden: false };
    case 'vcard':
      return {
        type: 'vcard',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        company: '',
        address: '',
        website: '',
      };
    case 'geo':
      return { type: 'geo', latitude: '', longitude: '' };
    case 'event':
      return { type: 'event', title: '', start: '', end: '', location: '', description: '' };
    default:
      return { type: 'text', content: '' };
  }
};

const qrData = ref<AllQRData>(createInitialData('text'));
const qrOptions = ref<QROptions>(createDefaultQROptions());

const maxPreviewSize = 512;
const previewSize = computed(() => Math.min(qrOptions.value.size, maxPreviewSize));
const previewOptions = computed(() => ({ ...qrOptions.value, size: previewSize.value }));

const isExporting = ref(false);
const isCopying = ref(false);
const downloadFilename = ref('qrcode');
const downloadFormat = ref<QRImageType>('image/png');
const downloadQuality = ref(0.9);

const { isGenerating, lastResult, generateQR, downloadQR, copyToClipboard } = useQRGenerator();

const typeLabel = computed(() => t(`qr.types.${selectedType.value}.label`));

const resultErrorMessage = computed(() => {
  const result = lastResult.value;
  if (!result || result.success) {
    return '';
  }
  if (result.errorCode) {
    return t(`qr.generator.errors.${result.errorCode}`);
  }
  return result.errorDetails ?? '';
});

const isValidData = computed(() => validateQRData(qrData.value).success);
const fieldErrors = computed(() => (showValidation.value ? getQRFieldErrors(qrData.value) : {}));

const handleTypeChange = (newType: QRDataType) => {
  selectedType.value = newType;
  qrData.value = createInitialData(newType);
  validationError.value = '';
  showValidation.value = false;
};

const handleDataUpdate = (newData: AllQRData) => {
  qrData.value = newData;
  validationError.value = '';
};

const handleOptionsUpdate = (newOptions: QROptions) => {
  qrOptions.value = newOptions;
};

const handleGenerate = async () => {
  showValidation.value = true;
  if (!isValidData.value) {
    validationError.value = t('qr.generator.validation_error');
    return;
  }

  validationError.value = '';

  await generateQR({
    data: qrData.value,
    options: previewOptions.value,
  });
};

const handleCopy = async () => {
  showValidation.value = true;
  if (!isValidData.value) {
    validationError.value = t('qr.generator.validation_error');
    return;
  }

  const formattedText = formatQRData(qrData.value);
  if (!formattedText.trim()) {
    validationError.value = t('qr.generator.validation_error');
    return;
  }

  validationError.value = '';

  if (isCopying.value) {
    return;
  }

  isCopying.value = true;

  try {
    const blob = await renderQRToBlob(formattedText, qrOptions.value, 'image/png');
    const success = await copyToClipboard(blob);

    if (success) {
      toast.success(t('qr.generator.copy_success'));
    } else {
      toast.error(t('qr.generator.copy_error'));
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to copy QR:', error);
    }
    toast.error(t('common.error'));
  } finally {
    isCopying.value = false;
  }
};

function getExportFilename(base: string, type: QRImageType): string {
  const ext = type === 'image/png' ? 'png' : type === 'image/jpeg' ? 'jpg' : 'webp';
  const sanitized = (base || 'qrcode').trim() || 'qrcode';
  const withoutExt = sanitized.replace(/\.[^.]+$/, '');
  return `${withoutExt}.${ext}`;
}

const handleDownload = async () => {
  showValidation.value = true;
  if (!isValidData.value) {
    validationError.value = t('qr.generator.validation_error');
    return;
  }

  const formattedText = formatQRData(qrData.value);
  if (!formattedText.trim()) {
    validationError.value = t('qr.generator.validation_error');
    return;
  }

  validationError.value = '';
  isExporting.value = true;

  try {
    const type = downloadFormat.value;
    const quality = type === 'image/png' ? undefined : downloadQuality.value;
    const dataUrl = await renderQRToDataURL(formattedText, qrOptions.value, type, quality);
    downloadQR(dataUrl, getExportFilename(downloadFilename.value, type));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to export QR:', error);
    }
    toast.error(t('common.error'));
  } finally {
    isExporting.value = false;
  }
};

const debouncedGenerate = debounce(async () => {
  if (!validateQRData(qrData.value).success) {
    return;
  }
  await generateQR({
    data: qrData.value,
    options: previewOptions.value,
  });
}, 400);

watch(
  [qrOptions],
  () => {
    if (lastResult.value?.success) {
      debouncedGenerate();
    }
  },
  { deep: true },
);

onUnmounted(() => {
  // Cleanup handled by debounce naturally
});
</script>
