<script setup lang="ts">
import type { EmailQRData } from '../../types/qr';
import type { QRFieldErrors } from '../../utils/qrValidation';

import InputError from '../ui/InputError.vue';

defineProps<{
  data: EmailQRData;
  errors?: QRFieldErrors;
  updateData: (updates: Partial<Omit<EmailQRData, 'type'>>) => void;
}>();
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="form-label" for="qr-email-address">{{
        $t('qr.forms.email.address_label')
      }}</label>
      <input
        id="qr-email-address"
        :value="data.email"
        @input="updateData({ email: ($event.target as HTMLInputElement).value })"
        type="email"
        :placeholder="$t('qr.forms.email.address_placeholder')"
        :aria-invalid="errors?.email ? 'true' : undefined"
        :aria-describedby="errors?.email ? 'qr-email-address-error' : undefined"
        class="form-control"
        :class="errors?.email ? 'border-error focus:ring-error' : ''"
      />
      <InputError id="qr-email-address-error" :message="errors?.email" />
    </div>
    <div>
      <label class="form-label" for="qr-email-subject">{{
        $t('qr.forms.email.subject_label')
      }}</label>
      <input
        id="qr-email-subject"
        :value="data.subject"
        @input="updateData({ subject: ($event.target as HTMLInputElement).value })"
        type="text"
        :placeholder="$t('qr.forms.email.subject_placeholder')"
        class="form-control"
      />
    </div>
    <div>
      <label class="form-label" for="qr-email-message">{{
        $t('qr.forms.email.message_label')
      }}</label>
      <textarea
        id="qr-email-message"
        :value="data.body"
        @input="updateData({ body: ($event.target as HTMLTextAreaElement).value })"
        :placeholder="$t('qr.forms.email.message_placeholder')"
        class="form-control-textarea"
        rows="3"
      />
    </div>
  </div>
</template>
