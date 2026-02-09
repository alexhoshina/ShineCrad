import type { EditorLayerEffect, EditorGradientSource } from "./editor-types";
import { createDefaultEffect } from "./editor-types";

export interface EffectPreset {
  id: string;
  nameKey: string;
  icon: string;
  category: "shine" | "glare" | "both";
  effect: EditorLayerEffect;
}

// 辅助工厂

function gradientSource(
  overrides: Partial<EditorGradientSource> & { id: number },
): EditorGradientSource {
  return {
    sourceType: "gradient",
    imageUrl: "",
    gradientConfig: {
      type: "linear-gradient",
      angle: 45,
      stops: [
        { id: 1, color: "#FFFFFF", position: 0, alpha: 0 },
        { id: 2, color: "#FFFFFF", position: 50, alpha: 80 },
        { id: 3, color: "#FFFFFF", position: 100, alpha: 0 },
      ],
    },
    sizeMode: "keyword",
    sizeKeyword: "cover",
    sizeW: 100,
    sizeH: 100,
    posMode: "split",
    posPreset: "center",
    posX: {
      mode: "var",
      value: "50%",
      variable: "--pointer-x",
      calcFactor: 1,
    },
    posY: {
      mode: "var",
      value: "50%",
      variable: "--pointer-y",
      calcFactor: 1,
    },
    repeat: "repeat",
    blendMode: "normal",
    ...overrides,
  };
}

// 预设

