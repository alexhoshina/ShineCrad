<script setup lang="ts">
import type { ParallaxLayer } from "#layers/shine-card/app/utils/shine-card-types";
import {
  effectToConfig,
  getLayerMask,
  resolveLayerEffect,
} from "~/utils/editor-convert";

const { t } = useI18n();
const { defaultScheme } = useCardSchemes();

// 加载状态

const isCardReady = ref(false);

function onCardReady() {
  isCardReady.value = true;
}

// 计算图层

const computedLayers = computed<ParallaxLayer[]>(() => {
  const scheme = defaultScheme.value;
  return scheme.layers.map((layer) => ({
    id: layer.id,
    img: layer.img,
    zHeight: layer.zHeight,
    mask: getLayerMask(layer),
    shineEffects: effectToConfig(resolveLayerEffect(layer.shine, scheme)),
    glareEffects: effectToConfig(resolveLayerEffect(layer.glare, scheme)),
  }));
});

const schemeName = computed(() => defaultScheme.value.name);

// SEO

useSeoMeta({
  title: "ShineCard",
});
</script>

<template>
  <div class="flex items-center justify-center h-full p-4 lg:p-8">
    <AppLoading :show="!isCardReady" />

    <!-- 卡片展示 -->
    <ShineCard
      :layers="computedLayers"
      :width="'min(calc(100vw - 6rem), calc((100vh - 12rem) * 2.5 / 3.5))'"
      @ready="onCardReady"
    />
  </div>
</template>
