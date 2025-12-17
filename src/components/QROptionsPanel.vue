<template>
  <div class="panel space-y-6">
    <h3 class="panel-title">{{ t('qr.options.title') }}</h3>

    <QROptionsSizeQualitySection :options="options" @update:options="forwardOptions" />

    <div class="divider" />

    <QROptionsColorsSection :options="options" @update:options="forwardOptions" />

    <div class="divider" />

    <QROptionsStyleSection :options="options" @update:options="forwardOptions" />

    <div class="divider" />

    <QROptionsLogoSection :options="options" @update:options="forwardOptions" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import QROptionsSizeQualitySection from './qr-options-panel/QROptionsSizeQualitySection.vue';
import QROptionsColorsSection from './qr-options-panel/QROptionsColorsSection.vue';
import QROptionsStyleSection from './qr-options-panel/QROptionsStyleSection.vue';
import QROptionsLogoSection from './qr-options-panel/QROptionsLogoSection.vue';
import type { QROptions } from '../types/qrOptions';

const { t } = useI18n();

defineProps<{
  options: QROptions;
}>();

const emit = defineEmits<{
  'update:options': [options: QROptions];
}>();

function forwardOptions(options: QROptions) {
  emit('update:options', options);
}
</script>
