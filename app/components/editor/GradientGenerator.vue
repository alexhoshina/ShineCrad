<script setup lang="ts">
import { useElementBounding, useEventListener } from "@vueuse/core";
import {
  normalizeHex,
  clamp,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
} from "~/utils/color";
import type {
  GradientConfig,
  GradientType,
  BaseGradientType,
} from "~/utils/gradient";

// 类型
type DragTarget = "picker" | "hue" | "alpha" | "stop" | "angle" | null;

// 属性
const props = defineProps<{
  newStopColor?: string;
}>();

// 模型
const config = defineModel<GradientConfig>({ required: true });

// 内部状态
const activeStopId = ref(config.value.stops[0]?.id ?? 1);
const activeColorHex = ref("");
const activeColorRgb = ref({ r: 0, g: 0, b: 0 });
const activeColorHsv = ref({ h: 0, s: 0, v: 0 });

// --- 渐变类型辅助函数 ---
const baseType = computed<BaseGradientType>(
  () => config.value.type.replace("repeating-", "") as BaseGradientType,
);

const isRepeating = computed(() => config.value.type.startsWith("repeating-"));

function setBaseType(base: BaseGradientType) {
  config.value.type = (
    isRepeating.value ? `repeating-${base}` : base
  ) as GradientType;
}

function toggleRepeating() {
  if (isRepeating.value) {
    config.value.type = config.value.type.replace(
      "repeating-",
      "",
    ) as GradientType;
  } else {
    config.value.type = `repeating-${config.value.type}` as GradientType;
  }
}

// --- Template Refs (Vue 3.5+) ---
// Note: "angle" no longer conflicts because there is no standalone `angle` ref —
// the angle data lives in config.value.angle, so ref="angle" correctly
// resolves to useTemplateRef only.
const pickerRef = useTemplateRef<HTMLElement>("picker");
const sliderRef = useTemplateRef<HTMLElement>("slider");
const angleRef = useTemplateRef<HTMLElement>("angle");

// --- Element Bounding ---
const {
  width: pickerW,
  height: pickerH,
  left: pickerL,
  top: pickerT,
} = useElementBounding(pickerRef);
const { width: sliderWidth, left: sliderLeft } = useElementBounding(sliderRef);
const {
  left: angleL,
  top: angleT,
  width: angleW,
  height: angleH,
} = useElementBounding(angleRef);

// --- Drag State ---
const dragTarget = ref<DragTarget>(null);

// --- Computed ---
const activeStop = computed(() =>
  config.value.stops.find((s) => s.id === activeStopId.value),
);

const activeAlpha = computed({
  get: () => activeStop.value?.alpha ?? 100,
  set: (val: number) => {
    if (activeStop.value) activeStop.value.alpha = val;
  },
});

