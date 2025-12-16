<script setup lang="ts">
import type { PhoneQRData } from '../../types/qr';
import { DEFAULT_COUNTRY_CODES } from '../../constants/countryCodes';
import type { QRFieldErrors } from '../../utils/qrValidation';

import InputError from '../ui/InputError.vue';

defineProps<{
  data: PhoneQRData;
  errors?: QRFieldErrors;
  updateData: (updates: Partial<Omit<PhoneQRData, 'type'>>) => void;
}>();
</script>

<template>
  <label id="qr-phone-label" class="form-label" for="qr-phone-input">{{
    $t('qr.forms.phone.label')
  }}</label>
  <div class="flex space-x-2">
    <select
      id="qr-phone-country-code"
      aria-labelledby="qr-phone-label"
      :aria-invalid="errors?.phone || errors?.countryCode ? 'true' : undefined"
      :aria-describedby="errors?.phone || errors?.countryCode ? 'qr-phone-input-error' : undefined"
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
      id="qr-phone-input"
      :value="data.phone"
      @input="updateData({ phone: ($event.target as HTMLInputElement).value })"
      type="tel"
      :placeholder="$t('qr.forms.phone.placeholder')"
      class="form-control-inline flex-1"
      :aria-invalid="errors?.phone || errors?.countryCode ? 'true' : undefined"
      :aria-describedby="errors?.phone || errors?.countryCode ? 'qr-phone-input-error' : undefined"
      :class="errors?.phone || errors?.countryCode ? 'border-error focus:ring-error' : ''"
    />
  </div>
  <InputError id="qr-phone-input-error" :message="errors?.phone ?? errors?.countryCode" />
</template>
