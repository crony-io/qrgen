<script setup lang="ts">
import type { UrlQRData } from '../../types/qr';
import type { QRFieldErrors } from '../../utils/qrValidation';

import InputError from '../ui/InputError.vue';

defineProps<{
  data: UrlQRData;
  errors?: QRFieldErrors;
  updateData: (updates: Partial<Omit<UrlQRData, 'type'>>) => void;
}>();
</script>
<template>
  <label id="qr-url-label" class="form-label" for="qr-url-input">{{
    $t('qr.forms.url.label')
  }}</label>
  <div class="flex space-x-2">
    <select
      id="qr-url-protocol"
      aria-labelledby="qr-url-label"
      :value="data.protocol"
      @input="
        updateData({ protocol: ($event.target as HTMLSelectElement).value as 'http' | 'https' })
      "
      class="form-control-inline"
    >
      <option value="https">{{ $t('qr.forms.url.protocol_https') }}</option>
      <option value="http">{{ $t('qr.forms.url.protocol_http') }}</option>
    </select>
    <input
      id="qr-url-input"
      :value="data.url"
      @input="updateData({ url: ($event.target as HTMLInputElement).value })"
      type="text"
      :placeholder="$t('qr.forms.url.placeholder')"
      :aria-invalid="errors?.url ? 'true' : undefined"
      :aria-describedby="errors?.url ? 'qr-url-input-error' : undefined"
      class="form-control-inline flex-1"
      :class="errors?.url ? 'border-error focus:ring-error' : ''"
    />
  </div>
  <InputError id="qr-url-input-error" :message="errors?.url" />
</template>