export const effectPresets: EffectPreset[] = [
  // --- 彩虹全息 ---
  {
    id: "rainbow-holo",
    nameKey: "presets.rainbowHolo",
    icon: "i-lucide-rainbow",
    category: "shine",
    effect: {
      enabled: true,
      sources: [
        gradientSource({
          id: 1,
          gradientConfig: {
            type: "repeating-linear-gradient",
            angle: 45,
            stops: [
              { id: 1, color: "#FD4741", position: 0, alpha: 100 },
              { id: 2, color: "#FFF397", position: 14, alpha: 100 },
              { id: 3, color: "#A8FF5F", position: 28, alpha: 100 },
              { id: 4, color: "#83FFF7", position: 42, alpha: 100 },
              { id: 5, color: "#4BC6FF", position: 57, alpha: 100 },
              { id: 6, color: "#FF49F6", position: 71, alpha: 100 },
              { id: 7, color: "#FF3831", position: 85, alpha: 100 },
            ],
          },
          sizeMode: "split",
          sizeW: 500,
          sizeH: 500,
          posX: {
            mode: "value",
            value: "0%",
            variable: "--pointer-x",
            calcFactor: 1,
          },
          posY: {
            mode: "calc",
            value: "50%",
            variable: "--pointer-y",
            calcFactor: 1,
          },
          blendMode: "soft-light",
        }),
        gradientSource({
          id: 2,
          gradientConfig: {
            type: "repeating-linear-gradient",
            angle: 135,
            stops: [
              { id: 1, color: "#592E50", position: 0, alpha: 50 },
              { id: 2, color: "#8FD4A0", position: 25, alpha: 100 },
              { id: 3, color: "#DF60CA", position: 50, alpha: 100 },
              { id: 4, color: "#55C9C9", position: 75, alpha: 100 },
              { id: 5, color: "#0E152E", position: 100, alpha: 50 },
            ],
          },
          sizeMode: "split",
          sizeW: 1000,
          sizeH: 1000,
          posX: {
            mode: "calc",
            value: "50%",
            variable: "--pointer-x",
            calcFactor: 1,
          },
          posY: {
            mode: "calc",
            value: "50%",
            variable: "--pointer-y",
            calcFactor: 1,
          },
          blendMode: "normal",
        }),
      ],
      opacity: 80,
      mixBlendMode: "",
      filter:
        "brightness(calc((var(--glare-opacity) * 0.25) + 0.66)) contrast(2) saturate(0.95)",
      mask: "",
    },
  },

  // --- Metallic Sheen ---
  {
    id: "metallic-sheen",
    nameKey: "presets.metallicSheen",
    icon: "i-lucide-circle-dot",
    category: "shine",
    effect: {
      enabled: true,
      sources: [
        gradientSource({
          id: 1,
          gradientConfig: {
            type: "linear-gradient",
            angle: 135,
            stops: [
              { id: 1, color: "#2C2C2C", position: 0, alpha: 60 },
              { id: 2, color: "#C0C0C0", position: 30, alpha: 90 },
              { id: 3, color: "#FFFFFF", position: 50, alpha: 100 },
              { id: 4, color: "#C0C0C0", position: 70, alpha: 90 },
              { id: 5, color: "#2C2C2C", position: 100, alpha: 60 },
            ],
          },
          sizeMode: "split",
          sizeW: 300,
          sizeH: 300,
          blendMode: "overlay",
        }),
      ],
      opacity: 70,
      mixBlendMode: "",
      filter: "contrast(1.3) brightness(1.1)",
      mask: "",
    },
  },

  // --- Simple Highlight ---
  {
    id: "simple-highlight",
    nameKey: "presets.simpleHighlight",
    icon: "i-lucide-sparkle",
    category: "shine",
    effect: {
      enabled: true,
      sources: [
        gradientSource({
          id: 1,
          gradientConfig: {
            type: "linear-gradient",
            angle: 120,
            stops: [
              { id: 1, color: "#FFFFFF", position: 0, alpha: 0 },
              { id: 2, color: "#FFFFFF", position: 45, alpha: 60 },
              { id: 3, color: "#FFFFFF", position: 55, alpha: 60 },
              { id: 4, color: "#FFFFFF", position: 100, alpha: 0 },
            ],
          },
          sizeMode: "split",
          sizeW: 200,
          sizeH: 200,
          blendMode: "overlay",
        }),
      ],
      opacity: 60,
      mixBlendMode: "",
      filter: "",
      mask: "",
    },
  },

  // --- Radial Glare ---
  {
    id: "radial-glare",
    nameKey: "presets.radialGlare",
    icon: "i-lucide-sun",
    category: "glare",
    effect: {
      enabled: true,
      sources: [
        gradientSource({
          id: 1,
          gradientConfig: {
            type: "radial-gradient",
            angle: 0,
            stops: [
              { id: 1, color: "#FFFFFF", position: 10, alpha: 80 },
              { id: 2, color: "#FFFFFF", position: 20, alpha: 65 },
              { id: 3, color: "#000000", position: 90, alpha: 50 },
            ],
          },
          sizeMode: "keyword",
          sizeKeyword: "cover",
          posMode: "split",
          posX: {
            mode: "var",
            value: "50%",
            variable: "--pointer-x",
            calcFactor: 1,
          },
          posY: {
            mode: "var",
            value: "50%",
            variable: "--pointer-y",
            calcFactor: 1,
          },
        }),
      ],
      opacity: 100,
      mixBlendMode: "overlay",
      filter: "",
      mask: "",
    },
  },

  // --- Gold Foil ---
  {
    id: "gold-foil",
    nameKey: "presets.goldFoil",
    icon: "i-lucide-crown",
    category: "shine",
    effect: {
      enabled: true,
      sources: [
        gradientSource({
          id: 1,
          gradientConfig: {
            type: "linear-gradient",
            angle: 135,
            stops: [
              { id: 1, color: "#B8860B", position: 0, alpha: 70 },
              { id: 2, color: "#FFD700", position: 25, alpha: 100 },
              { id: 3, color: "#FFA500", position: 50, alpha: 90 },
              { id: 4, color: "#FFD700", position: 75, alpha: 100 },
              { id: 5, color: "#B8860B", position: 100, alpha: 70 },
            ],
          },
          sizeMode: "split",
          sizeW: 400,
          sizeH: 400,
          blendMode: "color-dodge",
        }),
        gradientSource({
          id: 2,
          gradientConfig: {
            type: "radial-gradient",
            angle: 0,
            stops: [
              { id: 1, color: "#FFFFFF", position: 0, alpha: 40 },
              { id: 2, color: "#FFD700", position: 50, alpha: 20 },
              { id: 3, color: "#000000", position: 100, alpha: 0 },
            ],
          },
          sizeMode: "keyword",
          sizeKeyword: "cover",
          blendMode: "overlay",
        }),
      ],
      opacity: 75,
      mixBlendMode: "",
      filter: "saturate(1.5) brightness(1.1)",
      mask: "",
    },
  },

  // --- Neon Glow ---
  {
    id: "neon-glow",
    nameKey: "presets.neonGlow",
    icon: "i-lucide-zap",
    category: "shine",
    effect: {
      enabled: true,
      sources: [
        gradientSource({
          id: 1,
          gradientConfig: {
            type: "linear-gradient",
            angle: 90,
            stops: [
              { id: 1, color: "#FF00FF", position: 0, alpha: 0 },
              { id: 2, color: "#00FFFF", position: 33, alpha: 80 },
              { id: 3, color: "#FF00FF", position: 66, alpha: 80 },
              { id: 4, color: "#00FFFF", position: 100, alpha: 0 },
            ],
          },
          sizeMode: "split",
          sizeW: 300,
          sizeH: 300,
          blendMode: "screen",
        }),
      ],
      opacity: 65,
      mixBlendMode: "",
      filter: "brightness(1.2) saturate(1.8)",
      mask: "",
    },
  },
];

/**
 * Deep-clone a preset effect and reassign source IDs for safety
 */
export function clonePresetEffect(preset: EffectPreset): EditorLayerEffect {
  const clone: EditorLayerEffect = JSON.parse(JSON.stringify(preset.effect));
  let idCounter = Date.now();
  for (const source of clone.sources) {
    source.id = idCounter++;
  }
  return clone;
}
