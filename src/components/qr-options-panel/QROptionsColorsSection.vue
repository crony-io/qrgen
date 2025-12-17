<template>
  <section class="space-y-4">
    <h4 class="text-sm font-medium text-muted">{{ t('qr.options.colors') }}</h4>

    <div class="grid grid-cols-2 gap-4">
      <ColorSelector
        id="qr-fg-color"
        :label="t('qr.options.foreground')"
        :model-value="options.colors.foreground"
        @update:model-value="updateForegroundColor"
      />

      <ColorSelector
        id="qr-bg-color"
        :label="t('qr.options.background')"
        :model-value="options.colors.background"
        @update:model-value="updateBackgroundColor"
      />
    </div>

    <CheckboxField
      id="qr-transparent-bg"
      :label="t('qr.options.transparent_background')"
      :model-value="options.colors.transparentBackground"
      @update:model-value="toggleTransparentBackground"
    />

    <p v-if="options.colors.transparentBackground" class="text-xs text-muted">
      {{ t('qr.options.transparent_background_note') }}
    </p>

    <p
      v-if="showContrastWarning"
      class="text-lg text-error border-2 border-dashed border-red-500 p-2"
    >
      {{ t('qr.options.contrast_warning', { ratio: contrastRatioLabel }) }}
    </p>

    <div>
      <span class="form-label">{{ t('qr.options.color_presets') }}</span>
      <OptionButtonGroup
        :options="colorPresets"
        :model-value="activeColorPreset"
        button-class="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs transition hover:bg-surface-hover"
        @update:model-value="
          (value) => applyColorPreset(colorPresets.find((preset) => preset.value === value)!)
        "
      >
        <template #option="{ option }">
          <span
            class="h-4 w-4 rounded-full border border-border"
            :style="{ backgroundColor: option.fg as string }"
          />
          <span
            class="h-4 w-4 rounded-full border border-border"
            :style="{ backgroundColor: option.bg as string }"
          />
          <span class="ml-1">{{ option.value }}</span>
        </template>
      </OptionButtonGroup>
    </div>

    <CheckboxField
      id="qr-fg-gradient"
      :label="t('qr.options.foreground_gradient')"
      :model-value="options.colors.foregroundGradient.enabled"
      @update:model-value="toggleForegroundGradient"
    />

    <div
      v-if="options.colors.foregroundGradient.enabled"
      class="space-y-3 rounded-lg border border-border p-3"
    >
      <div class="grid grid-cols-2 gap-3">
        <ColorSelector
          id="fg-gradient-start"
          :label="t('qr.options.gradient_start')"
          label-class="form-label text-xs"
          picker-class="h-8 w-full cursor-pointer rounded border border-border"
          :with-text="false"
          :model-value="options.colors.foregroundGradient.stops[0]?.color || '#000000'"
          @update:model-value="(value) => updateGradientStop(0, value)"
        />
        <ColorSelector
          id="fg-gradient-end"
          :label="t('qr.options.gradient_end')"
          label-class="form-label text-xs"
          picker-class="h-8 w-full cursor-pointer rounded border border-border"
          :with-text="false"
          :model-value="options.colors.foregroundGradient.stops[1]?.color || '#000000'"
          @update:model-value="(value) => updateGradientStop(1, value)"
        />
      </div>

      <RangeSlider
        id="fg-gradient-angle"
        :label="`${t('qr.options.gradient_angle')}: ${options.colors.foregroundGradient.angle}°`"
        label-class="form-label text-xs"
        :min="0"
        :max="360"
        :step="15"
        :model-value="options.colors.foregroundGradient.angle"
        @update:model-value="updateGradientAngle"
      />

      <OptionButtonGroup
        :options="[
          { value: 'linear', label: t('qr.options.gradient_linear') },
          { value: 'radial', label: t('qr.options.gradient_radial') },
        ]"
        :model-value="options.colors.foregroundGradient.type"
        container-class="flex gap-2"
        button-class="btn-ghost px-2 py-1 text-xs"
        @update:model-value="(value) => updateGradientType(value as GradientType)"
      />
    </div>

    <CheckboxField
      id="qr-bg-gradient"
      :label="t('qr.options.background_gradient')"
      :model-value="options.colors.backgroundGradient.enabled"
      @update:model-value="toggleBackgroundGradient"
    />

    <div
      v-if="options.colors.backgroundGradient.enabled"
      class="space-y-3 rounded-lg border border-border p-3"
    >
      <div class="grid grid-cols-2 gap-3">
        <ColorSelector
          id="bg-gradient-start"
          :label="t('qr.options.gradient_start')"
          label-class="form-label text-xs"
          picker-class="h-8 w-full cursor-pointer rounded border border-border"
          :with-text="false"
          :model-value="options.colors.backgroundGradient.stops[0]?.color || '#000000'"
          @update:model-value="(value) => updateBackgroundGradientStop(0, value)"
        />
        <ColorSelector
          id="bg-gradient-end"
          :label="t('qr.options.gradient_end')"
          label-class="form-label text-xs"
          picker-class="h-8 w-full cursor-pointer rounded border border-border"
          :with-text="false"
          :model-value="options.colors.backgroundGradient.stops[1]?.color || '#000000'"
          @update:model-value="(value) => updateBackgroundGradientStop(1, value)"
        />
      </div>

      <RangeSlider
        id="bg-gradient-angle"
        :label="`${t('qr.options.gradient_angle')}: ${options.colors.backgroundGradient.angle}°`"
        label-class="form-label text-xs"
        :min="0"
        :max="360"
        :step="15"
        :model-value="options.colors.backgroundGradient.angle"
        @update:model-value="updateBackgroundGradientAngle"
      />

      <OptionButtonGroup
        :options="[
          { value: 'linear', label: t('qr.options.gradient_linear') },
          { value: 'radial', label: t('qr.options.gradient_radial') },
        ]"
        :model-value="options.colors.backgroundGradient.type"
        container-class="flex gap-2"
        button-class="btn-ghost px-2 py-1 text-xs"
        @update:model-value="(value) => updateBackgroundGradientType(value as GradientType)"
      />
    </div>

    <div class="space-y-3 rounded-lg border border-border p-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-body">{{ t('qr.options.marker_colors') }}</span>
        <CheckboxField
          id="qr-marker-colors"
          :label="t('qr.options.enable_markers')"
          :model-value="options.colors.markers.enabled"
          @update:model-value="toggleMarkerColors"
        />
      </div>

      <div v-if="options.colors.markers.enabled" class="space-y-3">
        <div class="grid grid-cols-2 gap-4" v-if="options.colors.markers.perCornerEnabled == false">
          <ColorSelector
            id="marker-border-color"
            :label="t('qr.options.marker_border_color')"
            label-class="form-label text-xs"
            :model-value="options.colors.markers.border"
            @update:model-value="updateMarkerBorderColor"
          />

          <ColorSelector
            id="marker-center-color"
            :label="t('qr.options.marker_center_color')"
            label-class="form-label text-xs"
            :model-value="options.colors.markers.center"
            @update:model-value="updateMarkerCenterColor"
          />
        </div>

        <CheckboxField
          id="qr-marker-per-corner"
          :label="t('qr.options.marker_per_corner')"
          :model-value="options.colors.markers.perCornerEnabled"
          @update:model-value="toggleMarkerPerCorner"
        />

        <div
          v-if="options.colors.markers.perCornerEnabled"
          class="space-y-3 rounded-lg border border-border p-3"
        >
          <div v-for="corner in markerCorners" :key="corner.key" class="space-y-2">
            <div class="text-xs font-medium text-body">{{ t(corner.labelKey) }}</div>
            <div class="grid grid-cols-2 gap-4">
              <ColorSelector
                :id="`marker-${corner.key}-border`"
                :label="t('qr.options.marker_border_color')"
                label-class="form-label text-xs"
                :model-value="options.colors.markers.corners[corner.key].border"
                @update:model-value="(value) => updateMarkerCornerBorder(corner.key, value)"
              />

              <ColorSelector
                :id="`marker-${corner.key}-center`"
                :label="t('qr.options.marker_center_color')"
                label-class="form-label text-xs"
                :model-value="options.colors.markers.corners[corner.key].center"
                @update:model-value="(value) => updateMarkerCornerCenter(corner.key, value)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ColorSelector from '../ui/ColorSelector.vue';
