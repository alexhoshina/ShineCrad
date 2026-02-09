import gsap from "gsap";

/**
 * 管理卡片的 GSAP 动画效果
 * 包含交互激活、闲置恢复和入场动画三种状态的动画控制。
 */
export function useCardAnimation(
  cardElement: Readonly<Ref<HTMLElement | null>>,
) {
  /**
   * 激活状态动画 — 展开图层并显示光效
   */
  function setInteractingState(): void {
    if (!cardElement.value) return;

    gsap.to(cardElement.value, {
      "--layer-spread": 1,
      "--layer-opacity": 1,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)",
      overwrite: true,
    });
  }

  /**
   * 闲置状态动画 — 重置旋转和阴影，播放光效扫过动画
   *
   * 动画从当前鼠标位置平滑过渡到预设路径，避免生硬跳变
   */
  function setIdleState(): void {
    if (!cardElement.value) return;

    const currentStyle = getComputedStyle(cardElement.value);
    const currentPointerX =
      currentStyle.getPropertyValue("--pointer-x").trim() || "50%";
    const currentPointerY =
      currentStyle.getPropertyValue("--pointer-y").trim() || "50%";
    const currentIntensity =
      currentStyle.getPropertyValue("--intensity").trim() || "0";
    const currentOpacity =
      currentStyle.getPropertyValue("--layer-opacity").trim() || "0";

    const tl = gsap.timeline({ overwrite: true });

    // 重置变换和阴影
    tl.to(
      cardElement.value,
      {
        "--rx": "0deg",
        "--ry": "0deg",
        "--shadow-x": "5px",
        "--shadow-y": "5px",
        "--layer-spread": 0,
        duration: 1.2,
        ease: "bounce.out",
      },
      0,
    );

    // 播放闲置光效动画，从当前鼠标位置平滑过渡
    tl.to(
      cardElement.value,
      {
        keyframes: {
          "0%": {
            "--pointer-x": currentPointerX,
            "--pointer-y": currentPointerY,
            "--intensity": currentIntensity,
            "--layer-opacity": currentOpacity,
          },
          "20%": { "--pointer-x": "100%", "--pointer-y": "20%" },
          "40%": { "--pointer-x": "20%", "--pointer-y": "100%" },
          "60%": { "--pointer-x": "20%", "--pointer-y": "20%" },
          "100%": {
            "--pointer-x": "50%",
            "--pointer-y": "50%",
            "--layer-opacity": 0,
            "--intensity": 0,
          },
        },
        duration: 1.5,
        ease: "power2.inOut",
      },
      0,
    );
  }

  /**
   * 入场动画 — 卡片从缩小翻转状态展开
   */
  function playEntranceAnimation(): void {
    if (!cardElement.value) return;

    gsap.set(cardElement.value, {
      autoAlpha: 0,
      scale: 0.5,
      rotateY: 180,
    });

    gsap.to(cardElement.value, {
      autoAlpha: 1,
      scale: 1,
      rotateY: 0,
      duration: 1.8,
      ease: "elastic.out(1, 0.75)",
      delay: 0,
    });
  }

  return {
    setInteractingState,
    setIdleState,
    playEntranceAnimation,
  };
}
