<script setup lang="ts">
import type { GeoQRData } from '../../types/qr';
import type { QRFieldErrors } from '../../utils/qrValidation';

import InputError from '../ui/InputError.vue';

defineProps<{
  data: GeoQRData;
  errors?: QRFieldErrors;
  updateData: (updates: Partial<Omit<GeoQRData, 'type'>>) => void;
}>();
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <div>
      <label class="form-label" for="qr-geo-latitude">{{
        $t('qr.forms.geo.latitude_label')
      }}</label>
      <input
        id="qr-geo-latitude"
        :value="data.latitude"
        @input="updateData({ latitude: ($event.target as HTMLInputElement).value })"
        type="number"
        step="any"
        :placeholder="$t('qr.forms.geo.latitude_placeholder')"
        class="form-control"
        :aria-invalid="errors?.latitude ? 'true' : undefined"
        :aria-describedby="errors?.latitude ? 'qr-geo-latitude-error' : undefined"
        :class="errors?.latitude ? 'border-error focus:ring-error' : ''"
      />
      <InputError id="qr-geo-latitude-error" :message="errors?.latitude" />
    </div>
    <div>
      <label class="form-label" for="qr-geo-longitude">{{
        $t('qr.forms.geo.longitude_label')
      }}</label>
      <input
        id="qr-geo-longitude"
        :value="data.longitude"
        @input="updateData({ longitude: ($event.target as HTMLInputElement).value })"
        type="number"
        step="any"
        :placeholder="$t('qr.forms.geo.longitude_placeholder')"
        class="form-control"
        :aria-invalid="errors?.longitude ? 'true' : undefined"
        :aria-describedby="errors?.longitude ? 'qr-geo-longitude-error' : undefined"
        :class="errors?.longitude ? 'border-error focus:ring-error' : ''"
      />
      <InputError id="qr-geo-longitude-error" :message="errors?.longitude" />
    </div>
  </div>
</template>
