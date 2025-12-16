<template>
  <div class="panel space-y-6">
    <h3 class="panel-title">{{ t('qr.options.title') }}</h3>

    <!-- Size & Quality Section -->
    <section class="space-y-4">
      <h4 class="text-sm font-medium text-muted">{{ t('qr.options.size_quality') }}</h4>

      <!-- Size -->
      <div>
        <div class="flex items-center justify-between gap-3 mb-3">
          <label class="form-label" for="qr-size">{{ t('qr.options.size') }}</label>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-ghost px-3 py-1 text-xs"
              :class="{ 'ring-2 ring-accent': !isCustomSizeMode }"
              @click="setSizeMode('preset')"
            >
              {{ t('qr.options.size_mode_slider') }}
            </button>
            <button
              type="button"
              class="btn-ghost px-3 py-1 text-xs"
              :class="{ 'ring-2 ring-accent': isCustomSizeMode }"
              @click="setSizeMode('custom')"
            >
              {{ t('qr.options.size_mode_custom') }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <input
            v-if="!isCustomSizeMode"
            id="qr-size"
            type="range"
            :min="128"
            :max="512"
            :step="32"
            :value="options.size"
            class="flex-1"
            @input="updateSize(($event.target as HTMLInputElement).valueAsNumber)"
          />
          <input
            v-else
            id="qr-size"
            type="number"
            :min="128"
            :max="10000"
            :step="1"
            :value="customSizeDraft"
            class="form-control-inline flex-1"
            @focus="isEditingCustomSize = true"
            @input="customSizeDraft = ($event.target as HTMLInputElement).value"
            @keydown.enter.prevent="commitCustomSize()"
            @blur="commitCustomSize()"
          />
          <span class="w-16 text-sm text-muted">{{ options.size }}px</span>
        </div>

        <div v-if="!isCustomSizeMode" class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="preset in sizePresets"
            :key="preset"
            type="button"
            class="btn-ghost px-3 py-1 text-xs"
            :class="{ 'ring-2 ring-accent': options.size === preset }"
            @click="updateSize(preset)"
          >
            {{ preset }}px
          </button>
        </div>
        <p v-else class="mt-2 text-xs text-muted">
          {{ t('qr.options.size_custom_help') }}
        </p>
      </div>

      <!-- Margin -->
      <div>
        <label class="form-label" for="qr-margin">{{ t('qr.options.margin') }}</label>
        <div class="flex items-center gap-3">
          <input
            id="qr-margin"
            type="range"
            :min="0"
            :max="8"
            :step="1"
            :value="options.margin"
            class="flex-1"
            @input="updateMargin(($event.target as HTMLInputElement).valueAsNumber)"
          />
          <span class="w-16 text-sm text-muted">{{ options.margin }}</span>
        </div>
      </div>

      <!-- Error Correction Level -->
      <div>
        <label class="form-label">{{ t('qr.options.error_correction') }}</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="level in eccLevels"
            :key="level.value"
            type="button"
            class="btn-ghost px-3 py-2 text-xs"
            :class="{ 'ring-2 ring-accent': options.errorCorrectionLevel === level.value }"
            @click="updateECC(level.value)"
          >
            <span class="font-medium">{{ level.value }}</span>
            <span class="ml-1 text-muted-2">({{ level.label }})</span>
          </button>
        </div>
        <p
          v-if="options.logo.enabled && options.errorCorrectionLevel !== 'H'"
          class="mt-2 text-xs text-error"
        >
          {{ t('qr.options.ecc_logo_warning') }}
        </p>
      </div>
    </section>

    <div class="divider" />

    <!-- Colors Section -->
    <section class="space-y-4">
      <h4 class="text-sm font-medium text-muted">{{ t('qr.options.colors') }}</h4>

      <div class="grid grid-cols-2 gap-4">
        <!-- Foreground Color -->
        <div>
          <label class="form-label" for="qr-fg-color">{{ t('qr.options.foreground') }}</label>
          <div class="flex items-center gap-2">
            <input
              id="qr-fg-color"
              type="color"
              :value="options.colors.foreground"
              class="h-10 min-w-10 cursor-pointer rounded border border-border"
              @input="updateForegroundColor(($event.target as HTMLInputElement).value)"
            />
            <input
              type="text"
              :value="options.colors.foreground"
              class="form-control-inline flex-1 uppercase w-full"
              maxlength="7"
              @input="updateForegroundColor(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <!-- Background Color -->
        <div>
          <label class="form-label" for="qr-bg-color">{{ t('qr.options.background') }}</label>
          <div class="flex items-center gap-2">
            <input
              id="qr-bg-color"
              type="color"
              :value="options.colors.background"
              class="h-10 min-w-10 cursor-pointer rounded border border-border"
              @input="updateBackgroundColor(($event.target as HTMLInputElement).value)"
            />
            <input
              type="text"
              :value="options.colors.background"
              class="form-control-inline flex-1 uppercase w-full"
              maxlength="7"
              @input="updateBackgroundColor(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <input
          id="qr-transparent-bg"
          type="checkbox"
          :checked="options.colors.transparentBackground"
          class="form-checkbox"
          @change="toggleTransparentBackground(($event.target as HTMLInputElement).checked)"
        />
        <label for="qr-transparent-bg" class="form-checkbox-label">
          {{ t('qr.options.transparent_background') }}
        </label>
      </div>

      <p v-if="options.colors.transparentBackground" class="text-xs text-muted">
        {{ t('qr.options.transparent_background_note') }}
      </p>

      <p v-if="showContrastWarning" class="text-xs text-error">
        {{ t('qr.options.contrast_warning', { ratio: contrastRatioLabel }) }}
      </p>

      <!-- Color Presets -->
      <div>
        <span class="form-label">{{ t('qr.options.color_presets') }}</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in colorPresets"
            :key="preset.name"
            type="button"
            class="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs transition hover:bg-surface-hover"
            @click="applyColorPreset(preset)"
          >
            <span
              class="h-4 w-4 rounded-full border border-border"
              :style="{ backgroundColor: preset.fg }"
            />
            <span
              class="h-4 w-4 rounded-full border border-border"
              :style="{ backgroundColor: preset.bg }"
            />
            <span class="ml-1">{{ preset.name }}</span>
          </button>
        </div>
      </div>

      <!-- Foreground Gradient Toggle -->
      <div class="flex items-center gap-2">
        <input
          id="qr-fg-gradient"
          type="checkbox"
          :checked="options.colors.foregroundGradient.enabled"
          class="form-checkbox"
          @change="toggleForegroundGradient(($event.target as HTMLInputElement).checked)"
        />
        <label for="qr-fg-gradient" class="form-checkbox-label">
          {{ t('qr.options.foreground_gradient') }}
        </label>
      </div>

      <!-- Gradient Options (when enabled) -->
      <div
        v-if="options.colors.foregroundGradient.enabled"
        class="space-y-3 rounded-lg border border-border p-3"
      >
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label text-xs" for="fg-gradient-start">{{
              t('qr.options.gradient_start')
            }}</label>
            <input
              id="fg-gradient-start"
              type="color"
              :value="options.colors.foregroundGradient.stops[0]?.color || '#000000'"
              class="h-8 w-full cursor-pointer rounded border border-border"
              @input="updateGradientStop(0, ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div>
            <label class="form-label text-xs" for="fg-gradient-end">{{
              t('qr.options.gradient_end')
            }}</label>
            <input
              id="fg-gradient-end"
              type="color"
              :value="options.colors.foregroundGradient.stops[1]?.color || '#000000'"
              class="h-8 w-full cursor-pointer rounded border border-border"
              @input="updateGradientStop(1, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <div>
          <label class="form-label text-xs" for="fg-gradient-angle">
            {{ t('qr.options.gradient_angle') }}: {{ options.colors.foregroundGradient.angle }}°
          </label>
          <input
            id="fg-gradient-angle"
            type="range"
            :min="0"
            :max="360"
            :step="15"
            :value="options.colors.foregroundGradient.angle"
            class="w-full"
            @input="updateGradientAngle(($event.target as HTMLInputElement).valueAsNumber)"
          />
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="btn-ghost px-2 py-1 text-xs"
            :class="{ 'ring-2 ring-accent': options.colors.foregroundGradient.type === 'linear' }"
            @click="updateGradientType('linear')"
          >
            {{ t('qr.options.gradient_linear') }}
          </button>
          <button
            type="button"
            class="btn-ghost px-2 py-1 text-xs"
            :class="{ 'ring-2 ring-accent': options.colors.foregroundGradient.type === 'radial' }"
            @click="updateGradientType('radial')"
          >
            {{ t('qr.options.gradient_radial') }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <input
          id="qr-bg-gradient"
          type="checkbox"
          :checked="options.colors.backgroundGradient.enabled"
          class="form-checkbox"
          @change="toggleBackgroundGradient(($event.target as HTMLInputElement).checked)"
        />
        <label for="qr-bg-gradient" class="form-checkbox-label">
          {{ t('qr.options.background_gradient') }}
        </label>
      </div>

      <div
        v-if="options.colors.backgroundGradient.enabled"
        class="space-y-3 rounded-lg border border-border p-3"
      >
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label text-xs" for="bg-gradient-start">{{
              t('qr.options.gradient_start')
            }}</label>
            <input
              id="bg-gradient-start"
              type="color"
              :value="options.colors.backgroundGradient.stops[0]?.color || '#000000'"
              class="h-8 w-full cursor-pointer rounded border border-border"
              @input="updateBackgroundGradientStop(0, ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div>
            <label class="form-label text-xs" for="bg-gradient-end">{{
              t('qr.options.gradient_end')
            }}</label>
            <input
              id="bg-gradient-end"
              type="color"
              :value="options.colors.backgroundGradient.stops[1]?.color || '#000000'"
              class="h-8 w-full cursor-pointer rounded border border-border"
              @input="updateBackgroundGradientStop(1, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <div>
          <label class="form-label text-xs" for="bg-gradient-angle">
            {{ t('qr.options.gradient_angle') }}: {{ options.colors.backgroundGradient.angle }}°
          </label>
          <input
            id="bg-gradient-angle"
            type="range"
            :min="0"
            :max="360"
            :step="15"
            :value="options.colors.backgroundGradient.angle"
            class="w-full"
            @input="
              updateBackgroundGradientAngle(($event.target as HTMLInputElement).valueAsNumber)
            "
          />
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="btn-ghost px-2 py-1 text-xs"
            :class="{ 'ring-2 ring-accent': options.colors.backgroundGradient.type === 'linear' }"
            @click="updateBackgroundGradientType('linear')"
          >
            {{ t('qr.options.gradient_linear') }}
          </button>
          <button
            type="button"
            class="btn-ghost px-2 py-1 text-xs"
            :class="{ 'ring-2 ring-accent': options.colors.backgroundGradient.type === 'radial' }"
            @click="updateBackgroundGradientType('radial')"
          >
            {{ t('qr.options.gradient_radial') }}
          </button>
        </div>
      </div>

      <div class="space-y-3 rounded-lg border border-border p-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-body">{{ t('qr.options.marker_colors') }}</span>
          <div class="flex items-center gap-2">
            <input
              id="qr-marker-colors"
              type="checkbox"
              :checked="options.colors.markers.enabled"
              class="form-checkbox"
              @change="toggleMarkerColors(($event.target as HTMLInputElement).checked)"
            />
            <label for="qr-marker-colors" class="form-checkbox-label">
              {{ t('qr.options.enable_markers') }}
            </label>
          </div>
        </div>

        <div v-if="options.colors.markers.enabled" class="space-y-3">
          <div
            class="grid grid-cols-2 gap-4"
            v-if="options.colors.markers.perCornerEnabled == false"
          >
            <div>
              <label class="form-label text-xs" for="marker-border-color">{{
                t('qr.options.marker_border_color')
              }}</label>
              <div class="flex items-center gap-2">
                <input
                  id="marker-border-color"
                  type="color"
                  :value="options.colors.markers.border"
                  class="h-10 min-w-10 cursor-pointer rounded border border-border"
                  @input="updateMarkerBorderColor(($event.target as HTMLInputElement).value)"
                />
                <input
                  type="text"
                  :value="options.colors.markers.border"
                  class="form-control-inline flex-1 uppercase w-full"
                  maxlength="7"
                  @input="updateMarkerBorderColor(($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>

            <div>
              <label class="form-label text-xs" for="marker-center-color">{{
                t('qr.options.marker_center_color')
              }}</label>
              <div class="flex items-center gap-2">
                <input
                  id="marker-center-color"
                  type="color"
                  :value="options.colors.markers.center"
                  class="h-10 min-w-10 cursor-pointer rounded border border-border"
                  @input="updateMarkerCenterColor(($event.target as HTMLInputElement).value)"
                />
                <input
                  type="text"
                  :value="options.colors.markers.center"
                  class="form-control-inline flex-1 uppercase w-full"
                  maxlength="7"
                  @input="updateMarkerCenterColor(($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              id="qr-marker-per-corner"
              type="checkbox"
              :checked="options.colors.markers.perCornerEnabled"
              class="form-checkbox"
              @change="toggleMarkerPerCorner(($event.target as HTMLInputElement).checked)"
            />
            <label for="qr-marker-per-corner" class="form-checkbox-label">
              {{ t('qr.options.marker_per_corner') }}
            </label>
          </div>

          <div
            v-if="options.colors.markers.perCornerEnabled"
            class="space-y-3 rounded-lg border border-border p-3"
          >
            <div v-for="corner in markerCorners" :key="corner.key" class="space-y-2">
              <div class="text-xs font-medium text-body">{{ t(corner.labelKey) }}</div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="form-label text-xs" :for="`marker-${corner.key}-border`">{{
                    t('qr.options.marker_border_color')
                  }}</label>
                  <div class="flex items-center gap-2">
                    <input
                      :id="`marker-${corner.key}-border`"
                      type="color"
                      :value="options.colors.markers.corners[corner.key].border"
                      class="h-10 min-w-10 cursor-pointer rounded border border-border"
                      @input="
                        updateMarkerCornerBorder(
                          corner.key,
                          ($event.target as HTMLInputElement).value,
                        )
                      "
                    />
                    <input
                      type="text"
                      :value="options.colors.markers.corners[corner.key].border"
                      class="form-control-inline flex-1 uppercase w-full"
                      maxlength="7"
                      @input="
                        updateMarkerCornerBorder(
                          corner.key,
                          ($event.target as HTMLInputElement).value,
                        )
                      "
                    />
                  </div>
                </div>

                <div>
                  <label class="form-label text-xs" :for="`marker-${corner.key}-center`">{{
                    t('qr.options.marker_center_color')
                  }}</label>
                  <div class="flex items-center gap-2">
                    <input
                      :id="`marker-${corner.key}-center`"
                      type="color"
                      :value="options.colors.markers.corners[corner.key].center"
                      class="h-10 min-w-10 cursor-pointer rounded border border-border"
                      @input="
                        updateMarkerCornerCenter(
                          corner.key,
                          ($event.target as HTMLInputElement).value,
                        )
                      "
                    />
                    <input
                      type="text"
                      :value="options.colors.markers.corners[corner.key].center"
                      class="form-control-inline flex-1 uppercase w-full"
                      maxlength="7"
                      @input="
                        updateMarkerCornerCenter(
                          corner.key,
                          ($event.target as HTMLInputElement).value,
                        )
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="divider" />

    <!-- Style Section -->
    <section class="space-y-4">
      <h4 class="text-sm font-medium text-muted">{{ t('qr.options.style') }}</h4>

      <!-- Module Shape -->
      <div>
        <label class="form-label">{{ t('qr.options.module_shape') }}</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="shape in moduleShapes"
            :key="shape.value"
            type="button"
            class="btn-ghost gap-2 px-3 py-2 text-xs"
            :class="{ 'ring-2 ring-accent': options.style.moduleShape === shape.value }"
            @click="updateModuleShape(shape.value)"
          >
            <span class="inline-flex h-5 w-5 shrink-0 items-center justify-center">
              <span :class="shape.iconClass" />
            </span>
            <span>{{ t(shape.labelKey) }}</span>
          </button>
        </div>
      </div>

      <!-- Corner Square Style -->
      <div>
        <label class="form-label">{{ t('qr.options.corner_square') }}</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="style in cornerSquareStyles"
            :key="style.value"
            type="button"
            class="btn-ghost gap-2 px-3 py-2 text-xs"
            :class="{ 'ring-2 ring-accent': options.style.cornerSquareStyle === style.value }"
            @click="updateCornerSquareStyle(style.value)"
          >
            <span class="inline-flex h-5 w-5 shrink-0 items-center justify-center">
              <span :class="style.iconClass" />
            </span>
            <span>{{ t(style.labelKey) }}</span>
          </button>
        </div>
      </div>

      <!-- Corner Dot Style -->
      <div>
        <label class="form-label">{{ t('qr.options.corner_dot') }}</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="style in cornerDotStyles"
            :key="style.value"
            type="button"
            class="btn-ghost gap-2 px-3 py-2 text-xs"
            :class="{ 'ring-2 ring-accent': options.style.cornerDotStyle === style.value }"
            @click="updateCornerDotStyle(style.value)"
          >
            <span class="inline-flex h-5 w-5 shrink-0 items-center justify-center">
              <span :class="style.iconClass" />
            </span>
            <span>{{ t(style.labelKey) }}</span>
          </button>
        </div>
      </div>
    </section>

    <div class="divider" />

    <!-- Logo Section -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-muted">{{ t('qr.options.logo') }}</h4>
        <div class="flex items-center gap-2">
          <input
            id="qr-logo-enabled"
            type="checkbox"
            :checked="options.logo.enabled"
            class="form-checkbox"
            @change="toggleLogo(($event.target as HTMLInputElement).checked)"
          />
          <label for="qr-logo-enabled" class="form-checkbox-label">
            {{ t('qr.options.enable_logo') }}
          </label>
        </div>
      </div>

      <div v-if="options.logo.enabled" class="space-y-4">
        <!-- Logo Upload -->
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

        <!-- Logo Size -->
        <div>
          <label class="form-label" for="logo-size">
            {{ t('qr.options.logo_size') }}: {{ Math.round(options.logo.sizeRatio * 100) }}%
          </label>
          <input
            id="logo-size"
            type="range"
            :min="0.1"
            :max="0.4"
            :step="0.05"
            :value="options.logo.sizeRatio"
            class="w-full"
            @input="updateLogoSize(($event.target as HTMLInputElement).valueAsNumber)"
          />
        </div>

        <!-- Logo Padding -->
        <div>
          <label class="form-label" for="logo-padding">
            {{ t('qr.options.logo_padding') }}: {{ options.logo.padding }}px
          </label>
          <input
            id="logo-padding"
            type="range"
            :min="0"
            :max="16"
            :step="2"
            :value="options.logo.padding"
            class="w-full"
            @input="updateLogoPadding(($event.target as HTMLInputElement).valueAsNumber)"
          />
        </div>

        <!-- Logo Shape -->
        <div>
          <label class="form-label">{{ t('qr.options.logo_shape') }}</label>
          <div class="flex gap-2">
            <button
              type="button"
              class="btn-ghost px-3 py-2 text-xs"
              :class="{ 'ring-2 ring-accent': options.logo.shape === 'square' }"
              @click="updateLogoShape('square')"
            >
              {{ t('qr.options.shape_square') }}
            </button>
            <button
              type="button"
              class="btn-ghost px-3 py-2 text-xs"
              :class="{ 'ring-2 ring-accent': options.logo.shape === 'circle' }"
              @click="updateLogoShape('circle')"
            >
              {{ t('qr.options.shape_circle') }}
            </button>
          </div>
        </div>

        <!-- Logo Background Color -->
        <div>
          <label class="form-label" for="logo-bg-color">{{
            t('qr.options.logo_background')
          }}</label>
          <div class="flex items-center gap-2">
            <input
              id="logo-bg-color"
              type="color"
              :value="options.logo.backgroundColor"
              class="h-10 w-10 cursor-pointer rounded border border-border"
              @input="updateLogoBackgroundColor(($event.target as HTMLInputElement).value)"
            />
            <input
              type="text"
              :value="options.logo.backgroundColor"
              class="form-control-inline flex-1 uppercase"
              maxlength="7"
              @input="updateLogoBackgroundColor(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Upload } from 'lucide-vue-next';
