<script setup lang="ts">
import type { WiFiQRData } from '../../types/qr';
import type { QRFieldErrors } from '../../utils/qrValidation';

import InputError from '../ui/InputError.vue';

defineProps<{
  data: WiFiQRData;
  errors?: QRFieldErrors;
  updateData: (updates: Partial<Omit<WiFiQRData, 'type'>>) => void;
}>();
</script>
<template>
  <div class="space-y-3">
    <div>
      <label class="form-label" for="qr-wifi-ssid">{{ $t('qr.forms.wifi.ssid_label') }}</label>
      <input
        id="qr-wifi-ssid"
        :value="data.ssid"
        @input="updateData({ ssid: ($event.target as HTMLInputElement).value })"
        type="text"
        :placeholder="$t('qr.forms.wifi.ssid_placeholder')"
        :aria-invalid="errors?.ssid ? 'true' : undefined"
        :aria-describedby="errors?.ssid ? 'qr-wifi-ssid-error' : undefined"
        class="form-control"
        :class="errors?.ssid ? 'border-error focus:ring-error' : ''"
      />
      <InputError id="qr-wifi-ssid-error" :message="errors?.ssid" />
    </div>
    <div>
      <label class="form-label" for="qr-wifi-encryption">{{
        $t('qr.forms.wifi.encryption_label')
      }}</label>
      <select
        id="qr-wifi-encryption"
        :value="data.encryption"
        :aria-invalid="errors?.encryption ? 'true' : undefined"
        :aria-describedby="errors?.encryption ? 'qr-wifi-encryption-error' : undefined"
        @input="
          updateData({
            encryption: ($event.target as HTMLSelectElement).value as 'WPA' | 'WEP' | 'nopass',
          })
        "
        class="form-control"
        :class="errors?.encryption ? 'border-error focus:ring-error' : ''"
      >
        <option value="WPA">{{ $t('qr.forms.wifi.encryption_wpa') }}</option>
        <option value="WEP">{{ $t('qr.forms.wifi.encryption_wep') }}</option>
        <option value="nopass">{{ $t('qr.forms.wifi.encryption_nopass') }}</option>
      </select>
      <InputError id="qr-wifi-encryption-error" :message="errors?.encryption" />
    </div>
    <div v-if="data.encryption !== 'nopass'">
      <label class="form-label" for="qr-wifi-password">{{
        $t('qr.forms.wifi.password_label')
      }}</label>
      <input
        id="qr-wifi-password"
        :value="data.password"
        @input="updateData({ password: ($event.target as HTMLInputElement).value })"
        type="password"
        :placeholder="$t('qr.forms.wifi.password_placeholder')"
        :aria-invalid="errors?.password ? 'true' : undefined"
        :aria-describedby="errors?.password ? 'qr-wifi-password-error' : undefined"
        class="form-control"
        :class="errors?.password ? 'border-error focus:ring-error' : ''"
      />
      <InputError id="qr-wifi-password-error" :message="errors?.password" />
    </div>
    <div class="flex items-center">
      <input
        id="hidden-wifi"
        :checked="data.hidden"
        @change="updateData({ hidden: ($event.target as HTMLInputElement).checked })"
        type="checkbox"
        class="form-checkbox mr-2"
      />
      <label for="hidden-wifi" class="form-checkbox-label">{{
        $t('qr.forms.wifi.hidden_label')
      }}</label>
    </div>
  </div>
</template>
