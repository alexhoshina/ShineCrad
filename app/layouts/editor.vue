<template>
  <div
    class="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 overflow-hidden"
  >
    <AppHeader>
      <template #actions>
        <slot name="header-actions" />
      </template>
    </AppHeader>

    <main class="flex-1 min-h-0 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
