<script setup lang="ts">
// ==================== 状态 ====================

const appConfig = useAppConfig();
const colorMode = useColorMode();

const isDark = computed({
  get: () => colorMode.value === "dark",
  set: (val) => {
    colorMode.preference = val ? "dark" : "light";
  },
});

// 使用 Cookie 持久化颜色偏好（SSR 安全）
const primaryCookie = useCookie<string>("nuxt-ui-primary", {
  default: () => "green",
  watch: true,
});
const neutralCookie = useCookie<string>("nuxt-ui-neutral", {
  default: () => "slate",
  watch: true,
});

// 恢复持久化的颜色到 appConfig
if (primaryCookie.value) {
  if (!(appConfig.ui as any).colors) (appConfig.ui as any).colors = {};
  (appConfig.ui as any).colors.primary = primaryCookie.value;
}
if (neutralCookie.value) {
  if (!(appConfig.ui as any).colors) (appConfig.ui as any).colors = {};
  (appConfig.ui as any).colors.neutral = neutralCookie.value;
}

// 主色选项（带预览 Hex 值，Tailwind 500 色阶）
const colorOptions: { name: string; hex: string }[] = [
  { name: "green", hex: "#22c55e" },
  { name: "blue", hex: "#3b82f6" },
  { name: "red", hex: "#ef4444" },
  { name: "orange", hex: "#f97316" },
  { name: "amber", hex: "#f59e0b" },
  { name: "yellow", hex: "#eab308" },
  { name: "lime", hex: "#84cc16" },
  { name: "emerald", hex: "#10b981" },
  { name: "teal", hex: "#14b8a6" },
  { name: "cyan", hex: "#06b6d4" },
  { name: "sky", hex: "#0ea5e9" },
  { name: "indigo", hex: "#6366f1" },
  { name: "violet", hex: "#8b5cf6" },
  { name: "purple", hex: "#a855f7" },
  { name: "fuchsia", hex: "#d946ef" },
  { name: "pink", hex: "#ec4899" },
  { name: "rose", hex: "#f43f5e" },
];

// Neutral (gray-scale) color options
const neutralOptions: { name: string; hex: string }[] = [
  { name: "slate", hex: "#64748b" },
  { name: "gray", hex: "#6b7280" },
  { name: "zinc", hex: "#71717a" },
  { name: "neutral", hex: "#737373" },
  { name: "stone", hex: "#78716c" },
];

const currentPrimary = computed({
  get: () => (appConfig.ui as any)?.colors?.primary ?? "green",
  set: (val: string) => {
    if (!(appConfig.ui as any).colors) (appConfig.ui as any).colors = {};
    (appConfig.ui as any).colors.primary = val;
    primaryCookie.value = val;
  },
});

const currentNeutral = computed({
  get: () => (appConfig.ui as any)?.colors?.neutral ?? "slate",
  set: (val: string) => {
    if (!(appConfig.ui as any).colors) (appConfig.ui as any).colors = {};
    (appConfig.ui as any).colors.neutral = val;
    neutralCookie.value = val;
  },
});
</script>

<template>
  <UPopover>
    <UButton
      icon="i-lucide-palette"
      color="neutral"
      variant="ghost"
      size="sm"
      square
    />

    <template #content>
      <div class="p-4 w-64 flex flex-col gap-y-4">
        <!-- Dark Mode Toggle -->
        <div class="flex items-center justify-between">
          <span
            class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >{{ $t("theme.darkMode") }}</span
          >
          <USwitch v-model="isDark" size="sm" />
        </div>

        <USeparator />

        <!-- Primary Color -->
        <div class="flex flex-col gap-y-2">
          <span
            class="text-xs font-bold text-neutral-500 uppercase tracking-wider"
            >{{ $t("theme.primaryColor") }}</span
          >
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="color in colorOptions"
              :key="color.name"
              class="size-6 rounded-full border-2 transition-all hover:scale-110 cursor-pointer"
              :class="
                currentPrimary === color.name
                  ? 'border-white dark:border-white ring-2 ring-offset-1 ring-offset-white dark:ring-offset-neutral-800'
                  : 'border-transparent'
              "
              :style="{
                backgroundColor: color.hex,
                '--tw-ring-color': color.hex,
              }"
              :title="color.name"
              @click="currentPrimary = color.name"
            />
          </div>
        </div>

        <USeparator />

        <!-- Neutral Color -->
        <div class="flex flex-col gap-y-2">
          <span
            class="text-xs font-bold text-neutral-500 uppercase tracking-wider"
            >{{ $t("theme.neutralColor") }}</span
          >
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="color in neutralOptions"
              :key="color.name"
              class="size-6 rounded-full border-2 transition-all hover:scale-110 cursor-pointer"
              :class="
                currentNeutral === color.name
                  ? 'border-white dark:border-white ring-2 ring-offset-1 ring-offset-white dark:ring-offset-neutral-800'
                  : 'border-transparent'
              "
              :style="{
                backgroundColor: color.hex,
                '--tw-ring-color': color.hex,
              }"
              :title="color.name"
              @click="currentNeutral = color.name"
            />
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
