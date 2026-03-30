<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'default'
})

const timeRemaining = ref('24:59')
const meditationType = ref('Morning Meditation')
const meditationDescription = ref('Find your center in the clear blue sky')
</script>

<template>
  <!-- Header -->
    <header class="bg-soft-sky pt-14 pb-4 px-6 relative z-30 flex items-center justify-between">
      <button class="flex items-center justify-center size-10 rounded-full bg-white/20 active:bg-white/30 transition-colors">
        <span class="material-symbols-outlined text-white">menu</span>
      </button>
      <div class="flex items-center gap-2">
        <div class="concentric-logo">
          <div class="circle-1"></div>
          <div class="circle-2"></div>
          <div class="circle-3"></div>
        </div>
        <h1 class="text-white font-semibold text-lg tracking-wide">淡江大學禪學社</h1>
      </div>
      <button class="flex items-center justify-center size-10 rounded-full bg-white/20 active:bg-white/30 transition-colors">
        <span class="material-symbols-outlined text-white">more_horiz</span>
      </button>
    </header>

    <!-- Main Content -->
    <main class="flex-1 ethereal-gradient relative overflow-hidden flex flex-col items-center justify-center px-6 pb-32">
      <div class="absolute top-10 left-[-20%] w-64 h-64 cloud-motif opacity-80"></div>
      <div class="absolute top-40 right-[-10%] w-80 h-80 cloud-motif opacity-60"></div>
      <div class="absolute bottom-20 left-10 w-72 h-72 cloud-motif opacity-70"></div>

      <div class="relative z-10 flex flex-col items-center w-full">
        <!-- Timer Display -->
        <div class="size-72 rounded-full border-4 border-white/40 flex items-center justify-center timer-ring bg-white/10 backdrop-blur-sm relative mb-12">
          <div class="text-center">
            <span class="text-6xl font-light text-white tracking-tighter">{{ timeRemaining }}</span>
            <p class="text-white/70 text-sm font-medium mt-2 tracking-widest uppercase">Remaining</p>
          </div>
          <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 bg-white rounded-full shadow-lg"></div>
        </div>

        <!-- Meditation Info -->
        <div class="text-center mb-12">
          <h2 class="text-2xl font-semibold text-sky-900 mb-2">{{ meditationType }}</h2>
          <p class="text-sky-800/60 text-sm">{{ meditationDescription }}</p>
        </div>

        <!-- Control Buttons -->
        <div class="flex items-center gap-8">
          <button class="size-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-sky-700 transition-transform active:scale-95 hover:bg-white/40">
            <span class="material-symbols-outlined text-3xl">replay_10</span>
          </button>
          <button class="size-20 rounded-full bg-white flex items-center justify-center text-sky-500 shadow-xl shadow-sky-400/20 transition-transform active:scale-95 hover:shadow-xl">
            <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1">pause</span>
          </button>
          <button class="size-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-sky-700 transition-transform active:scale-95 hover:bg-white/40">
            <span class="material-symbols-outlined text-3xl">forward_10</span>
          </button>
        </div>
      </div>
    </main>

</template>

<style scoped>
:root {
  --sky-gradient: linear-gradient(180deg, #BAE6FD 0%, #E0F2FE 100%);
  --cloud-white: rgba(255, 255, 255, 0.6);
}

.ethereal-gradient {
  background: var(--sky-gradient);
}

.cloud-motif {
  background: radial-gradient(circle at center, var(--cloud-white) 0%, transparent 70%);
  filter: blur(40px);
}

.timer-ring {
  box-shadow: 0 0 50px rgba(255, 255, 255, 0.5), inset 0 0 20px rgba(14, 165, 233, 0.1);
}

.concentric-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 24px;
  height: 24px;
}

.circle-1 {
  border: 1.5px solid #FFD700;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  position: absolute;
}

.circle-2 {
  border: 1.5px solid #FF6B6B;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  position: absolute;
}

.circle-3 {
  border: 1.5px solid #4D96FF;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: absolute;
}
</style>
