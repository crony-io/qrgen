<template>
  <section class="space-y-4">
    <h4 class="text-sm font-medium text-muted">{{ t('qr.options.size_quality') }}</h4>

    <!-- Size -->
    <div>
      <div class="flex items-center justify-between gap-3 mb-3">
        <label class="form-label" for="qr-size">{{ t('qr.options.size') }}</label>
        <OptionButtonGroup
          :options="[
            { value: 'preset', label: t('qr.options.size_mode_slider') },
            { value: 'custom', label: t('qr.options.size_mode_custom') },
          ]"
          :model-value="isCustomSizeMode ? 'custom' : 'preset'"
          container-class="flex items-center gap-2"
          button-class="btn-ghost px-3 py-1 text-xs"
          @update:model-value="(value) => setSizeMode(value as 'preset' | 'custom')"
        />
      </div>

      <div class="flex items-center gap-3">
        <input
          v-if="!isCustomSizeMode"
          id="qr-size"
          type="range"
          :min="128"
          :max="512"
          :step="32"
          :value="options.size"
          class="flex-1"
          @input="updateSize(($event.target as HTMLInputElement).valueAsNumber)"
        />
        <input
          v-else
          id="qr-size"
          type="number"
          :min="128"
          :max="10000"
          :step="1"
          :value="customSizeDraft"
          class="form-control-inline flex-1"
          @focus="isEditingCustomSize = true"
          @input="customSizeDraft = ($event.target as HTMLInputElement).value"
          @keydown.enter.prevent="commitCustomSize()"
          @blur="commitCustomSize()"
        />
        <span class="w-16 text-sm text-muted">{{ options.size }}px</span>
      </div>

      <OptionButtonGroup
        v-if="!isCustomSizeMode"
        :options="sizePresets"
        :model-value="options.size"
        container-class="mt-2 flex flex-wrap gap-2"
        button-class="btn-ghost px-3 py-1 text-xs"
        @update:model-value="(value) => updateSize(value as number)"
      >
        <template #option="{ option }">{{ option.value }}px</template>
      </OptionButtonGroup>
      <p v-else class="mt-2 text-xs text-muted">
        {{ t('qr.options.size_custom_help') }}
      </p>
    </div>

    <!-- Margin -->
    <RangeSlider
      id="qr-margin"
      :label="t('qr.options.margin')"
      :min="0"
      :max="8"
      :step="1"
      :model-value="options.margin"
      :value-text="options.margin"
      @update:model-value="updateMargin"
    />

    <!-- Error Correction Level -->
    <div>
      <label class="form-label">{{ t('qr.options.error_correction') }}</label>
      <OptionButtonGroup
        :options="eccLevels"
        :model-value="options.errorCorrectionLevel"
        @update:model-value="(value) => updateECC(value as ErrorCorrectionLevel)"
      >
        <template #option="{ option }">
          <span class="font-medium">{{ option.value }}</span>
          <span class="ml-1 text-muted-2">({{ option.label }})</span>
        </template>
      </OptionButtonGroup>
      <p
        v-if="options.logo.enabled && options.errorCorrectionLevel !== 'H'"
        class="mt-2 text-xs text-error"
      >
        {{ t('qr.options.ecc_logo_warning') }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import RangeSlider from '../ui/RangeSlider.vue';
import OptionButtonGroup from '../ui/OptionButtonGroup.vue';
import type { QROptions, ErrorCorrectionLevel } from '../../types/qrOptions';

const { t } = useI18n();

const props = defineProps<{
  options: QROptions;
}>();

const emit = defineEmits<{
  'update:options': [options: QROptions];
}>();

const sizePresets = [128, 256, 384, 512];

const minPresetSize = sizePresets[0] ?? 128;
const maxPresetSize = sizePresets[sizePresets.length - 1] ?? 512;

const maxCustomSize = 10000;

const customSizeDraft = ref(String(props.options.size));
const isEditingCustomSize = ref(false);

watch(
  () => props.options.size,
  (newSize) => {
    if (!isEditingCustomSize.value) {
      customSizeDraft.value = String(newSize);
    }
  },
);

const sizeMode = ref<'preset' | 'custom'>(props.options.size > maxPresetSize ? 'custom' : 'preset');

const isCustomSizeMode = computed(() => {
  return sizeMode.value === 'custom' || props.options.size > maxPresetSize;
});

function setSizeMode(mode: 'preset' | 'custom') {
  sizeMode.value = mode;

  isEditingCustomSize.value = false;
  customSizeDraft.value = String(props.options.size);

  if (mode === 'preset') {
    if (props.options.size > maxPresetSize) {
      updateSize(maxPresetSize);
    }
  }
}

function commitCustomSize() {
  isEditingCustomSize.value = false;

  const parsed = Number(customSizeDraft.value);
  if (!Number.isFinite(parsed)) {
    customSizeDraft.value = String(props.options.size);
    return;
  }

  const normalized = updateSize(parsed);
  customSizeDraft.value = String(normalized);
}

const eccLevels: Array<{ value: ErrorCorrectionLevel; label: string }> = [
  { value: 'L', label: '7%' },
  { value: 'M', label: '15%' },
  { value: 'Q', label: '25%' },
  { value: 'H', label: '30%' },
];

function emitUpdate(partial: Partial<QROptions>) {
  emit('update:options', { ...props.options, ...partial });
}

function updateSize(size: number): number {
  const normalized = Number.isFinite(size)
    ? Math.min(maxCustomSize, Math.max(minPresetSize, Math.round(size)))
    : props.options.size;
  emitUpdate({ size: normalized });
  return normalized;
}

function updateMargin(margin: number) {
  emitUpdate({ margin });
}

function updateECC(errorCorrectionLevel: ErrorCorrectionLevel) {
  emitUpdate({ errorCorrectionLevel });
}
</script>
