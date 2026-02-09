<script setup lang="ts">
import { zh_cn, en } from "@nuxt/ui/locale";

const { locale, setLocale } = useI18n();

const locales = [zh_cn, en];
</script>

<template>
  <ULocaleSelect
    :model-value="locale"
    :locales="locales"
    color="neutral"
    variant="ghost"
    size="sm"
    class="w-auto"
    @update:model-value="setLocale($event as any)"
  />
</template>
