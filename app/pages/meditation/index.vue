<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'default'
})

// Controller 層: 取得所有的計時狀態與事件處理函式
const {
  isPlaying,
  formattedTime,
  meditationType,
  meditationDescription,
  showDropdown,
  showChimeSettings,
  selectedChime,
  chimeOptions,
  audioFileInput,
  handleFocus,
  handleBlur,
  toggleTimer,
  jumpTime,
  handleAudioUpload,
  selectChimeOption,
  setupInitialState,
  tearDownState
} = useMeditationTimer()

// 初始化與生命週期卸載
onMounted(() => {
  setupInitialState()
})

onUnmounted(() => {
  tearDownState()
})
</script>

<template>
  <!-- Header -->
  <AppHeader title="禪定時間" bg-class="bg-soft-sky">
    <template #right-actions>
      <button @click="showDropdown = !showDropdown" class="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
        <span class="material-symbols-outlined text-white text-3xl">menu</span>
      </button>
      
      <!-- Dropdown Background Overlay -->
      <div v-if="showDropdown" @click="showDropdown = false" class="fixed inset-0 z-40" style="width: 100vw; height: 100vh;"></div>

      <!-- Dropdown Menu -->
      <div v-if="showDropdown" class="absolute right-0 top-[110%] mt-2 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-60 border border-white/60 origin-top-right animate-fade-in">
        <button @click="showDropdown = false; showChimeSettings = true" class="w-full text-left px-5 py-3.5 text-sky-900 hover:bg-sky-50 active:bg-sky-100 transition-colors flex items-center gap-3 border-b border-sky-100/50">
          <span class="material-symbols-outlined text-[20px] text-sky-600">music_note</span>
          <span class="font-medium text-[15px]">設置鈴聲</span>
        </button>
        <button @click="showDropdown = false" class="w-full text-left px-5 py-3.5 text-sky-900 hover:bg-sky-50 active:bg-sky-100 transition-colors flex items-center gap-3">
          <span class="material-symbols-outlined text-[20px] text-sky-600">history</span>
          <span class="font-medium text-[15px]">禪定紀錄</span>
        </button>
      </div>
    </template>
  </AppHeader>

    <!-- Chime Settings Dialog -->
    <div v-if="showChimeSettings" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" @click="showChimeSettings = false"></div>
      <div class="relative bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in divide-y divide-sky-100/60 border border-white/50">
        <div class="px-6 py-5 flex items-center justify-between bg-white/50">
          <h3 class="font-semibold text-sky-900 text-[17px]">設置鈴聲</h3>
          <button @click="showChimeSettings = false" class="flex items-center justify-center size-8 rounded-full bg-sky-100/50 text-sky-500 hover:bg-sky-100 hover:text-sky-700 transition-colors">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div class="p-3">
          <button 
            v-for="option in chimeOptions" 
            :key="option.value"
            @click="selectChimeOption(option.value)"
            class="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-between group"
            :class="selectedChime === option.value ? 'bg-sky-50 text-sky-900 shadow-sm ring-1 ring-sky-200/50' : 'text-sky-700 hover:bg-sky-50/50'"
          >
            <div class="flex items-center gap-3.5">
              <span class="material-symbols-outlined text-[22px]" :class="selectedChime === option.value ? 'text-sky-500' : 'text-sky-300 group-hover:text-sky-400'">
                {{ option.value === 'custom' ? 'folder_open' : 'music_note' }}
              </span>
              <span class="font-medium text-[15px] max-w-[200px] truncate">{{ option.label }}</span>
            </div>
            <span v-if="selectedChime === option.value" class="material-symbols-outlined text-sky-500 text-[22px]">check_circle</span>
          </button>
        </div>
      </div>
    </div>
    
    <input type="file" ref="audioFileInput" accept="audio/*" class="hidden" @change="handleAudioUpload" />

    <!-- Main Content -->
    <main class="flex-1 bg-soft-sky relative overflow-hidden flex flex-col items-center justify-center px-6 pb-32">
      <div class="absolute top-10 left-[-20%] w-64 h-64 cloud-motif opacity-80"></div>
      <div class="absolute top-40 right-[-10%] w-80 h-80 cloud-motif opacity-60"></div>
      <div class="absolute bottom-20 left-10 w-72 h-72 cloud-motif opacity-70"></div>

      <div class="relative z-10 flex flex-col items-center w-full">
        <!-- Timer Display -->
        <div class="size-72 rounded-full border-4 border-white/40 flex items-center justify-center timer-ring bg-white/10 backdrop-blur-sm relative mt-6 mb-6">
          <div class="text-center">
            <input 
              v-model="formattedTime"
              @focus="handleFocus"
              @blur="handleBlur"
              @keydown.enter="($event.target as HTMLInputElement).blur()"
              type="text"
              maxlength="5"
              class="text-6xl font-light text-white tracking-tighter bg-transparent border-none text-center outline-none w-48 p-0 focus:ring-0"
            />
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
          <button @click="jumpTime(-10)" class="size-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-sky-700 transition-transform active:scale-95 hover:bg-white/40">
            <span class="material-symbols-outlined text-3xl">replay_10</span>
          </button>
          <button @click="toggleTimer" class="size-20 rounded-full bg-white flex items-center justify-center text-sky-500 shadow-xl shadow-sky-400/20 transition-transform active:scale-95 hover:shadow-xl">
            <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
          </button>
          <button @click="jumpTime(10)" class="size-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-sky-700 transition-transform active:scale-95 hover:bg-white/40">
            <span class="material-symbols-outlined text-3xl">forward_10</span>
          </button>
        </div>
      </div>
    </main>

</template>

<style scoped>
:root {
  --cloud-white: rgba(255, 255, 255, 0.6);
}

.bg-soft-sky {
  background: #BAE6FD;
}

.cloud-motif {
  background: radial-gradient(circle at center, var(--cloud-white) 0%, transparent 70%);
  filter: blur(40px);
}

.timer-ring {
  box-shadow: 0 0 50px rgba(255, 255, 255, 0.5), inset 0 0 20px rgba(14, 165, 233, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