import CheckboxField from '../ui/CheckboxField.vue';
import RangeSlider from '../ui/RangeSlider.vue';
import OptionButtonGroup from '../ui/OptionButtonGroup.vue';
import type { GradientType, MarkerCorner, QROptions } from '../../types/qrOptions';

const { t } = useI18n();

const props = defineProps<{
  options: QROptions;
}>();

const emit = defineEmits<{
  'update:options': [options: QROptions];
}>();

const colorPresets = [
  { value: 'Classic', fg: '#000000', bg: '#FFFFFF' },
  { value: 'Inverted', fg: '#FFFFFF', bg: '#000000' },
  { value: 'Ocean', fg: '#0066CC', bg: '#E6F2FF' },
  { value: 'Forest', fg: '#2D5016', bg: '#E8F5E9' },
  { value: 'Sunset', fg: '#D84315', bg: '#FFF3E0' },
  { value: 'Night', fg: '#7C4DFF', bg: '#1A1A2E' },
];

const activeColorPreset = computed<string>(() => {
  const fg = props.options.colors.foreground.toUpperCase();
  const bg = props.options.colors.background.toUpperCase();
  const match = colorPresets.find(
    (preset) => preset.fg.toUpperCase() === fg && preset.bg.toUpperCase() === bg,
  );
  return match?.value ?? '';
});

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

function toggleTransparentBackground(transparentBackground: boolean) {
  emitUpdate({
    colors: {
      ...props.options.colors,
      transparentBackground,
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
</script>
