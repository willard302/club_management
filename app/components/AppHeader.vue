<script setup lang="ts">
interface Props {
  title: string
  bgClass?: string
  hasPadding?: boolean
}

withDefaults(defineProps<Props>(), {
  bgClass: 'bg-soft-sky',
  hasPadding: false
})
</script>

<template>
  <header :class="[bgClass, 'pt-6 px-4 sticky top-0 z-30', hasPadding ? 'pb-20' : 'pb-4', 'relative overflow-hidden']">
    <div class="relative z-10 flex items-center">
      <!-- Left side: Logo -->
      <div class="flex-1 flex justify-start">
        <div class="flex items-center gap-2">
          <ZenLogo size="sm" />
        </div>
      </div>
      <!-- Center: Title -->
      <div class="flex-1 flex justify-center">
        <h1 class="text-white text-xl font-bold tracking-tight">{{ title }}</h1>
      </div>
      <!-- Right side: Nav icons -->
      <div class="flex-1 flex justify-end relative z-50">
        <slot name="right-actions" />
      </div>
    </div>
  </header>
</template>
