import type {
  BackgroundSource,
  EffectConfig,
} from "#layers/shine-card/app/utils/shine-card-types";
import type { CardScheme } from "./editor-types";

const ShineConfig1: BackgroundSource[] = [
  {
    type: "image",
    value: "https://s3.hi168.com/hi168-26327-7861xjfr/shine/b1.png",
    size: "50% 50%",
    position: "center",
    blendMode: "color-burn",
  },

  {
    type: "repeating-linear-gradient",
    value: `
      calc(var(--gradient-angle-dynamic) - 20deg),
      rgb(253, 71, 65) calc(7% * 1),
      rgb(255, 243, 151) calc(7% * 2),
      rgba(168, 255, 95, 1) calc(7% * 3),
      rgba(131, 255, 247, 1) calc(7% * 4),
      rgb(75, 198, 255) calc(7% * 5),
      rgb(255, 73, 246) calc(7% * 6),
      rgb(255, 56, 49) calc(7% * 7)
    `,
    size: "500% 500%",
    position: "0% calc(var(--pointer-y) * 1)",
    blendMode: "soft-light",
  },
  {
    type: "repeating-linear-gradient",
    value: `
      calc(var(--gradient-angle-dynamic) - 130deg),
      rgba(89, 46, 80, 0.5) 0%,
      hsl(118, 43%, 76%) 2.5%,
      rgb(223, 96, 202) 5%,
      hsl(180, 57%, 56%) 7.5%,
      rgba(14, 21, 46, 0.5) 10%,
      rgba(14, 21, 46, 0.5) 15%
    `,
    size: "1000% 1000%",
    position: "calc(var(--pointer-x) * 1) calc(var(--pointer-y) * 1)",
    blendMode: "normal",
  },
  {
    type: "image",
    value: "https://s3.hi168.com/hi168-26327-7861xjfr/shine/b0.png",
    size: "100% 100%",
    position: "center",
    blendMode: "normal",
  },
];

const shine: EffectConfig = {
  layers: ShineConfig1,
  filter:
    "brightness(calc((var(--glare-opacity) * 0.25) + 0.66)) contrast(2) saturate(0.95)",
};

const glare: EffectConfig = {
  layers: [
    {
      type: "radial-gradient",
      value:
        "farthest-corner circle at var(--pointer-x) var(--pointer-y), rgba(255,255,255,0.8) 10%, rgba(255,255,255,0.65) 20%, rgba(0,0,0,0.5) 90%",
      size: "cover",
      position: "center",
    },
  ],
  mixBlendMode: "overlay",
};

const none: EffectConfig = {
  layers: [],
  filter: "none",
};

/**
 * 系统内置的默认卡片配置方案
 *
 * 当用户未选择默认方案时使用此配置。
 * 你可以在此自由修改配置内容。
 *
 * layers 中的 shine/glare 可以直接使用 EffectConfig（CSS 配置格式）
 * 或 EditorLayerEffect（编辑器内部结构），类型系统均可接受。
 */
export const systemDefaultScheme: CardScheme = {
  id: "__system_default__",
  name: "System Default",
  cardWidth: "300px",
  layers: [
    {
      id: 1,
      img: "https://s3.hi168.com/hi168-26327-7861xjfr/shine/0.png",
      zHeight: 120,
      maskMode: "auto",
      maskUrl: "",
      visible: true,
      shine,
      glare: none,
    },
    {
      id: 2,
      img: "https://s3.hi168.com/hi168-26327-7861xjfr/shine/1.png",
      zHeight: 50,
      maskMode: "auto",
      maskUrl: "",
      visible: true,
      shine,
      glare,
    },
    {
      id: 3,
      img: "https://s3.hi168.com/hi168-26327-7861xjfr/shine/2.png",
      zHeight: 80,
      maskMode: "auto",
      maskUrl: "",
      visible: true,
      shine: none,
      glare: none,
    },
    {
      id: 4,
      img: "https://s3.hi168.com/hi168-26327-7861xjfr/shine/3.png",
      zHeight: 80,
      maskMode: "auto",
      maskUrl: "",
      visible: true,
      shine: none,
      glare: none,
    },
    {
      id: 5,
      img: "https://s3.hi168.com/hi168-26327-7861xjfr/shine/4.png",
      zHeight: 150,
      maskMode: "auto",
      maskUrl: "",
      visible: true,
      shine,
      glare: none,
    },
  ],
  sharedEffects: [],
};