import type {
  QROptions,
  ErrorCorrectionLevel,
  ModuleShape,
  CornerSquareStyle,
  CornerDotStyle,
  GradientType,
  MarkerCorner,
} from '../types/qrOptions';

const { t } = useI18n();

const props = defineProps<{
  options: QROptions;
}>();

const emit = defineEmits<{
  'update:options': [options: QROptions];
}>();

const logoInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const sizePresets = [128, 256, 384, 512];

const minPresetSize = sizePresets[0] ?? 128;
const maxPresetSize = sizePresets[sizePresets.length - 1] ?? 512;

const maxCustomSize = 10000;

const customSizeDraft = ref(String(props.options.size));
const isEditingCustomSize = ref(false);

watch(
  () => props.options.size,
  (newSize) => {
    if (!isEditingCustomSize.value) {
      customSizeDraft.value = String(newSize);
    }
  },
);

const sizeMode = ref<'preset' | 'custom'>(props.options.size > maxPresetSize ? 'custom' : 'preset');

const isCustomSizeMode = computed(() => {
  return sizeMode.value === 'custom' || props.options.size > maxPresetSize;
});

function setSizeMode(mode: 'preset' | 'custom') {
  sizeMode.value = mode;

  isEditingCustomSize.value = false;
  customSizeDraft.value = String(props.options.size);

  if (mode === 'preset') {
    if (props.options.size > maxPresetSize) {
      updateSize(maxPresetSize);
    }
  }
}

