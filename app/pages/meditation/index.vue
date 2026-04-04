<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'default'
})

const totalSeconds = ref(25 * 60 - 1)
const isPlaying = ref(true)
let timerInterval: ReturnType<typeof setInterval> | null = null

const isEditing = ref(false)
const editValue = ref('')

const formattedTime = computed({
  get() {
    if (isEditing.value) {
      return editValue.value
    }
    const minutes = Math.floor(totalSeconds.value / 60)
    const seconds = totalSeconds.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  },
  set(val: string) {
    editValue.value = val
  }
})

const handleFocus = () => {
  isEditing.value = true
  const minutes = Math.floor(totalSeconds.value / 60)
  const seconds = totalSeconds.value % 60
  editValue.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  if (isPlaying.value) {
    pauseTimer()
    isPlaying.value = false
  }
}

const handleBlur = (event: Event) => {
  isEditing.value = false
  const val = editValue.value.trim()
  if (!val) return

  let parsedSeconds = 0
  if (val.includes(':')) {
    const parts = val.split(':')
    const min = parseInt(parts[0] || '0', 10) || 0
    const sec = parseInt(parts[1] || '0', 10) || 0
    parsedSeconds = min * 60 + sec
  } else {
    // Treat integers as minutes
    const num = parseInt(val, 10)
    if (!isNaN(num)) {
      parsedSeconds = num * 60
    }
  }

  if (parsedSeconds >= 0) {
    totalSeconds.value = Math.min(parsedSeconds, 99 * 60 + 59)
  }
}

const playChime = (type = selectedChime.value) => {
  if (type === 'custom' && customChimeUrl.value) {
    const audio = new Audio(customChimeUrl.value)
    audio.play().catch(e => console.error('Failed to play custom audio:', e))
    return
  }

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContext) return
  
  const audioCtx = new AudioContext()
  const now = audioCtx.currentTime

  const createOscillator = (freq: number, typeStr: OscillatorType, attack: number, decay: number, volume: number) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    
    osc.type = typeStr
    osc.frequency.value = freq
    
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)
    
    osc.start(now)
    osc.stop(now + decay)
  }

  if (type === 'deep_bowl') {
    const baseFreq = 432
    createOscillator(baseFreq, 'sine', 0.05, 8, 0.7)
    createOscillator(baseFreq * 2.76, 'sine', 0.05, 5, 0.3)
    createOscillator(baseFreq * 5.43, 'sine', 0.02, 3, 0.15)
    createOscillator(baseFreq * 8.92, 'sine', 0.02, 1.5, 0.05)
  } else if (type === 'soft_bell') {
    const baseFreq = 1200
    createOscillator(baseFreq, 'sine', 0.005, 4, 0.4)
    createOscillator(baseFreq * 1.52, 'sine', 0.005, 2.5, 0.2)
    createOscillator(baseFreq * 2.76, 'sine', 0.002, 1.5, 0.1)
  } else {
    // default (crisp)
    const baseFreq = 900
    createOscillator(baseFreq, 'sine', 0.01, 7, 0.6)
    createOscillator(baseFreq * 1.52, 'sine', 0.01, 5, 0.25)
    createOscillator(baseFreq * 2.76, 'sine', 0.01, 4, 0.4)
    createOscillator(baseFreq * 5.43, 'sine', 0.005, 1.5, 0.2)
    createOscillator(baseFreq * 8.92, 'sine', 0.002, 0.5, 0.1)
  }
}

const startTimer = () => {
  if (timerInterval) return
  timerInterval = setInterval(() => {
    if (totalSeconds.value > 0) {
      totalSeconds.value--
    } else {
      pauseTimer()
      isPlaying.value = false
      playChime()
    }
  }, 1000)
}

const pauseTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const toggleTimer = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startTimer()
  } else {
    pauseTimer()
  }
}

const jumpTime = (seconds: number) => {
  const newTime = totalSeconds.value + seconds
  if (newTime < 0) {
    totalSeconds.value = 0
  } else {
    totalSeconds.value = newTime
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  pauseTimer()
})

const meditationType = ref('Morning Meditation')
const meditationDescription = ref('Find your center in the clear blue sky')

const showDropdown = ref(false)

const showChimeSettings = ref(false)
const selectedChime = ref('default')
const customChimeUrl = ref<string | null>(null)
const audioFileInput = ref<HTMLInputElement | null>(null)

const chimeOptions = ref([
  { label: '清脆頌缽 (預設)', value: 'default' },
  { label: '低沉冥想缽', value: 'deep_bowl' },
  { label: '輕柔小鈴', value: 'soft_bell' },
  { label: '從裝置選擇...', value: 'custom' }
])

const handleAudioUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    if (customChimeUrl.value) URL.revokeObjectURL(customChimeUrl.value)
    customChimeUrl.value = URL.createObjectURL(file)
    selectedChime.value = 'custom'
    const customOption = chimeOptions.value.find(o => o.value === 'custom')
    if (customOption) {
      customOption.label = `自訂: ${file.name}`
    }
    playChime('custom')
  }
  if (event.target) {
    (event.target as HTMLInputElement).value = ''
  }
}

const selectChimeOption = (val: string) => {
  if (val === 'custom') {
    audioFileInput.value?.click()
  } else {
    selectedChime.value = val
    playChime(val)
  }
}

</script>

<template>
  <!-- Header -->
    <header class="bg-soft-sky pt-6 pb-4 px-6 relative z-30 flex items-center justify-between">
      <button class="flex items-center justify-center size-10 rounded-full bg-white/20 active:bg-white/30 transition-colors">
        <span class="material-symbols-outlined text-white">menu</span>
      </button>
      <div class="flex items-center gap-2">
        <ZenLogo size="sm" />
        <h1 class="text-white font-semibold text-lg tracking-wide">淡江大學禪學社</h1>
      </div>
      <div class="relative z-50">
        <button @click="showDropdown = !showDropdown" class="flex items-center justify-center size-10 rounded-full bg-white/20 active:bg-white/30 transition-colors relative z-50">
          <span class="material-symbols-outlined text-white">more_horiz</span>
        </button>
        
        <!-- Dropdown Background Overlay -->
        <div v-if="showDropdown" @click="showDropdown = false" class="fixed inset-0 z-40" style="width: 100vw; height: 100vh;"></div>

        <!-- Dropdown Menu -->
        <div v-if="showDropdown" class="absolute right-0 top-[110%] mt-2 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50 border border-white/60 origin-top-right animate-fade-in">
          <button @click="showDropdown = false; showChimeSettings = true" class="w-full text-left px-5 py-3.5 text-sky-900 hover:bg-sky-50 active:bg-sky-100 transition-colors flex items-center gap-3 border-b border-sky-100/50">
            <span class="material-symbols-outlined text-[20px] text-sky-600">music_note</span>
            <span class="font-medium text-[15px]">設置鈴聲</span>
          </button>
          <button @click="showDropdown = false" class="w-full text-left px-5 py-3.5 text-sky-900 hover:bg-sky-50 active:bg-sky-100 transition-colors flex items-center gap-3">
            <span class="material-symbols-outlined text-[20px] text-sky-600">history</span>
            <span class="font-medium text-[15px]">禪定紀錄</span>
          </button>
        </div>
      </div>
    </header>

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
