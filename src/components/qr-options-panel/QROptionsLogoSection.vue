<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-medium text-muted">{{ t('qr.options.logo') }}</h4>
      <CheckboxField
        id="qr-logo-enabled"
        :label="t('qr.options.enable_logo')"
        :model-value="options.logo.enabled"
        @update:model-value="toggleLogo"
      />
    </div>

    <div v-if="options.logo.enabled" class="space-y-4">
      <div
        class="relative flex min-h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border transition hover:border-accent"
        @click="triggerLogoUpload"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleLogoDrop"
        :class="{ 'border-accent bg-accent/10': isDragging }"
      >
        <input
          ref="logoInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleLogoSelect"
        />
        <div v-if="options.logo.src" class="flex items-center gap-3 p-3">
          <img
            :src="options.logo.src"
            alt="Logo preview"
            class="h-16 w-16 rounded object-contain"
          />
          <button
            type="button"
            class="btn-outline px-2 py-1 text-xs text-error"
            @click.stop="removeLogo"
          >
            {{ t('qr.options.remove_logo') }}
          </button>
        </div>
        <div v-else class="p-4 text-center text-sm text-muted">
          <Upload class="mx-auto mb-2 h-6 w-6" />
          {{ t('qr.options.upload_logo') }}
        </div>
      </div>

      <RangeSlider
        id="logo-size"
        :label="`${t('qr.options.logo_size')}: ${Math.round(options.logo.sizeRatio * 100)}%`"
        :min="0.1"
        :max="0.4"
        :step="0.05"
        :model-value="options.logo.sizeRatio"
        @update:model-value="updateLogoSize"
      />

      <RangeSlider
        id="logo-padding"
        :label="`${t('qr.options.logo_padding')}: ${options.logo.padding}px`"
        :min="0"
        :max="16"
        :step="2"
        :model-value="options.logo.padding"
        @update:model-value="updateLogoPadding"
      />

      <div>
        <label class="form-label">{{ t('qr.options.logo_shape') }}</label>
        <OptionButtonGroup
          :options="[
            { value: 'square', label: t('qr.options.shape_square') },
            { value: 'circle', label: t('qr.options.shape_circle') },
          ]"
          :model-value="options.logo.shape"
          container-class="flex gap-2"
          button-class="btn-ghost px-3 py-2 text-xs"
          @update:model-value="(value) => updateLogoShape(value as 'square' | 'circle')"
        />
      </div>

      <ColorSelector
        id="logo-bg-color"
        :label="t('qr.options.logo_background')"
        picker-class="h-10 w-10 cursor-pointer rounded border border-border"
        text-input-class="form-control-inline flex-1 uppercase"
        :model-value="options.logo.backgroundColor"
        @update:model-value="updateLogoBackgroundColor"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Upload } from 'lucide-vue-next';
import ColorSelector from '../ui/ColorSelector.vue';
import CheckboxField from '../ui/CheckboxField.vue';
import RangeSlider from '../ui/RangeSlider.vue';
import OptionButtonGroup from '../ui/OptionButtonGroup.vue';
import type { QROptions } from '../../types/qrOptions';

const { t } = useI18n();

const props = defineProps<{
  options: QROptions;
}>();

const emit = defineEmits<{
  'update:options': [options: QROptions];
}>();

const logoInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

function emitUpdate(partial: Partial<QROptions>) {
  emit('update:options', { ...props.options, ...partial });
}

function toggleLogo(enabled: boolean) {
  emitUpdate({
    logo: { ...props.options.logo, enabled },
    errorCorrectionLevel: enabled ? 'H' : props.options.errorCorrectionLevel,
  });
}

function triggerLogoUpload() {
  logoInputRef.value?.click();
}

function handleLogoSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    loadLogoFile(file);
  }
}

function handleLogoDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file && file.type.startsWith('image/')) {
    loadLogoFile(file);
  }
}

function loadLogoFile(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    emitUpdate({
      logo: { ...props.options.logo, src, enabled: true },
      errorCorrectionLevel: 'H',
    });
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  emitUpdate({
    logo: { ...props.options.logo, src: '', enabled: false },
  });
}

function updateLogoSize(sizeRatio: number) {
  emitUpdate({
    logo: { ...props.options.logo, sizeRatio },
  });
}

function updateLogoPadding(padding: number) {
  emitUpdate({
    logo: { ...props.options.logo, padding },
  });
}

function updateLogoShape(shape: 'square' | 'circle') {
  emitUpdate({
    logo: { ...props.options.logo, shape },
  });
}

function updateLogoBackgroundColor(backgroundColor: string) {
  emitUpdate({
    logo: { ...props.options.logo, backgroundColor },
  });
}
</script>
