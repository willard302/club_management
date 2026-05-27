<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  glowIntensity?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  glowIntensity: 10
})

const sizeClasses = {
  sm: {
    outer: 'size-12',
    middle: 'size-8',
    inner: 'size-4',
    glow: '0 0 15px rgba(255, 255, 255, 0.8)'
  },
  md: {
    outer: 'size-20',
    middle: 'size-14',
    inner: 'size-8',
    glow: '0 0 30px rgba(255, 255, 255, 0.6)'
  },
  lg: {
    outer: 'size-28',
    middle: 'size-20',
    inner: 'size-12',
    glow: `0 0 ${40}px ${10}px rgba(255, 255, 255, 0.5)`
  }
}

const current = sizeClasses[props.size]
</script>

<template>
  <div class="relative flex items-center justify-center">
    <div
      :class="[
        current.outer,
        'rounded-full flex items-center justify-center relative overflow-hidden bg-red-500/80 shadow-lg'
      ]"
      :style="{ boxShadow: current.glow }"
    >
      <!-- <div
        :class="[
          current.middle,
          'rounded-full flex items-center justify-center bg-yellow-400/90'
        ]"
      >
        <div
          :class="[current.inner, 'rounded-full']"
          style="background-color: #4CAF50;"
        ></div>
      </div> -->
    </div>
  </div>
</template>
