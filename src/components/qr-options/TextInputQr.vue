<script setup lang="ts">
import type { TextQRData } from '../../types/qr';
import type { QRFieldErrors } from '../../utils/qrValidation';

import InputError from '../ui/InputError.vue';

defineProps<{
  data: TextQRData;
  errors?: QRFieldErrors;
  updateData: (updates: Partial<Omit<TextQRData, 'type'>>) => void;
}>();
</script>
<template>
  <label class="form-label" for="qr-text-content">{{ $t('qr.forms.text.label') }}</label>
  <textarea
    id="qr-text-content"
    :value="data.content"
    @input="updateData({ content: ($event.target as HTMLTextAreaElement).value })"
    :placeholder="$t('qr.forms.text.placeholder')"
    :aria-invalid="errors?.content ? 'true' : undefined"
    :aria-describedby="errors?.content ? 'qr-text-content-error' : undefined"
    :class="['form-control-textarea', errors?.content ? 'border-error focus:ring-error' : '']"
    rows="3"
  />
  <InputError id="qr-text-content-error" :message="errors?.content" />
</template>
