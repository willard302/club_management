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

const playChime = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContext) return
  
  const audioCtx = new AudioContext()
  const baseFreq = 900 // Higher root frequency for a crisper, clearer sound
  const now = audioCtx.currentTime

  const createOscillator = (freq: number, type: OscillatorType, attack: number, decay: number, volume: number) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    
    osc.type = type
    osc.frequency.value = freq
    
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    
    gain.gain.setValueAtTime(0, now)
    // Faster attack creates a snappier "strike" sound
    gain.gain.linearRampToValueAtTime(volume, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)
    
    osc.start(now)
    osc.stop(now + decay)
  }

  // Base note, strong and long, but sharper attack
  createOscillator(baseFreq, 'sine', 0.01, 7, 0.6)
  // Complex overtones typical of "crisp" bells
  createOscillator(baseFreq * 1.52, 'sine', 0.01, 5, 0.25)
  createOscillator(baseFreq * 2.76, 'sine', 0.01, 4, 0.4)
  // Very high frequency "pings" that make the strike feel glass-like/crisp
  createOscillator(baseFreq * 5.43, 'sine', 0.005, 1.5, 0.2)
  createOscillator(baseFreq * 8.92, 'sine', 0.002, 0.5, 0.1)
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
      <button class="flex items-center justify-center size-10 rounded-full bg-white/20 active:bg-white/30 transition-colors">
        <span class="material-symbols-outlined text-white">more_horiz</span>
      </button>
    </header>

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
</style>
