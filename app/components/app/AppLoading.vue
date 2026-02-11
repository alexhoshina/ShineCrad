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
      <div class="loader"></div>
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
/* HTML: <div class="loader"></div> */
.loader {
  width: 100px;
  aspect-ratio: 1;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  background: #fff;
  filter: blur(5px) contrast(10);
  mix-blend-mode: darken;
}
.loader:before,
.loader:after{
  content: "";
  grid-area: 1/1;
  background:
    linear-gradient(#000 0 0) left,
    linear-gradient(#000 0 0) right;
  background-size: 20px 40px;
  background-origin: content-box;
  background-repeat: no-repeat;
}
.loader:after {
  height: 20px;
  width:  20px;
  margin: auto 0;
  border-radius: 50%;
  background: #000;
  animation: l10 1s infinite;
}
@keyframes l10{
  90%,100% {transform: translate(300%)}
}
</style>