function commitCustomSize() {
  isEditingCustomSize.value = false;

  const parsed = Number(customSizeDraft.value);
  if (!Number.isFinite(parsed)) {
    customSizeDraft.value = String(props.options.size);
    return;
  }

  const normalized = updateSize(parsed);
  customSizeDraft.value = String(normalized);
}

const eccLevels: Array<{ value: ErrorCorrectionLevel; label: string }> = [
  { value: 'L', label: '7%' },
  { value: 'M', label: '15%' },
  { value: 'Q', label: '25%' },
  { value: 'H', label: '30%' },
];

const colorPresets = [
  { name: 'Classic', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Inverted', fg: '#FFFFFF', bg: '#000000' },
  { name: 'Ocean', fg: '#0066CC', bg: '#E6F2FF' },
  { name: 'Forest', fg: '#2D5016', bg: '#E8F5E9' },
  { name: 'Sunset', fg: '#D84315', bg: '#FFF3E0' },
  { name: 'Night', fg: '#7C4DFF', bg: '#1A1A2E' },
];

const moduleShapes: Array<{ value: ModuleShape; labelKey: string; iconClass: string }> = [
  { value: 'square', labelKey: 'qr.options.shape_square', iconClass: 'h-4 w-4 bg-body' },
  { value: 'dot', labelKey: 'qr.options.shape_dot', iconClass: 'h-4 w-4 rounded-full bg-body' },
  {
    value: 'rounded',
    labelKey: 'qr.options.shape_rounded',
    iconClass: 'h-4 w-4 rounded bg-body',
  },
  {
    value: 'diamond',
    labelKey: 'qr.options.shape_diamond',
    iconClass: 'h-3 w-3 bg-body rotate-45',
  },
];

const cornerSquareStyles: Array<{ value: CornerSquareStyle; labelKey: string; iconClass: string }> =
  [
    {
      value: 'square',
      labelKey: 'qr.options.shape_square',
      iconClass: 'h-4 w-4 border-2 border-body',
    },
    {
      value: 'rounded',
      labelKey: 'qr.options.shape_rounded',
      iconClass: 'h-4 w-4 rounded border-2 border-body',
    },
    {
      value: 'dot',
      labelKey: 'qr.options.shape_dot',
      iconClass: 'h-4 w-4 rounded-full border-2 border-body',
    },
  ];

const cornerDotStyles: Array<{ value: CornerDotStyle; labelKey: string; iconClass: string }> = [
  { value: 'square', labelKey: 'qr.options.shape_square', iconClass: 'h-3 w-3 bg-body' },
  { value: 'dot', labelKey: 'qr.options.shape_dot', iconClass: 'h-3 w-3 rounded-full bg-body' },
  {
    value: 'diamond',
    labelKey: 'qr.options.shape_diamond',
    iconClass: 'h-3 w-3 bg-body rotate-45',
  },
];

const markerCorners: Array<{ key: MarkerCorner; labelKey: string }> = [
  { key: 'topLeft', labelKey: 'qr.options.top_left' },
  { key: 'topRight', labelKey: 'qr.options.top_right' },
  { key: 'bottomLeft', labelKey: 'qr.options.bottom_left' },
];

function parseHexColor(value: string): { r: number; g: number; b: number } | null {
  const raw = value.trim();
  if (!raw.startsWith('#')) {
    return null;
  }
  const hex = raw.slice(1);
  const expanded =
    hex.length === 3
      ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
      : hex.length === 6
        ? hex
        : null;

  if (!expanded || !/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return null;
  }

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const toLinear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number | null {
  const fgRgb = parseHexColor(fg);
  const bgRgb = parseHexColor(bg);
  if (!fgRgb || !bgRgb) {
    return null;
  }

  const l1 = relativeLuminance(fgRgb);
  const l2 = relativeLuminance(bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const minContrastRatio = computed<number | null>(() => {
  const fgColors = props.options.colors.foregroundGradient.enabled
    ? props.options.colors.foregroundGradient.stops.map((stop) => stop.color)
    : [props.options.colors.foreground];
  const bgColors = props.options.colors.backgroundGradient.enabled
    ? props.options.colors.backgroundGradient.stops.map((stop) => stop.color)
    : [props.options.colors.background];

  let min = Number.POSITIVE_INFINITY;

  for (const fg of fgColors) {
    for (const bg of bgColors) {
      const ratio = contrastRatio(fg, bg);
      if (ratio === null) {
        return null;
      }
      min = Math.min(min, ratio);
    }
  }

  return Number.isFinite(min) ? min : null;
});

const showContrastWarning = computed(
  () =>
    !props.options.colors.transparentBackground &&
    minContrastRatio.value !== null &&
    minContrastRatio.value < 3,
);

const contrastRatioLabel = computed(() =>
  minContrastRatio.value === null ? '' : minContrastRatio.value.toFixed(2),
);

function emitUpdate(partial: Partial<QROptions>) {
  emit('update:options', { ...props.options, ...partial });
}

function updateSize(size: number): number {
  const normalized = Number.isFinite(size)
    ? Math.min(maxCustomSize, Math.max(minPresetSize, Math.round(size)))
    : props.options.size;
  emitUpdate({ size: normalized });
  return normalized;
}

function updateMargin(margin: number) {
  emitUpdate({ margin });
}

function updateECC(errorCorrectionLevel: ErrorCorrectionLevel) {
  emitUpdate({ errorCorrectionLevel });
}

function updateForegroundColor(foreground: string) {
  emitUpdate({
    colors: { ...props.options.colors, foreground },
  });
}

function updateBackgroundColor(background: string) {
  emitUpdate({
    colors: { ...props.options.colors, background },
  });
}

function applyColorPreset(preset: { fg: string; bg: string }) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      foreground: preset.fg,
      background: preset.bg,
    },
  });
}

