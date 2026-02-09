import { useStyleTag } from "@vueuse/core";
import type { CSSProperties, MaybeRefOrGetter } from "vue";
import type { ParallaxLayer } from "../utils/shine-card-types";
import { cssPropsToDeclarations } from "../utils/css-helpers";
import { getLayerLayoutStyle, parseEffectToCSS } from "../utils/effect-style";

interface UseCardDynamicStyleOptions {
  /** 组件实例唯一标识，用于 CSS 作用域隔离 */
  scopeId: string;
  /** 卡片宽度 */
  width: MaybeRefOrGetter<string>;
  /** 已验证的图层数据 */
  validatedLayers: ComputedRef<ParallaxLayer[]>;
  /** 生成图层遮罩样式的函数（来自 useCardMask） */
  getLayerMaskStyle: (layer: ParallaxLayer) => CSSProperties;
}

/**
 * 管理卡片的动态 CSS 样式注入
 * 通过 `[data-card-id]` 属性选择器实现实例级作用域隔离，
 * 使用 `useStyleTag` 将计算后的 CSS 规则注入到 `<head>` 中。
 */
export function useCardDynamicStyle(options: UseCardDynamicStyleOptions) {
  const { scopeId, width, validatedLayers, getLayerMaskStyle } = options;

  const dynamicCSS = computed(() => {
    const scope = `[data-card-id="${scopeId}"]`;
    const rules: string[] = [];

    // 卡片宽度
    rules.push(`${scope} {\n  --card-width: ${toValue(width)};\n}`);

    // 每层图层样式
    validatedLayers.value.forEach((layer, index) => {
      const layerSel = `${scope} .card__layer[data-index="${index}"]`;

      // 图层深度
      const layoutDecl = cssPropsToDeclarations(getLayerLayoutStyle(layer));
      if (layoutDecl) {
        rules.push(`${layerSel} {\n${layoutDecl}\n}`);
      }

      // 闪光效果
      if (layer.shineEffects) {
        const shineDecl = cssPropsToDeclarations({
          ...getLayerMaskStyle(layer),
          ...parseEffectToCSS(layer.shineEffects),
        });
        if (shineDecl) {
          rules.push(`${layerSel} > .card__shine {\n${shineDecl}\n}`);
        }
      }

      // 高光效果
      if (layer.glareEffects) {
        const glareDecl = cssPropsToDeclarations({
          ...getLayerMaskStyle(layer),
          ...parseEffectToCSS(layer.glareEffects),
        });
        if (glareDecl) {
          rules.push(`${layerSel} > .card__glare {\n${glareDecl}\n}`);
        }
      }
    });

    return rules.join("\n\n");
  });

  useStyleTag(dynamicCSS);
}
