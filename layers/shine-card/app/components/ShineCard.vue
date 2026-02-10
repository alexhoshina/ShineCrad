<template>
  <div
    ref="cardElement"
    class="card"
    :class="{ 'card--interacting': isInteracting }"
    :data-card-id="scopeId"
    role="img"
    :aria-label="`3D card with ${layers.length} layer${layers.length > 1 ? 's' : ''}`"
  >
    <div class="card__rotator">
      <div
        v-for="(layer, index) in validatedLayers"
        :key="getLayerKey(layer)"
        class="card__layer"
        :data-index="index"
      >
        <!-- 卡面 -->
        <img
          :src="layer.img"
          crossorigin="anonymous"
          draggable="false"
          class="card__img"
          :alt="`Card layer ${index + 1}`"
          @error="handleImageError($event, index)"
          @load="onImageLoad($event, layer, index)"
        ></img>
        <!-- 闪光层 -->
        <div
          v-show="layer.shineEffects"
          class="card__shine"
          aria-hidden="true"
        />
        <!-- 高光层 -->
        <div
          v-show="layer.glareEffects"
          class="card__glare"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  BackgroundSource,
  EffectConfig,
  ParallaxLayer,
} from '../utils/shine-card-types'

// 为了向后兼容重新导出
export type { BackgroundSource, EffectConfig, ParallaxLayer }

interface ShineCardProps {
  /** 图层数据 */
  layers: ParallaxLayer[]
  /** 卡片宽度 */
  width?: string
  /** 外部强制交互状态（用于编辑器预览） */
  forceInteracting?: boolean
}

const props = withDefaults(defineProps<ShineCardProps>(), {
  width: '500px',
})

const emit = defineEmits<{
  /** 图片加载失败时触发 */
  error: [payload: { index: number, event: string | Event }]
  /** 图片加载成功时触发 */
  loaded: [index: number]
  /** 所有图层内容（图片 + 遮罩）加载完成时触发 */
  ready: []
}>()

// ==================== 图层验证 ====================

const validatedLayers = computed(() => {
  if (!props.layers?.length) {
    console.warn('[ShineCard] layers array is empty or undefined')
    return []
  }

  return props.layers.filter((layer, index) => {
    if (!layer?.img) return false
    if (typeof layer.zHeight !== 'number') {
      console.warn(`[ShineCard] Layer at index ${index} has invalid 'zHeight', must be a number`)
      return false
    }
    return true
  })
})

// ==================== 图层 Key 管理 ====================

const layerIdMap = new Map<ParallaxLayer, string>()
let uniqueIdCounter = 0

function getLayerKey(layer: ParallaxLayer): string {
  if (layer.id != null) return String(layer.id)

  let id = layerIdMap.get(layer)
  if (!id) {
    id = `layer-${Date.now()}-${uniqueIdCounter++}`
    layerIdMap.set(layer, id)
  }
  return id
}

// ==================== Composables ====================

const cardElement = useTemplateRef<HTMLElement>('cardElement')
const scopeId = useId()

// 遮罩管理
const { processMaskForImage, getLayerMaskStyle, hydrateExistingImages, pendingMaskCount } = useCardMask()

// 动画控制
const { setInteractingState, setIdleState, playEntranceAnimation } = useCardAnimation(cardElement)

// 手势与交互
const { isInteracting: gestureInteracting } = useCardGesture(cardElement)

/** 综合交互状态：手势交互 或 外部强制激活 */
const isInteracting = computed(() => gestureInteracting.value || props.forceInteracting)

// 动态样式注入
useCardDynamicStyle({
  scopeId,
  width: () => props.width,
  validatedLayers,
  getLayerMaskStyle,
})

// ==================== 加载状态追踪 ====================

const loadedImageCount = ref(0)
const errorImageCount = ref(0)

const isReady = computed(() => {
  const total = validatedLayers.value.length
  return total > 0
    && (loadedImageCount.value + errorImageCount.value) >= total
    && pendingMaskCount.value === 0
})

// 图层变化时重置加载计数
watch(validatedLayers, () => {
  loadedImageCount.value = 0
  errorImageCount.value = 0
}, { flush: 'pre' })

watch(isReady, (ready) => {
  if (ready) emit('ready')
})

// ==================== 交互状态 → 动画联动 ====================

watch(isInteracting, (active) => {
  if (active) setInteractingState()
  else setIdleState()
})

// ==================== 事件处理 ====================

function onImageLoad(event: Event, layer: ParallaxLayer, index: number): void {
  processMaskForImage(event, layer)
  loadedImageCount.value++
  emit('loaded', index)
}

function handleImageError(event: string | Event, index: number): void {
  console.error(`[ShineCard] Failed to load image for layer ${index}:`, event)
  errorImageCount.value++
  emit('error', { index, event })
}

// ==================== 生命周期 ====================

onMounted(() => {
  if (!cardElement.value) return
  playEntranceAnimation()
  const hydratedCount = hydrateExistingImages(cardElement.value, validatedLayers.value)
  loadedImageCount.value += hydratedCount
})

onUnmounted(() => {
  layerIdMap.clear()
})
</script>

<style src="~/assets/css/shine-card.css" scoped></style>