function toggleForegroundGradient(enabled: boolean) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      foregroundGradient: {
        ...props.options.colors.foregroundGradient,
        enabled,
      },
    },
  });
}

function updateGradientStop(index: number, color: string) {
  const stops = [...props.options.colors.foregroundGradient.stops];
  if (stops[index]) {
    stops[index] = { ...stops[index], color };
  }
  emitUpdate({
    colors: {
      ...props.options.colors,
      foregroundGradient: {
        ...props.options.colors.foregroundGradient,
        stops,
      },
    },
  });
}

function updateGradientAngle(angle: number) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      foregroundGradient: {
        ...props.options.colors.foregroundGradient,
        angle,
      },
    },
  });
}

function updateGradientType(type: GradientType) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      foregroundGradient: {
        ...props.options.colors.foregroundGradient,
        type,
      },
    },
  });
}

function toggleTransparentBackground(transparentBackground: boolean) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      transparentBackground,
    },
  });
}

function toggleBackgroundGradient(enabled: boolean) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      backgroundGradient: {
        ...props.options.colors.backgroundGradient,
        enabled,
      },
    },
  });
}

function updateBackgroundGradientStop(index: number, color: string) {
  const stops = [...props.options.colors.backgroundGradient.stops];
  if (stops[index]) {
    stops[index] = { ...stops[index], color };
  }
  emitUpdate({
    colors: {
      ...props.options.colors,
      backgroundGradient: {
        ...props.options.colors.backgroundGradient,
        stops,
      },
    },
  });
}

