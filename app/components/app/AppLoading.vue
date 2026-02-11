<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** 是否显示加载动画 */
    show?: boolean;
    /** 主色调 (支持 Hex 或 Nuxt UI 颜色名如 'primary', 'blue') */
    color?: string;
    /** 次色调 (支持 Hex 或 Nuxt UI 颜色名) */
    secondaryColor?: string;
  }>(),
  {
    show: true,
    color: "primary",
    secondaryColor: "primary",
  },
);

const mainColor = computed(() => {
  if (!props.color) return `var(--ui-primary)`;
  if (props.color.startsWith("#") || props.color.startsWith("rgb"))
    return props.color;
  return `var(--ui-${props.color})`;
});

const subColor = computed(() => {
  if (props.secondaryColor) {
    if (
      props.secondaryColor.startsWith("#") ||
      props.secondaryColor.startsWith("rgb")
    )
      return props.secondaryColor;
    return `var(--ui-${props.secondaryColor})`;
  }
  if (
    props.color &&
    !props.color.startsWith("#") &&
    !props.color.startsWith("rgb")
  ) {
    return `var(--ui-${props.color})`;
  }
  return `var(--ui-primary)`;
});
</script>

<template>
  <Transition name="loading-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-neutral-950"
      :style="{
        '--loading-color': mainColor,
        '--loading-secondary-color': subColor,
      }"
    >
      <div class="mainWrap">
        <div class="wrapper">
          <div class="c1">
            <div class="c2">
              <div class="c3">
                <div class="rect1">
                  <div class="miniC"></div>
                  <div class="c4">
                    <div class="rect2"><div class="rect3"></div></div>
                  </div>
                  <div class="c5"></div>
                  <div class="c6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.8s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
/* From Uiverse.io by elijahgummer */
/* General Styles */
.mainWrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  perspective: 1000px; /* Perspective for 3D effect */
}

.mainWrap div {
  transform-origin: center center;
}

.wrapper {
  position: relative;
}

.c1 {
  border-radius: 100%;
  height: 20rem;
  width: 20rem;
  border: 0.2rem solid var(--loading-color);
  animation:
    rotFirst 30s linear infinite,
    fadeIn 2s forwards; /* Added fade-in animation */
  transform: translate(-50%, -50%);
  transform-style: preserve-3d; /* Enable 3D transforms */
}

.c1 .c2 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 3D perspective */
  border-radius: 100%;
  height: 19rem;
  width: 19rem;
  border: 0.2rem solid var(--loading-color);
  border-style: dashed;
}

.c1 .c2 .c3 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 3D perspective */
  border: 0.2rem solid var(--loading-color);
  height: 18rem;
  width: 18rem;
  border-radius: 100%;
  animation: changeColor 30s linear infinite;
}

.c1 .c2 .c3 .rect1 {
  border: 0.2rem solid var(--loading-color);
  border-style: dotted;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 3D perspective */
  height: 12rem;
  width: 12rem;
}

.c1 .c2 .c3 .rect1 .miniC {
  text-align: center;
  height: 12rem;
  width: 12rem;
  position: relative;
}

.c1 .c2 .c3 .rect1 .miniC .box {
  height: 1rem;
  width: 1rem;
  border: 0.2rem solid var(--loading-color);
  border-radius: 100%;
  margin: 0.4rem;
}

.c1 .c2 .c3 .rect1 .miniC .miniC1 {
  position: absolute;
  top: -12%;
  left: 50%;
  transform: translate(-50%, -50%); /* 3D perspective */
  height: 2rem;
  width: 2rem;
  border: 0.3rem solid var(--loading-color);
  border-radius: 100%;
  animation: changeColor 30s linear infinite;
}

.c1 .c2 .c3 .rect1 .miniC .miniC2 {
  position: absolute;
  top: 50%;
  left: -12%;
  transform: translate(-50%, -50%); /* 3D perspective */
  height: 2rem;
  width: 2rem;
  border: 0.3rem solid var(--loading-color);
  border-radius: 100%;
  animation: changeColor 30s linear infinite;
}

.c1 .c2 .c3 .rect1 .miniC .miniC3 {
  position: absolute;
  top: 50%;
  left: 112%;
  transform: translate(-50%, -50%); /* 3D perspective */
  height: 2rem;
  width: 2rem;
  border: 0.3rem solid var(--loading-color);
  border-radius: 100%;
  animation: changeColor 30s linear infinite;
}

.c1 .c2 .c3 .rect1 .miniC .miniC4 {
  position: absolute;
  top: 112%;
  left: 50%;
  transform: translate(-50%, -50%); /* 3D perspective */
  height: 2rem;
  width: 2rem;
  border: 0.3rem solid var(--loading-color);
  border-radius: 100%;
  animation: changeColor 30s linear infinite;
}

.c1 .c2 .c3 .rect1 .c4 {
  border: 0.2rem solid var(--loading-color);
  height: 12rem;
  width: 12rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 3D perspective */
  border-radius: 100%;
  border-style: dotted;
  animation: changeColor 30s linear infinite;
}

.c1 .c2 .c3 .rect1 .c4 .rect2 {
  border: 0.2rem solid var(--loading-color);
  height: 8rem;
  width: 8rem;
  margin: 2rem auto 0rem auto;
  animation: rotminiC 10s linear infinite;
}

.c1 .c2 .c3 .rect1 .c4 .rect3 {
  border: 0.2rem solid var(--loading-color);
  height: 8rem;
  width: 8rem;
  transform: rotate(135deg);
  transform-origin: center center;
}

.c1 .c2 .c3 .rect1 .c5 {
  border: 0.2rem solid var(--loading-color);
  height: 7rem;
  width: 7rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 3D perspective */
  border-radius: 100%;
  animation: changeColor 30s linear infinite;
}

.c1 .c2 .c3 .rect1 .c6 {
  border: 0.3rem solid var(--loading-color);
  height: 5rem;
  width: 5rem;
  animation: changeColor 30s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 3D perspective */
  border-radius: 100%;
}

/* Hover State */
.c1:hover,
.c1 .c2:hover,
.c1 .c2 .c3:hover {
  box-shadow: 0 0 2rem var(--loading-secondary-color);
  cursor: pointer;
  transition:
    transform 0.5s ease-in-out,
    box-shadow 0.5s ease-in-out;
}

/* Keyframes */
@keyframes rotFirst {
  0% {
    transform: rotate(-360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes rotminiC {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

@keyframes changeColor {
  0% {
    box-shadow: 0px 0px 7rem var(--loading-secondary-color);
    border: 0.3rem solid var(--loading-secondary-color);
  }
}

/* Fade-in animation for loading phase */
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
