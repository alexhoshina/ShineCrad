<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import type { GradientConfig, GradientType } from "~/utils/gradient";
import { toGradientOutput } from "~/utils/gradient";
import type {
  PosAxisConfig,
  PosAxisMode,
  SizeMode,
  EditorGradientSource,
  EditorLayerEffect,
} from "~/utils/editor-types";

type SourceType = EditorGradientSource["sourceType"];

// 属性与模型

const props = defineProps<{
  label: string;
  icon?: string;
}>();

const effect = defineModel<EditorLayerEffect>({ required: true });

// 状态

const expandedSourceId = ref<number | null>(null);
let sourceIdCounter = Math.max(0, ...effect.value.sources.map((s) => s.id)) + 1;

// 混合模式选项

const blendModeOptions = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
].map((v) => ({ label: v, value: v }));

const sizeKeywordOptions = [
  { label: "cover", value: "cover" },
  { label: "contain", value: "contain" },
  { label: "auto", value: "auto" },
];

const posPresetOptions = [
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "top left",
  "top right",
  "bottom left",
  "bottom right",
].map((v) => ({ label: v, value: v }));

const posValueItems = ["0%", "25%", "50%", "75%", "100%"];

const cssVarOptions = [
  { label: "--pointer-x", value: "--pointer-x" },
  { label: "--pointer-y", value: "--pointer-y" },
  { label: "--intensity", value: "--intensity" },
];

const bgRepeatOptions = [
  { label: "repeat", value: "repeat" },
  { label: "no-repeat", value: "no-repeat" },
  { label: "repeat-x", value: "repeat-x" },
  { label: "repeat-y", value: "repeat-y" },
  { label: "space", value: "space" },
  { label: "round", value: "round" },
];

// ==================== Source Management ====================

function createDefaultSource(
  type: SourceType = "gradient",
): EditorGradientSource {
  return {
    id: sourceIdCounter++,
    sourceType: type,
    imageUrl: "",
    gradientConfig: {
      type: "linear-gradient",
      angle: 45,
      stops: [
        { id: 1, color: "#FFFFFF", position: 0, alpha: 0 },
        { id: 2, color: "#FFFFFF", position: 50, alpha: 80 },
        { id: 3, color: "#FFFFFF", position: 100, alpha: 0 },
      ],
    },
    sizeMode: "keyword",
    sizeKeyword: "cover",
    sizeW: 100,
    sizeH: 100,
    posMode: "preset",
    posPreset: "center",
    posX: {
      mode: "value",
      value: "50%",
      variable: "--pointer-x",
      calcFactor: 1,
    },
    posY: {
      mode: "value",
      value: "50%",
      variable: "--pointer-y",
      calcFactor: 1,
    },
    repeat: "repeat",
    blendMode: "normal",
  };
}

function addSource(type: SourceType = "gradient") {
  const newSource = createDefaultSource(type);
  effect.value.sources.push(newSource);
  expandedSourceId.value = newSource.id;
}

function removeSource(id: number) {
  effect.value.sources = effect.value.sources.filter((s) => s.id !== id);
  if (expandedSourceId.value === id) {
    expandedSourceId.value = null;
  }
}

function toggleSourceExpand(id: number) {
  expandedSourceId.value = expandedSourceId.value === id ? null : id;
}

// ==================== Preview ====================

function getSourcePreviewCSS(source: EditorGradientSource): string {
  if (source.sourceType === "image") {
    return source.imageUrl
      ? `url(${source.imageUrl}) center / cover no-repeat`
      : "linear-gradient(135deg, #e2e8f0, #cbd5e1)";
  }
  const output = toGradientOutput(source.gradientConfig);
  return `${output.type as string}(${output.value})`;
}
</script>