const gradientPreview = computed(() => {
  const sortedStops = [...config.value.stops].sort(
    (a, b) => a.position - b.position,
  );
  const stops = sortedStops
    .map((s) => {
      const rgb = hexToRgb(s.color);
      if (rgb)
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${s.alpha / 100}) ${s.position}%`;
      return `${s.color} ${s.position}%`;
    })
    .join(", ");
  const fn = isRepeating.value
    ? "repeating-linear-gradient"
    : "linear-gradient";
  return `${fn}(to right, ${stops})`;
});

// --- Update Logic ---
const updateFromHsv = () => {
  const { h, s, v } = activeColorHsv.value;
  const { r, g, b } = hsvToRgb(h, s, v);
  activeColorRgb.value = { r, g, b };
  const hex = rgbToHex(r, g, b).toUpperCase();
  activeColorHex.value = hex;
  if (activeStop.value) activeStop.value.color = hex;
};

const updateColorFromRgb = () => {
  const r = clamp(Number(activeColorRgb.value.r) || 0, 0, 255);
  const g = clamp(Number(activeColorRgb.value.g) || 0, 0, 255);
  const b = clamp(Number(activeColorRgb.value.b) || 0, 0, 255);
  activeColorHsv.value = rgbToHsv(r, g, b);
  const hex = rgbToHex(r, g, b).toUpperCase();
  activeColorHex.value = hex;
  if (activeStop.value) activeStop.value.color = hex;
};

const updateColorFromHex = () => {
  const normalized = normalizeHex(activeColorHex.value).toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(normalized)) {
    const rgb = hexToRgb(normalized);
    if (rgb) {
      activeColorRgb.value = rgb;
      activeColorHsv.value = rgbToHsv(rgb.r, rgb.g, rgb.b);
      if (activeStop.value) activeStop.value.color = normalized;
    }
  }
};

function addStop(e: MouseEvent) {
  const position = clamp(
    Math.round(((e.clientX - sliderLeft.value) / sliderWidth.value) * 100),
    0,
    100,
  );

  // Interpolate color & alpha from surrounding stops
  const sorted = [...config.value.stops].sort(
    (a, b) => a.position - b.position,
  );
  let left = sorted[0];
  let right = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (
      sorted[i]!.position <= position &&
      sorted[i + 1]!.position >= position
    ) {
      left = sorted[i]!;
      right = sorted[i + 1]!;
      break;
    }
  }

  let color = props.newStopColor ?? "#808080";
  let alpha = 100;
  if (!props.newStopColor) {
    if (left && right && left.id !== right.id) {
      const range = right.position - left.position;
      const t = range === 0 ? 0.5 : (position - left.position) / range;
      const lRgb = hexToRgb(left.color);
      const rRgb = hexToRgb(right.color);
      if (lRgb && rRgb) {
        color = rgbToHex(
          Math.round(lRgb.r + (rRgb.r - lRgb.r) * t),
          Math.round(lRgb.g + (rRgb.g - lRgb.g) * t),
          Math.round(lRgb.b + (rRgb.b - lRgb.b) * t),
        ).toUpperCase();
      }
      alpha = Math.round(left.alpha + (right.alpha - left.alpha) * t);
    } else if (left) {
      color = left.color;
      alpha = left.alpha;
    }
  }

  const newId = Math.max(...config.value.stops.map((s) => s.id)) + 1;
  config.value.stops.push({ id: newId, color, position, alpha });
  activeStopId.value = newId;
}

function removeStop(id: number) {
  if (config.value.stops.length > 2) {
    config.value.stops = config.value.stops.filter((s) => s.id !== id);
    if (activeStopId.value === id) {
      activeStopId.value = config.value.stops[0]?.id ?? 1;
    }
  }
}

// --- Watchers ---
watch(
  activeStopId,
  () => {
    const stop = config.value.stops.find((s) => s.id === activeStopId.value);
    if (stop) {
      activeColorHex.value = stop.color;
      const rgb = hexToRgb(stop.color);
      if (rgb) {
        activeColorRgb.value = rgb;
        activeColorHsv.value = rgbToHsv(rgb.r, rgb.g, rgb.b);
      }
    }
  },
  { immediate: true },
);

watch(
  () => activeStop.value?.color,
  (newColor) => {
    if (newColor && newColor !== activeColorHex.value) {
      const normalized = normalizeHex(newColor).toUpperCase();
      if (/^#[0-9A-F]{6}$/.test(normalized)) {
        activeColorHex.value = normalized;
        const rgb = hexToRgb(normalized);
        if (rgb) {
          activeColorRgb.value = rgb;
          activeColorHsv.value = rgbToHsv(rgb.r, rgb.g, rgb.b);
        }
      }
    }
  },
  { immediate: true },
);

// --- Drag Position Handlers ---
const updatePickerPosition = (e: PointerEvent) => {
  if (!pickerRef.value) return;
  const x = clamp(e.clientX - pickerL.value, 0, pickerW.value);
  const y = clamp(e.clientY - pickerT.value, 0, pickerH.value);
  const s = (x / pickerW.value) * 100;
  const v = 100 - (y / pickerH.value) * 100;
  activeColorHsv.value = { ...activeColorHsv.value, s, v };
  updateFromHsv();
};

const updateAngle = (e: PointerEvent) => {
  const cx = angleL.value + angleW.value / 2;
  const cy = angleT.value + angleH.value / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  let deg = Math.atan2(dy, dx) * (180 / Math.PI);
  let cssAngle = deg + 90;
  if (cssAngle < 0) cssAngle += 360;
  config.value.angle = Math.round(cssAngle);
};

const updateStopPosition = (e: PointerEvent) => {
  const stop = config.value.stops.find((s) => s.id === activeStopId.value);
  if (!stop) return;
  let newPos = ((e.clientX - sliderLeft.value) / sliderWidth.value) * 100;
  newPos = Math.max(0, Math.min(100, newPos));
  stop.position = Math.round(newPos);
};

// --- Unified Drag ---
const dragHandlers: Record<string, (e: PointerEvent) => void> = {
  picker: updatePickerPosition,
  angle: updateAngle,
};

function startDrag(target: DragTarget, e: PointerEvent, stopId?: number) {
  dragTarget.value = target;
  if (stopId !== undefined) activeStopId.value = stopId;
  e.preventDefault();
  // Capture pointer for reliable tracking even outside the element
  (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
  if (target && dragHandlers[target]) dragHandlers[target](e);
}

if (import.meta.client) {
  useEventListener(window, "pointermove", (e: PointerEvent) => {
    if (!dragTarget.value) return;
    const handler =
      dragTarget.value === "stop"
        ? updateStopPosition
        : dragHandlers[dragTarget.value];
    handler?.(e);
  });
  useEventListener(window, "pointerup", () => {
    dragTarget.value = null;
  });
}

// --- Presets ---
const presets = [
  "linear-gradient(90deg, #2A7B9B 0%, #57C785 50%, #EDDD53 100%)",
  "linear-gradient(90deg, #020024 0%, #090979 35%, #00D4FF 100%)",
  "linear-gradient(0deg, #22C1C3 0%, #FDBB2D 100%)",
  "radial-gradient(circle, #3F5EFB 0%, #FC466B 100%)",
  "conic-gradient(from 0deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)",
  "radial-gradient(circle, #EEAECA 0%, #94BBE9 100%)",
];
</script>

<template>
  <div class="@container bg-white font-medium">
    <!-- Gradient Slider & Controls Section -->
    <div
      id="slider"
      class="flex flex-col @3xl:flex-row @3xl:items-center gap-x-8 @5xl:gap-x-12 gap-y-8.5 @3xl:px-6 @5xl:px-8 py-6"
    >
      <!-- Gradient Bar Slider -->
      <div class="flex-1 relative px-6 @3xl:px-0">
        <div
          ref="slider"
          class="relative h-6 cursor-copy ring-2 ring-black ring-offset-2 rounded-md touch-none select-none"
          @click="addStop($event)"
        >
          <!-- Checkerboard background for alpha -->
          <div
            class="absolute inset-0 z-10 rounded-md bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAjyQc6jlQMgAAnadNMmn3ZPIAAAAASUVORK5CYII=')] opacity-20"
          ></div>
          <!-- The Gradient Preview inside the bar -->
          <div
            class="absolute inset-0 rounded-md z-10"
            :style="{
              background: gradientPreview,
            }"
          ></div>

          <!-- Thumbs (Stops) -->
          <div
            v-for="stop in config.stops"
            :key="stop.id"
            class="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center group"
            :style="{ left: `calc(${stop.position}% - 6px)` }"
            @pointerdown="startDrag('stop', $event, stop.id)"
            @click.stop
          >
            <div
              class="w-4 h-11 rounded-full cursor-move border-2 border-black inset-ring-2 inset-ring-white transition-all ring-4"
              :class="
                activeStopId === stop.id
                  ? 'ring-black/25 z-30 scale-110'
                  : 'ring-transparent hover:ring-black/25'
              "
              :style="{ backgroundColor: stop.color }"
            ></div>
            <div
              v-if="activeStopId === stop.id || dragTarget === 'stop'"
              class="absolute -bottom-10 bg-white border border-black rounded px-1 py-0.5 text-xs font-mono shadow-sm z-50 pointer-events-none"
            >
              {{ Math.round(stop.position) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Controls: Type, Angle, Presets -->
      <div
        class="flex flex-col @2xl:flex-row @2xl:items-center justify-between @3xl:justify-start gap-x-6 @5xl:gap-x-12 gap-y-6 px-5 @2xl:px-6 @3xl:px-0 pt-9 @3xl:pt-0 border-t border-neutral-200 @3xl:border-none"
      >
        <!-- Type & Repeating -->
        <div class="flex items-center gap-x-2">
          <UFieldGroup>
            <UButton
              color="neutral"
              :variant="baseType === 'linear-gradient' ? 'subtle' : 'outline'"
              :label="$t('gradient.linear')"
              @click="setBaseType('linear-gradient')"
            />
            <UButton
              color="neutral"
              :variant="baseType === 'radial-gradient' ? 'subtle' : 'outline'"
              :label="$t('gradient.radial')"
              @click="setBaseType('radial-gradient')"
            />
            <UButton
              color="neutral"
              :variant="baseType === 'conic-gradient' ? 'subtle' : 'outline'"
              :label="$t('gradient.conic')"
              @click="setBaseType('conic-gradient')"
            />
          </UFieldGroup>
          <UButton
            color="neutral"
            :variant="isRepeating ? 'subtle' : 'outline'"
            icon="i-lucide-repeat"
            :label="$t('gradient.repeat')"
            size="sm"
            @click="toggleRepeating"
          />
        </div>

        <!-- Angle -->
        <div class="flex gap-x-2 items-center">
          <div
            ref="angle"
            class="relative w-9 h-9 rounded-full border-2 border-black cursor-pointer bg-white"
            @pointerdown="startDrag('angle', $event)"
          >
            <div
              class="absolute w-2 h-2 bg-black rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              :style="{
                transform: `rotate(${config.angle - 90}deg) translate(12px) rotate(${-(config.angle - 90)}deg)`,
              }"
            ></div>
          </div>
          <UInputNumber
            v-model="config.angle"
            color="neutral"
            :increment="false"
            :decrement="false"
            placeholder="Angle"
            class="w-16"
          />
        </div>
      </div>
    </div>

    <!-- Editor: Picker & Stops -->
    <div
      id="editor"
      class="flex flex-col @2xl:flex-row gap-6 border-t border-neutral-200 px-5 @2xl:px-6 @5xl:px-8 py-5 @2xl:py-8"
    >
      <!-- Picker Section -->
      <div class="flex-1 flex flex-col @2xl:flex-row gap-6 mb-2 @2xl:mb-0">
        <!-- Color Canvas -->
        <div class="flex-1 flex flex-col gap-y-2">
          <div
            class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
          >
            Picker
          </div>
          <div
            ref="picker"
            id="color-canvas"
            class="touch-none relative aspect-video @2xl:aspect-[5/4] @3xl:aspect-video @5xl:aspect-[5/4] w-full overscroll-none rounded-sm border border-neutral-200 cursor-crosshair"
            :style="{
              background: `linear-gradient(to bottom, transparent 0%, #000 100%), linear-gradient(to left, transparent 0%, #fff 100%), hsl(${activeColorHsv.h}, 100%, 50%)`,
            }"
            @pointerdown="startDrag('picker', $event)"
          >
            <div
              class="absolute z-50 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white ring-[3px] ring-black shadow-sm pointer-events-none"
              :style="{
                background: activeColorHex,
                left: `${activeColorHsv.s}%`,
                top: `${100 - activeColorHsv.v}%`,
              }"
            ></div>
          </div>
        </div>

        <!-- Inputs & Sliders -->
        <div class="@3xl:min-w-64 @5xl:min-w-auto flex-1 flex flex-col gap-y-4">
          <!-- Hex & RGBA Inputs -->
          <div class="flex flex-col gap-y-4">
            <UFormField
              label="Hex"
              :ui="{
                label:
                  'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
              }"
            >
              <UInput
                v-model="activeColorHex"
                color="neutral"
                class="uppercase"
                @update:model-value="updateColorFromHex"
              />
            </UFormField>
            <div class="flex flex-1 gap-x-2">
              <UFormField
                label="R"
                class="flex-1"
                :ui="{
                  label:
                    'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
                }"
              >
                <UInputNumber
                  v-model="activeColorRgb.r"
                  color="neutral"
                  :min="0"
                  :max="255"
                  :increment="false"
                  :decrement="false"
                  @update:model-value="updateColorFromRgb"
                />
              </UFormField>
              <UFormField
                label="G"
                class="flex-1"
                :ui="{
                  label:
                    'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
                }"
              >
                <UInputNumber
                  v-model="activeColorRgb.g"
                  color="neutral"
                  :min="0"
                  :max="255"
                  :increment="false"
                  :decrement="false"
                  @update:model-value="updateColorFromRgb"
                />
              </UFormField>
              <UFormField
                label="B"
                class="flex-1"
                :ui="{
                  label:
                    'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
                }"
              >
                <UInputNumber
                  v-model="activeColorRgb.b"
                  color="neutral"
                  :min="0"
                  :max="255"
                  :increment="false"
                  :decrement="false"
                  @update:model-value="updateColorFromRgb"
                />
              </UFormField>
              <UFormField
                label="A"
                class="flex-1"
                :ui="{
                  label:
                    'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
                }"
              >
                <UInputNumber
                  v-model="activeAlpha"
                  color="neutral"
                  :min="0"
                  :max="100"
                  :increment="false"
                  :decrement="false"
                />
              </UFormField>
            </div>
          </div>

          <!-- Sliders (Hue & Alpha) -->
          <div class="flex flex-col gap-y-6 mt-2">
            <!-- Hue Slider -->
            <USlider
              :model-value="activeColorHsv.h"
              :min="0"
              :max="360"
              color="neutral"
              @update:model-value="
                (val) => {
                  if (val != null) {
                    activeColorHsv = { ...activeColorHsv, h: val };
                    updateFromHsv();
                  }
                }
              "
              :ui="{
                track:
                  'h-3 rounded-md [background:linear-gradient(to_right,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)]',
                range: '!bg-transparent',
                thumb: 'ring-black bg-white',
              }"
            />

            <!-- Alpha Slider -->
            <div
              :style="{
                '--alpha-bg': `linear-gradient(to right, rgba(${activeColorRgb.r}, ${activeColorRgb.g}, ${activeColorRgb.b}, 0), rgb(${activeColorRgb.r}, ${activeColorRgb.g}, ${activeColorRgb.b}))`,
              }"
            >
              <USlider
                :model-value="activeAlpha"
                :min="0"
                :max="100"
                color="neutral"
                @update:model-value="
                  (val) => {
                    if (val != null) activeAlpha = val;
                  }
                "
                :ui="{
                  track: 'h-3 rounded-md [background:var(--alpha-bg)]',
                  range: '!bg-transparent',
                  thumb: 'ring-black bg-white',
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <USeparator orientation="vertical" class="hidden @2xl:flex" />
      <USeparator class="@2xl:hidden" />

      <!-- Stops List -->
      <div class="flex flex-col gap-y-2 min-w-[216px]">
        <div
          class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
        >
          Stops
        </div>
        <div class="flex flex-col -mx-2">
          <!-- Stop Item -->
          <div
            v-for="stop in config.stops"
            :key="stop.id"
            class="p-2 rounded-md flex gap-x-2 hover:bg-neutral-100 transition-all items-center"
            :class="{ 'bg-neutral-100': activeStopId === stop.id }"
            @click="activeStopId = stop.id"
          >
            <div
              class="shrink-0 w-9 h-9 rounded-sm transition-all cursor-pointer border border-black/10 ring-1 ring-black/5"
              :style="{ backgroundColor: stop.color }"
            ></div>
            <UInput
              v-model="stop.color"
              color="neutral"
              class="w-2/3 @2xl:w-27"
            />
            <UInputNumber
              v-model="stop.position"
              color="neutral"
              :min="0"
              :max="100"
              :increment="false"
              :decrement="false"
              class="w-1/3 @2xl:w-14"
            />
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              square
              :disabled="config.stops.length <= 2"
              @click.stop="removeStop(stop.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
