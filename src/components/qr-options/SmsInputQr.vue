<script setup lang="ts">
import type { SMSQRData } from '../../types/qr';
import { DEFAULT_COUNTRY_CODES } from '../../constants/countryCodes';
import type { QRFieldErrors } from '../../utils/qrValidation';

import InputError from '../ui/InputError.vue';

defineProps<{
  data: SMSQRData;
  errors?: QRFieldErrors;
  updateData: (updates: Partial<Omit<SMSQRData, 'type'>>) => void;
}>();
</script>

<template>
  <div class="space-y-3">
    <div>
      <label id="qr-sms-phone-label" class="form-label" for="qr-sms-phone-input">{{
        $t('qr.forms.sms.phone_label')
      }}</label>
      <div class="flex space-x-2">
        <select
          id="qr-sms-country-code"
          aria-labelledby="qr-sms-phone-label"
          :aria-invalid="errors?.phone || errors?.countryCode ? 'true' : undefined"
          :aria-describedby="
            errors?.phone || errors?.countryCode ? 'qr-sms-phone-error' : undefined
          "
          :value="data.countryCode"
          @input="updateData({ countryCode: ($event.target as HTMLSelectElement).value })"
          class="form-control-inline"
          :class="errors?.phone || errors?.countryCode ? 'border-error focus:ring-error' : ''"
        >
          <option
            v-for="country in DEFAULT_COUNTRY_CODES"
            :key="`${country.code}-${country.dial_code}`"
            :value="country.dial_code"
          >
            {{ country.dial_code }} ({{ country.code }})
          </option>
        </select>
        <input
          id="qr-sms-phone-input"
          :value="data.phone"
          @input="updateData({ phone: ($event.target as HTMLInputElement).value })"
          type="tel"
          :placeholder="$t('qr.forms.sms.phone_placeholder')"
          class="form-control-inline flex-1"
          :aria-invalid="errors?.phone || errors?.countryCode ? 'true' : undefined"
          :aria-describedby="
            errors?.phone || errors?.countryCode ? 'qr-sms-phone-error' : undefined
          "
          :class="errors?.phone || errors?.countryCode ? 'border-error focus:ring-error' : ''"
        />
      </div>
      <InputError id="qr-sms-phone-error" :message="errors?.phone ?? errors?.countryCode" />
    </div>
    <div>
      <label class="form-label" for="qr-sms-message">{{ $t('qr.forms.sms.message_label') }}</label>
      <textarea
        id="qr-sms-message"
        :value="data.message"
        @input="updateData({ message: ($event.target as HTMLTextAreaElement).value })"
        :placeholder="$t('qr.forms.sms.message_placeholder')"
        class="form-control-textarea"
        rows="3"
      />
    </div>
  </div>
</template>