function updateBackgroundGradientAngle(angle: number) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      backgroundGradient: {
        ...props.options.colors.backgroundGradient,
        angle,
      },
    },
  });
}

function updateBackgroundGradientType(type: GradientType) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      backgroundGradient: {
        ...props.options.colors.backgroundGradient,
        type,
      },
    },
  });
}

function toggleMarkerColors(enabled: boolean) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      markers: {
        ...props.options.colors.markers,
        enabled,
      },
    },
  });
}

function updateMarkerBorderColor(border: string) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      markers: {
        ...props.options.colors.markers,
        border,
      },
    },
  });
}

function updateMarkerCenterColor(center: string) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      markers: {
        ...props.options.colors.markers,
        center,
      },
    },
  });
}

function toggleMarkerPerCorner(perCornerEnabled: boolean) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      markers: {
        ...props.options.colors.markers,
        perCornerEnabled,
      },
    },
  });
}

function updateMarkerCornerBorder(corner: MarkerCorner, border: string) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      markers: {
        ...props.options.colors.markers,
        corners: {
          ...props.options.colors.markers.corners,
          [corner]: {
            ...props.options.colors.markers.corners[corner],
            border,
          },
        },
      },
    },
  });
}

function updateMarkerCornerCenter(corner: MarkerCorner, center: string) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      markers: {
        ...props.options.colors.markers,
        corners: {
          ...props.options.colors.markers.corners,
          [corner]: {
            ...props.options.colors.markers.corners[corner],
            center,
          },
        },
      },
    },
  });
}

function updateModuleShape(moduleShape: ModuleShape) {
  emitUpdate({
    style: { ...props.options.style, moduleShape },
  });
}

function updateCornerSquareStyle(cornerSquareStyle: CornerSquareStyle) {
  emitUpdate({
    style: { ...props.options.style, cornerSquareStyle },
  });
}

function updateCornerDotStyle(cornerDotStyle: CornerDotStyle) {
  emitUpdate({
    style: { ...props.options.style, cornerDotStyle },
  });
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
