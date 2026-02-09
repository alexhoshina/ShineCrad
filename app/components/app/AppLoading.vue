<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** 是否显示加载动画 */
    show?: boolean;
    /** 加载提示文本 */
    text?: string;
  }>(),
  {
    show: true,
    text: "",
  },
);
</script>

<template>
  <Transition name="loading-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-neutral-950"
    >
      <!-- 默认: 简单的脉冲动画 -->
      <div class="flex flex-col items-center gap-y-6">
        <!-- Logo / 图标 -->
        <div class="relative">
          <div
            class="size-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse"
          >
            <UIcon name="i-lucide-sparkles" class="size-8 text-primary" />
          </div>
          <!-- 光环效果 -->
          <div
            class="absolute inset-0 size-16 rounded-2xl bg-primary/5 animate-ping"
          />
        </div>

        <!-- Loading Text -->
        <div
          v-if="text"
          class="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse"
        >
          {{ text }}
        </div>

        <!-- 进度点 -->
        <div class="flex items-center gap-x-1.5">
          <span
            v-for="i in 3"
            :key="i"
            class="size-2 rounded-full bg-primary/60"
            :style="{ animationDelay: `${(i - 1) * 150}ms` }"
            :class="'animate-bounce'"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
