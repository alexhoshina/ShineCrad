import { Gesture } from "@use-gesture/vanilla";
import { useElementBounding, useElementHover } from "@vueuse/core";
import gsap from "gsap";

/**
 * 管理卡片的手势交互与指针追踪
 * 封装 `@use-gesture/vanilla` 手势识别、useElementHover 悬停检测、
 * useElementBounding 边界计算，以及 RAF 节流的指针运动更新。
 */
export function useCardGesture(cardElement: Readonly<Ref<HTMLElement | null>>) {
  const isHovering = useElementHover(cardElement);
  const isDragging = shallowRef(false);

  /**
   * 综合交互状态：悬停或拖拽中
   */
  const isInteracting = computed(() => isHovering.value || isDragging.value);

  const {
    left: boundLeft,
    top: boundTop,
    width: boundWidth,
    height: boundHeight,
  } = useElementBounding(cardElement);

  let rafId: number | null = null;
  let pendingCoords: [number, number] | null = null;

  /**
   * 更新卡片运动状态（使用 RAF 节流优化）
   *
   * 确保每帧只更新一次，避免高频事件导致的性能问题
   */
  function updateCardMovement(pointerCoords: [number, number]): void {
    pendingCoords = pointerCoords;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      if (!cardElement.value || !pendingCoords) return;

      const coords = pendingCoords;
      pendingCoords = null;
      rafId = null;

      const x = coords[0] - boundLeft.value;
      const y = coords[1] - boundTop.value;
      const width = boundWidth.value;
      const height = boundHeight.value;

      // 归一化坐标（0-1）
      const cursorRatioX = Math.max(0, Math.min(1, x / width));
      const cursorRatioY = Math.max(0, Math.min(1, y / height));

      // 中心偏移
      const centerOffsetX = cursorRatioX - 0.5;
      const centerOffsetY = cursorRatioY - 0.5;

      // 旋转角度
      const targetRx = centerOffsetY * 30;
      const targetRy = -centerOffsetX * 30;

      // 距离中心的强度
      const distanceFromCenter = Math.min(
        Math.sqrt(
          centerOffsetX * centerOffsetX + centerOffsetY * centerOffsetY,
        ) * 1.414,
        1,
      );

      // 阴影偏移
      const shadowOffsetX = centerOffsetX * 100;
      const shadowOffsetY = centerOffsetY * 100;

      gsap.to(cardElement.value, {
        "--rx": `${targetRx}deg`,
        "--ry": `${targetRy}deg`,
        "--pointer-x": `${cursorRatioX * 100}%`,
        "--pointer-y": `${cursorRatioY * 100}%`,
        "--intensity": distanceFromCenter,
        "--shadow-x": `${shadowOffsetX}px`,
        "--shadow-y": `${shadowOffsetY}px`,
        duration: 0.3,
        overwrite: "auto",
      });
    });
  }

  // 手势生命周期

  let gestureInstance: Gesture | null = null;

  onMounted(() => {
    if (!cardElement.value) return;

    gestureInstance = new Gesture(
      cardElement.value,
      {
        onDrag: ({ active, xy }) => {
          isDragging.value = active;
          if (active) updateCardMovement(xy);
        },
        onMove: ({ xy }) => {
          if (isInteracting.value && !isDragging.value) {
            updateCardMovement(xy);
          }
        },
      },
      { eventOptions: { passive: false } },
    );
  });

  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    pendingCoords = null;
    gestureInstance?.destroy();
    gestureInstance = null;
  });

  return {
    isDragging,
    isInteracting,
  };
}
