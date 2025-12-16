<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Left Column: Data Input -->
    <div class="space-y-6">
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
    <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">
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

          <!-- Action Buttons -->
          <div v-if="lastResult?.success" class="flex w-full flex-col gap-3 sm:flex-row">
            <button @click="downloadQR(lastResult.dataUrl)" class="btn-outline flex-1 px-4 py-2">
              <Download class="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              {{ $t('common.download') }}
            </button>

            <button @click="handleCopy" class="btn-outline flex-1 px-4 py-2">
              <Copy class="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              {{ $t('common.copy') }}
            </button>
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
import { getQRFieldErrors, validateQRData } from '../utils/qrValidation';
import { debounce } from '../utils/debounce';
import QRTypeSelector from './QRTypeSelector.vue';
import QRFormInputs from './QRFormInputs.vue';
import QROptionsPanel from './QROptionsPanel.vue';
import type { QRDataType, AllQRData } from '../types/qr';
import type { QROptions } from '../types/qrOptions';
import { createDefaultQROptions } from '../types/qrOptions';

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
    options: qrOptions.value,
  });
};

const handleCopy = async () => {
  if (!lastResult.value?.dataUrl) {
    return;
  }

  const success = await copyToClipboard(lastResult.value.dataUrl);
  if (success) {
    toast.success(t('qr.generator.copy_success'));
  } else {
    toast.error(t('qr.generator.copy_error'));
  }
};

const debouncedGenerate = debounce(async () => {
  if (!validateQRData(qrData.value).success) {
    return;
  }
  await generateQR({
    data: qrData.value,
    options: qrOptions.value,
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
