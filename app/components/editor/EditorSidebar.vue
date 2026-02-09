<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import type { EditorLayerEffect } from "~/utils/editor-types";

const {
  layers,
  selectedLayerIndex,
  cardWidthNumber,
  selectedLayer,
  sharedEffects,
  maskModeOptions,
  activeScheme,
  addLayer,
  removeLayer,
  toggleLayerVisibility,
  getEffectMode,
  getSharedEffectOptions,
  setLayerEffectShared,
  setLayerEffectInline,
  getEditableEffect,
  addSharedEffect,
  removeSharedEffect,
} = useEditorStateInjection();

const expandedSharedEffectId = ref<string | null>(null);

function toggleSharedEffectExpand(id: string) {
  expandedSharedEffectId.value =
    expandedSharedEffectId.value === id ? null : id;
}
</script>

<template>
  <div class="flex flex-col pb-20">
    <!-- 卡片设置 -->
    <div class="p-4 border-b border-neutral-200 dark:border-neutral-800">
      <div
        class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none mb-3"
      >
        {{ $t("editor.cardSettings") }}
      </div>
      <UFormField
        :label="$t('editor.width')"
        :ui="{
          label:
            'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
        }"
      >
        <div class="flex items-center gap-x-3">
          <USlider
            v-model="cardWidthNumber"
            :min="100"
            :max="800"
            :step="10"
            color="neutral"
            class="flex-1"
          />
          <UInputNumber
            v-model="cardWidthNumber"
            color="neutral"
            :min="100"
            :max="2000"
            :step="10"
            :increment="false"
            :decrement="false"
            class="w-20"
          />
          <span class="text-xs text-neutral-400 shrink-0">px</span>
        </div>
      </UFormField>
    </div>

    <!-- Layer List -->
    <div class="p-4 border-b border-neutral-200 dark:border-neutral-800">
      <div class="flex items-center justify-between mb-3">
        <span
          class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
        >
          {{ $t("common.layer") }}
        </span>
        <UTooltip :text="$t('editor.addLayer')">
          <UButton
            icon="i-lucide-plus"
            color="neutral"
            variant="outline"
            size="xs"
            @click="addLayer()"
          />
        </UTooltip>
      </div>

      <VueDraggable
        v-model="layers"
        handle=".layer-drag-handle"
        :animation="150"
        class="flex flex-col gap-y-1"
      >
        <div
          v-for="(layer, i) in layers"
          :key="layer.id"
          class="flex items-center gap-x-2 px-3 py-2 rounded-md border cursor-pointer transition-colors"
          :class="
            selectedLayerIndex === i
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          "
          @click="selectedLayerIndex = i"
        >
          <UIcon
            name="i-lucide-grip-vertical"
            class="layer-drag-handle size-4 text-neutral-400 cursor-grab active:cursor-grabbing shrink-0"
            @click.stop
          />
          <!-- Layer Thumbnail -->
          <div
            class="size-6 rounded border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
          >
            <img
              v-if="layer.img"
              :src="layer.img"
              :alt="`Layer ${i + 1}`"
              class="size-full object-cover"
              loading="lazy"
              @error="
                ($event.target as HTMLImageElement).style.display = 'none'
              "
            />
            <UIcon
              v-else
              :name="i === 0 ? 'i-lucide-image' : 'i-lucide-layers'"
              class="size-3.5 text-neutral-400"
            />
          </div>
          <span
            class="flex-1 text-sm text-neutral-700 dark:text-neutral-300 truncate"
            :class="{ 'opacity-40': layer.visible === false }"
          >
            {{ $t("common.layer") }} {{ i + 1 }}
          </span>
          <UTooltip
            :text="
              layer.visible === false
                ? $t('editor.showLayer')
                : $t('editor.hideLayer')
            "
          >
            <UButton
              :icon="
                layer.visible === false ? 'i-lucide-eye-off' : 'i-lucide-eye'
              "
              :color="layer.visible === false ? 'neutral' : 'neutral'"
              :variant="layer.visible === false ? 'ghost' : 'ghost'"
              size="xs"
              square
              :class="{
                'opacity-40': layer.visible === false,
              }"
              @click.stop="toggleLayerVisibility(i)"
            />
          </UTooltip>
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            square
            :disabled="layers.length <= 1"
            @click.stop="removeLayer(i)"
          />
        </div>
      </VueDraggable>
    </div>

    <!-- Selected Layer Editor -->
    <div v-if="selectedLayer" class="flex flex-col">
      <!-- Layer Header -->
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
      >
        <span
          class="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          {{ $t("editor.layerSettings", { n: selectedLayerIndex + 1 }) }}
        </span>
      </div>

      <!-- Basic Properties -->
      <div
        class="p-4 flex flex-col gap-y-4 border-b border-neutral-200 dark:border-neutral-800"
      >
        <div
          class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
        >
          Basic
        </div>

        <!-- Image URL -->
        <UFormField
          :label="$t('editor.imageUrl')"
          :ui="{
            label:
              'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
          }"
        >
          <UInput
            v-model="selectedLayer.img"
            color="neutral"
            :placeholder="$t('editor.imagePlaceholder')"
            icon="i-lucide-image"
            class="w-full"
          />
        </UFormField>

        <!-- Z-Height -->
        <UFormField
          :label="$t('editor.zHeight')"
          :ui="{
            label:
              'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
          }"
        >
          <div class="flex items-center gap-x-3">
            <USlider
              v-model="selectedLayer.zHeight"
              :min="-100"
              :max="200"
              color="neutral"
              class="flex-1"
            />
            <UInputNumber
              v-model="selectedLayer.zHeight"
              color="neutral"
              :min="-100"
              :max="200"
              :increment="false"
              :decrement="false"
              class="w-20"
            />
            <span class="text-xs text-neutral-400">px</span>
          </div>
        </UFormField>

        <!-- Mask -->
        <UFormField
          :label="$t('editor.mask')"
          :ui="{
            label:
              'text-xs text-neutral-500 uppercase font-black tracking-wider leading-none',
          }"
        >
          <div class="flex flex-col gap-y-2">
            <USelect
              v-model="selectedLayer.maskMode"
              :items="maskModeOptions"
              color="neutral"
              class="w-full"
            />
            <UInput
              v-if="selectedLayer.maskMode === 'custom'"
              v-model="selectedLayer.maskUrl"
              color="neutral"
              placeholder="Mask image URL"
              class="w-full"
            />
          </div>
        </UFormField>
      </div>

      <!-- Shine Effects -->
      <div class="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-x-2 mb-3">
          <span
            class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
            >{{ $t("editor.effectSource") }}</span
          >
          <div class="flex-1" />
          <PresetLibrary
            target="shine"
            @apply="
              (effect) => {
                if (typeof selectedLayer!.shine === 'string' && activeScheme) {
                  const shared = activeScheme.sharedEffects.find(
                    (e) => e.id === selectedLayer!.shine,
                  );
                  if (shared) shared.effect = effect;
                } else {
                  selectedLayer!.shine = effect;
                }
              }
            "
          />
          <UFieldGroup size="xs">
            <UButton
              :label="$t('common.inline')"
              :color="
                getEffectMode(selectedLayer.shine) === 'inline'
                  ? 'primary'
                  : 'neutral'
              "
              :variant="
                getEffectMode(selectedLayer.shine) === 'inline'
                  ? 'solid'
                  : 'outline'
              "
              @click="setLayerEffectInline(selectedLayer, 'shine')"
            />
            <UButton
              :label="$t('common.shared')"
              :color="
                getEffectMode(selectedLayer.shine) === 'shared'
                  ? 'primary'
                  : 'neutral'
              "
              :variant="
                getEffectMode(selectedLayer.shine) === 'shared'
                  ? 'solid'
                  : 'outline'
              "
              :disabled="sharedEffects.length === 0"
              @click="
                sharedEffects.length > 0 &&
                setLayerEffectShared(
                  selectedLayer!,
                  'shine',
                  sharedEffects[0]!.id,
                )
              "
            />
          </UFieldGroup>
        </div>
        <template v-if="getEffectMode(selectedLayer.shine) === 'shared'">
          <USelect
            :model-value="selectedLayer.shine as string"
            :items="getSharedEffectOptions()"
            color="neutral"
            class="mb-3 w-48"
            @update:model-value="
              (val: string) =>
                setLayerEffectShared(selectedLayer!, 'shine', val)
            "
          />
        </template>
        <EffectEditor
          :model-value="getEditableEffect(selectedLayer, 'shine')"
          label="Shine Effects"
          icon="i-lucide-sparkles"
          @update:model-value="
            (val: EditorLayerEffect) => {
              if (typeof selectedLayer!.shine === 'string' && activeScheme) {
                const shared = activeScheme.sharedEffects.find(
                  (e) => e.id === selectedLayer!.shine,
                );
                if (shared) shared.effect = val;
              } else {
                selectedLayer!.shine = val;
              }
            }
          "
        />
      </div>

      <!-- Glare Effects -->
      <div class="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-x-2 mb-3">
          <span
            class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
            >{{ $t("editor.effectSource") }}</span
          >
          <div class="flex-1" />
          <PresetLibrary
            target="glare"
            @apply="
              (effect) => {
                if (typeof selectedLayer!.glare === 'string' && activeScheme) {
                  const shared = activeScheme.sharedEffects.find(
                    (e) => e.id === selectedLayer!.glare,
                  );
                  if (shared) shared.effect = effect;
                } else {
                  selectedLayer!.glare = effect;
                }
              }
            "
          />
          <UFieldGroup size="xs">
            <UButton
              :label="$t('common.inline')"
              :color="
                getEffectMode(selectedLayer.glare) === 'inline'
                  ? 'primary'
                  : 'neutral'
              "
              :variant="
                getEffectMode(selectedLayer.glare) === 'inline'
                  ? 'solid'
                  : 'outline'
              "
              @click="setLayerEffectInline(selectedLayer, 'glare')"
            />
            <UButton
              :label="$t('common.shared')"
              :color="
                getEffectMode(selectedLayer.glare) === 'shared'
                  ? 'primary'
                  : 'neutral'
              "
              :variant="
                getEffectMode(selectedLayer.glare) === 'shared'
                  ? 'solid'
                  : 'outline'
              "
              :disabled="sharedEffects.length === 0"
              @click="
                sharedEffects.length > 0 &&
                setLayerEffectShared(
                  selectedLayer!,
                  'glare',
                  sharedEffects[0]!.id,
                )
              "
            />
          </UFieldGroup>
        </div>
        <template v-if="getEffectMode(selectedLayer.glare) === 'shared'">
          <USelect
            :model-value="selectedLayer.glare as string"
            :items="getSharedEffectOptions()"
            color="neutral"
            class="mb-3 w-48"
            @update:model-value="
              (val: string) =>
                setLayerEffectShared(selectedLayer!, 'glare', val)
            "
          />
        </template>
        <EffectEditor
          :model-value="getEditableEffect(selectedLayer, 'glare')"
          label="Glare Effects"
          icon="i-lucide-sun"
          @update:model-value="
            (val: EditorLayerEffect) => {
              if (typeof selectedLayer!.glare === 'string' && activeScheme) {
                const shared = activeScheme.sharedEffects.find(
                  (e) => e.id === selectedLayer!.glare,
                );
                if (shared) shared.effect = val;
              } else {
                selectedLayer!.glare = val;
              }
            }
          "
        />
      </div>

      <!-- Shared Effects Manager -->
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
          >
            {{ $t("editor.sharedEffects") }}
          </span>
          <UTooltip :text="$t('common.add')">
            <UButton
              icon="i-lucide-plus"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="
                activeScheme &&
                addSharedEffect(
                  activeScheme,
                  `Effect ${sharedEffects.length + 1}`,
                )
              "
            />
          </UTooltip>
        </div>
        <div class="flex flex-col gap-y-2">
          <div
            v-for="se in sharedEffects"
            :key="se.id"
            class="bg-neutral-50 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            <!-- Shared Effect Header -->
            <div
              class="flex items-center gap-x-2 px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              @click="toggleSharedEffectExpand(se.id)"
            >
              <UIcon
                name="i-lucide-link"
                class="size-3.5 text-neutral-400 shrink-0"
              />
              <UInput
                :model-value="se.name"
                color="neutral"
                size="xs"
                class="flex-1"
                @click.stop
                @update:model-value="(val: string) => (se.name = val)"
              />
              <UTooltip :text="$t('common.delete')">
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  square
                  @click.stop="
                    activeScheme && removeSharedEffect(activeScheme, se.id)
                  "
                />
              </UTooltip>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 text-neutral-400 transition-transform shrink-0"
                :class="{
                  'rotate-180': expandedSharedEffectId === se.id,
                }"
              />
            </div>
            <!-- Shared Effect Editor (Expanded) -->
            <div
              v-if="expandedSharedEffectId === se.id"
              class="border-t border-neutral-200 dark:border-neutral-700 p-3"
            >
              <EffectEditor
                v-model="se.effect"
                :label="se.name"
                icon="i-lucide-link"
              />
            </div>
          </div>
          <div
            v-if="sharedEffects.length === 0"
            class="text-center py-4 text-xs text-neutral-400"
          >
            {{ $t("editor.noSharedEffects") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
