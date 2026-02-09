<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <USeparator 
    :avatar="{
      src: 'https://avatars.githubusercontent.com/u/92345812',
      size: 'xl'
    }"
  />
  <UFooter>
    <template #left>
      <p class="text-muted text-sm font-FOTMatisseProEB">Copyright © {{ new Date().getFullYear() }}</p>
      
    </template>

    <template #right>

  <UButton
    icon="i-lucide-github"
    size="xs"
    color="neutral"
    variant="ghost"
    to="https://github.com/alexhoshina"
    target="_blank"
    class="font-FOTMatisseProEB"
  >
    @alexhoshina
  </UButton>


    </template>
  </UFooter>
</template>