<template>
  <div class="flex flex-col gap-y-4">
    <!-- Header with Toggle -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-x-2">
        <UIcon v-if="icon" :name="icon" class="text-neutral-500 size-4" />
        <span class="text-sm font-semibold text-neutral-700">{{ label }}</span>
      </div>
      <USwitch v-model="effect.enabled" size="sm" />
    </div>

    <template v-if="effect.enabled">
      <!-- Effect-Level Properties -->
      <div class="flex flex-col gap-y-4 pl-1">
        <!-- Opacity -->
        <UFormField
          :label="$t('effect.opacity')"
          :ui="{
            label:
              'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
          }"
        >
          <div class="flex items-center gap-x-3">
            <USlider
              v-model="effect.opacity"
              :min="0"
              :max="100"
              color="neutral"
              class="flex-1"
            />
            <UInputNumber
              v-model="effect.opacity"
              color="neutral"
              :min="0"
              :max="100"
              :increment="false"
              :decrement="false"
              class="w-18"
            />
          </div>
        </UFormField>

        <!-- Mix Blend Mode -->
        <UFormField
          :label="$t('effect.mixBlendMode')"
          :ui="{
            label:
              'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
          }"
        >
          <USelect
            v-model="effect.mixBlendMode"
            :items="blendModeOptions"
            color="neutral"
            class="w-full"
          />
        </UFormField>

        <!-- Filter -->
        <UFormField
          :label="$t('effect.filter')"
          :ui="{
            label:
              'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
          }"
        >
          <UInput
            v-model="effect.filter"
            color="neutral"
            :placeholder="$t('effect.filterPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <!-- Mask -->
        <UFormField
          :label="$t('effect.maskImageUrl')"
          :ui="{
            label:
              'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
          }"
        >
          <UInput
            v-model="effect.mask"
            color="neutral"
            :placeholder="$t('effect.maskPlaceholder')"
            class="w-full"
          />
        </UFormField>
      </div>

      <USeparator />

      <!-- Background Sources (Gradient Layers) -->
      <div class="flex flex-col gap-y-3">
        <div class="flex items-center justify-between">
          <span
            class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
          >
            {{ $t("effect.backgroundLayers") }}
          </span>
          <div class="flex items-center gap-x-1">
            <UButton
              icon="i-lucide-plus"
              :label="$t('common.gradient')"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="addSource('gradient')"
            />
            <UButton
              icon="i-lucide-image"
              :label="$t('common.image')"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="addSource('image')"
            />
          </div>
        </div>

        <!-- Source List -->
        <VueDraggable
          v-model="effect.sources"
          handle=".drag-handle"
          :animation="150"
          class="flex flex-col gap-y-3"
        >
          <div
            v-for="(source, idx) in effect.sources"
            :key="source.id"
            class="border border-neutral-200 rounded-lg overflow-hidden"
          >
            <!-- Source Header -->
            <div
              class="flex items-center gap-x-2 px-3 py-2 bg-neutral-50 cursor-pointer hover:bg-neutral-100 transition-colors"
              @click="toggleSourceExpand(source.id)"
            >
              <!-- Drag Handle -->
              <UIcon
                name="i-lucide-grip-vertical"
                class="drag-handle size-4 text-neutral-400 cursor-grab active:cursor-grabbing shrink-0"
                @click.stop
              />
              <!-- Preview Swatch -->
              <div
                class="shrink-0 w-6 h-6 rounded border border-neutral-300"
                :style="{ background: getSourcePreviewCSS(source) }"
              />
              <span class="flex-1 text-sm font-medium text-neutral-700">
                {{ $t("common.layer") }} {{ idx + 1 }}
                <span class="text-xs text-neutral-400 ml-1">{{
                  source.sourceType === "image"
                    ? "image"
                    : source.gradientConfig.type
                }}</span>
              </span>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                square
                @click.stop="removeSource(source.id)"
              />
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 text-neutral-400 transition-transform"
                :class="{ 'rotate-180': expandedSourceId === source.id }"
              />
            </div>

            <!-- Source Editor (Expanded) -->
            <div
              v-if="expandedSourceId === source.id"
              class="border-t border-neutral-200"
            >
              <!-- Source Type Selector -->
              <div
                class="flex items-center gap-x-2 px-4 py-3 border-b border-neutral-200 bg-neutral-50/30"
              >
                <span
                  class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
                  >{{ $t("common.type") }}</span
                >
                <div class="flex-1" />
                <UFieldGroup size="xs">
                  <UButton
                    :label="$t('common.gradient')"
                    icon="i-lucide-blend"
                    :color="
                      source.sourceType === 'gradient' ? 'primary' : 'neutral'
                    "
                    :variant="
                      source.sourceType === 'gradient' ? 'solid' : 'outline'
                    "
                    @click="source.sourceType = 'gradient'"
                  />
                  <UButton
                    :label="$t('common.image')"
                    icon="i-lucide-image"
                    :color="
                      source.sourceType === 'image' ? 'primary' : 'neutral'
                    "
                    :variant="
                      source.sourceType === 'image' ? 'solid' : 'outline'
                    "
                    @click="source.sourceType = 'image'"
                  />
                </UFieldGroup>
              </div>

              <!-- Gradient Generator -->
              <GradientGenerator
                v-if="source.sourceType === 'gradient'"
                v-model="source.gradientConfig"
              />

              <!-- Image URL Input -->
              <div v-else class="px-4 py-3">
                <UFormField
                  :label="$t('editor.imageUrl')"
                  :ui="{
                    label:
                      'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
                  }"
                >
                  <UInput
                    v-model="source.imageUrl"
                    color="neutral"
                    :placeholder="$t('editor.imagePlaceholder')"
                    icon="i-lucide-image"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <!-- Additional CSS Properties -->
              <div
                class="flex flex-col gap-y-4 px-4 py-3 border-t border-neutral-200 bg-neutral-50/50"
              >
                <div
                  class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
                >
                  {{ $t("effect.backgroundProperties") }}
                </div>

                <!-- Size -->
                <div class="flex flex-col gap-y-2">
                  <div class="flex items-center gap-x-2">
                    <span class="text-xs text-neutral-500 font-semibold">{{
                      $t("common.size")
                    }}</span>
                    <div class="flex-1" />
                    <UFieldGroup size="xs">
                      <UButton
                        :label="$t('effect.keyword')"
                        :color="
                          source.sizeMode === 'keyword' ? 'primary' : 'neutral'
                        "
                        :variant="
                          source.sizeMode === 'keyword' ? 'solid' : 'outline'
                        "
                        @click="source.sizeMode = 'keyword'"
                      />
                      <UButton
                        :label="$t('effect.widthHeight')"
                        :color="
                          source.sizeMode === 'split' ? 'primary' : 'neutral'
                        "
                        :variant="
                          source.sizeMode === 'split' ? 'solid' : 'outline'
                        "
                        @click="source.sizeMode = 'split'"
                      />
                    </UFieldGroup>
                  </div>

                  <USelect
                    v-if="source.sizeMode === 'keyword'"
                    v-model="source.sizeKeyword"
                    :items="sizeKeywordOptions"
                    color="neutral"
                  />
                  <template v-else>
                    <div class="flex items-center gap-x-2">
                      <span
                        class="text-xs font-bold text-neutral-500 w-4 shrink-0"
                        >W</span
                      >
                      <USlider
                        v-model="source.sizeW"
                        :min="0"
                        :max="500"
                        color="neutral"
                        class="flex-1"
                      />
                      <UInputNumber
                        v-model="source.sizeW"
                        color="neutral"
                        :min="0"
                        :max="2000"
                        :increment="false"
                        :decrement="false"
                        class="w-20"
                      />
                      <span class="text-xs text-neutral-400 shrink-0">%</span>
                    </div>
                    <div class="flex items-center gap-x-2">
                      <span
                        class="text-xs font-bold text-neutral-500 w-4 shrink-0"
                        >H</span
                      >
                      <USlider
                        v-model="source.sizeH"
                        :min="0"
                        :max="500"
                        color="neutral"
                        class="flex-1"
                      />
                      <UInputNumber
                        v-model="source.sizeH"
                        color="neutral"
                        :min="0"
                        :max="2000"
                        :increment="false"
                        :decrement="false"
                        class="w-20"
                      />
                      <span class="text-xs text-neutral-400 shrink-0">%</span>
                    </div>
                  </template>
                </div>

                <!-- Position -->
                <div class="flex flex-col gap-y-2">
                  <div class="flex items-center gap-x-2">
                    <span class="text-xs text-neutral-500 font-semibold">{{
                      $t("common.position")
                    }}</span>
                    <div class="flex-1" />
                    <UFieldGroup size="xs">
                      <UButton
                        :label="$t('effect.preset')"
                        :color="
                          source.posMode === 'preset' ? 'primary' : 'neutral'
                        "
                        :variant="
                          source.posMode === 'preset' ? 'solid' : 'outline'
                        "
                        @click="source.posMode = 'preset'"
                      />
                      <UButton
                        :label="$t('effect.xyAxis')"
                        :color="
                          source.posMode === 'split' ? 'primary' : 'neutral'
                        "
                        :variant="
                          source.posMode === 'split' ? 'solid' : 'outline'
                        "
                        @click="source.posMode = 'split'"
                      />
                    </UFieldGroup>
                  </div>

                  <USelect
                    v-if="source.posMode === 'preset'"
                    v-model="source.posPreset"
                    :items="posPresetOptions"
                    color="neutral"
                  />
                  <template v-else>
                    <div
                      v-for="axis in [
                        { label: 'X', config: source.posX },
                        { label: 'Y', config: source.posY },
                      ]"
                      :key="axis.label"
                      class="flex flex-col gap-y-1"
                    >
                      <div class="flex items-center gap-x-2">
                        <span
                          class="text-xs font-bold text-neutral-500 w-4 shrink-0"
                          >{{ axis.label }}</span
                        >
                        <UFieldGroup size="xs">
                          <UButton
                            :label="$t('effect.val')"
                            :color="
                              axis.config.mode === 'value'
                                ? 'primary'
                                : 'neutral'
                            "
                            :variant="
                              axis.config.mode === 'value' ? 'solid' : 'outline'
                            "
                            @click="axis.config.mode = 'value'"
                          />
                          <UButton
                            :label="$t('effect.var')"
                            :color="
                              axis.config.mode === 'var' ? 'primary' : 'neutral'
                            "
                            :variant="
                              axis.config.mode === 'var' ? 'solid' : 'outline'
                            "
                            @click="axis.config.mode = 'var'"
                          />
                          <UButton
                            :label="$t('effect.calc')"
                            :color="
                              axis.config.mode === 'calc'
                                ? 'primary'
                                : 'neutral'
                            "
                            :variant="
                              axis.config.mode === 'calc' ? 'solid' : 'outline'
                            "
                            @click="axis.config.mode = 'calc'"
                          />
                        </UFieldGroup>
                      </div>
                      <div class="flex items-center gap-x-1.5 pl-6">
                        <template v-if="axis.config.mode === 'value'">
                          <UInputMenu
                            v-model="axis.config.value"
                            :items="posValueItems"
                            create-item="always"
                            color="neutral"
                            placeholder="e.g. 50%"
                            class="flex-1"
                          />
                        </template>
                        <template v-else-if="axis.config.mode === 'var'">
                          <span class="text-xs text-neutral-400 shrink-0"
                            >var(</span
                          >
                          <USelect
                            v-model="axis.config.variable"
                            :items="cssVarOptions"
                            color="neutral"
                            class="flex-1"
                          />
                          <span class="text-xs text-neutral-400 shrink-0"
                            >)</span
                          >
                        </template>
                        <template v-else>
                          <span class="text-xs text-neutral-400 shrink-0"
                            >calc( var(</span
                          >
                          <USelect
                            v-model="axis.config.variable"
                            :items="cssVarOptions"
                            color="neutral"
                            class="flex-1"
                          />
                          <span class="text-xs text-neutral-400 shrink-0"
                            >) ×</span
                          >
                          <UInputNumber
                            v-model="axis.config.calcFactor"
                            color="neutral"
                            :step="0.1"
                            :min="-10"
                            :max="10"
                            class="flex-1 min-w-[5rem]"
                          />
                          <span class="text-xs text-neutral-400 shrink-0"
                            >)</span
                          >
                        </template>
                      </div>
                    </div>
                  </template>
                </div>

                <!-- Repeat & Blend Mode -->
                <div class="flex flex-col gap-3">
                  <UFormField
                    :label="$t('effect.repeat')"
                    :ui="{ label: 'text-xs text-neutral-500 font-semibold' }"
                  >
                    <USelect
                      v-model="source.repeat"
                      :items="bgRepeatOptions"
                      color="neutral"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField
                    :label="$t('effect.blendMode')"
                    :ui="{ label: 'text-xs text-neutral-500 font-semibold' }"
                  >
                    <USelect
                      v-model="source.blendMode"
                      :items="blendModeOptions"
                      color="neutral"
                      class="w-full"
                    />
                  </UFormField>
                </div>
              </div>
            </div>
          </div>
        </VueDraggable>

        <!-- Empty State -->
        <div
          v-if="effect.sources.length === 0"
          class="text-center py-6 text-sm text-neutral-400 border border-dashed border-neutral-300 rounded-lg"
        >
          {{ $t("effect.noLayers") }}
        </div>
      </div>
    </template>
  </div>
</template>
