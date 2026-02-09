<script setup lang="ts"></script>

<template>
  <UHeader
    title="ShineCard"
    :ui="{
      title:
        'flex items-center gap-x-2 text-neutral-800 dark:text-neutral-200 hover:text-primary transition-colors',
    }"
  >
    <template #title>
      <UIcon name="i-lucide-sparkles" class="size-5" />
      <span class="text-sm font-bold tracking-tight">ShineCard</span>
    </template>

    <template #right>
      <slot name="actions" />
      <LocaleSwitcher />
      <ColorSchemeButton />
      <UButton
        color="neutral"
        variant="ghost"
        to="https://github.com/alexhoshina/"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
      />
    </template>
  </UHeader>
</template>
