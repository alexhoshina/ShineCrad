<script setup lang="ts">
const route = useRoute();

const isHome = computed(() => route.path === "/");
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <AppHeader>
      <template #actions>
        <NuxtLink v-if="isHome" to="/editor">
          <UButton
            :label="$t('common.editor')"
            icon="i-lucide-sparkles"
            color="primary"
            variant="soft"
            size="xs"
          />
        </NuxtLink>
        <slot name="header-actions" />
      </template>
    </AppHeader>

    <main class="flex-1 min-h-0 flex flex-col">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
