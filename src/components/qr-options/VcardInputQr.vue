<script setup lang="ts">
import type { VCardQRData } from '../../types/qr';
import type { QRFieldErrors } from '../../utils/qrValidation';

import InputError from '../ui/InputError.vue';

defineProps<{
  data: VCardQRData;
  errors?: QRFieldErrors;
  updateData: (updates: Partial<Omit<VCardQRData, 'type'>>) => void;
}>();
</script>
<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="form-label" for="qr-vcard-first-name">{{
          $t('qr.forms.vcard.first_name_label')
        }}</label>
        <input
          id="qr-vcard-first-name"
          :value="data.firstName"
          @input="updateData({ firstName: ($event.target as HTMLInputElement).value })"
          type="text"
          :placeholder="$t('qr.forms.vcard.first_name_placeholder')"
          class="form-control"
          :aria-invalid="errors?.firstName ? 'true' : undefined"
          :aria-describedby="errors?.firstName ? 'qr-vcard-first-name-error' : undefined"
          :class="errors?.firstName ? 'border-error focus:ring-error' : ''"
        />
        <InputError id="qr-vcard-first-name-error" :message="errors?.firstName" />
      </div>
      <div>
        <label class="form-label" for="qr-vcard-last-name">{{
          $t('qr.forms.vcard.last_name_label')
        }}</label>
        <input
          id="qr-vcard-last-name"
          :value="data.lastName"
          @input="updateData({ lastName: ($event.target as HTMLInputElement).value })"
          type="text"
          :placeholder="$t('qr.forms.vcard.last_name_placeholder')"
          class="form-control"
          :aria-invalid="errors?.lastName ? 'true' : undefined"
          :aria-describedby="errors?.lastName ? 'qr-vcard-last-name-error' : undefined"
          :class="errors?.lastName ? 'border-error focus:ring-error' : ''"
        />
        <InputError id="qr-vcard-last-name-error" :message="errors?.lastName" />
      </div>
    </div>
    <div>
      <label class="form-label" for="qr-vcard-phone">{{ $t('qr.forms.vcard.phone_label') }}</label>
      <input
        id="qr-vcard-phone"
        :value="data.phone"
        @input="updateData({ phone: ($event.target as HTMLInputElement).value })"
        type="tel"
        :placeholder="$t('qr.forms.vcard.phone_placeholder')"
        class="form-control"
      />
    </div>
    <div>
      <label class="form-label" for="qr-vcard-email">{{ $t('qr.forms.vcard.email_label') }}</label>
      <input
        id="qr-vcard-email"
        :value="data.email"
        @input="updateData({ email: ($event.target as HTMLInputElement).value })"
        type="email"
        :placeholder="$t('qr.forms.vcard.email_placeholder')"
        class="form-control"
      />
    </div>
    <div>
      <label class="form-label" for="qr-vcard-company">{{
        $t('qr.forms.vcard.company_label')
      }}</label>
      <input
        id="qr-vcard-company"
        :value="data.company"
        @input="updateData({ company: ($event.target as HTMLInputElement).value })"
        type="text"
        :placeholder="$t('qr.forms.vcard.company_placeholder')"
        class="form-control"
      />
    </div>
    <div>
      <label class="form-label" for="qr-vcard-address">{{
        $t('qr.forms.vcard.address_label')
      }}</label>
      <input
        id="qr-vcard-address"
        :value="data.address"
        @input="updateData({ address: ($event.target as HTMLInputElement).value })"
        type="text"
        :placeholder="$t('qr.forms.vcard.address_placeholder')"
        class="form-control"
      />
    </div>
    <div>
      <label class="form-label" for="qr-vcard-website">{{
        $t('qr.forms.vcard.website_label')
      }}</label>
      <input
        id="qr-vcard-website"
        :value="data.website"
        @input="updateData({ website: ($event.target as HTMLInputElement).value })"
        type="url"
        :placeholder="$t('qr.forms.vcard.website_placeholder')"
        class="form-control"
      />
    </div>
  </div>
</template>
