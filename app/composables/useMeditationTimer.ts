import { ref, computed } from 'vue'
import { audioService } from '@/services/audioService'

/**
 * Controller (邏輯層): 控制冥想計時器狀態，介接設備服務 (Web Audio) 與 View
 */
export function useMeditationTimer() {
  const totalSeconds = ref(25 * 60 - 1)
  const isPlaying = ref(false)  // 原本預設是 true，此處修改建議預設狀態應在 UI掛載時判斷
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

  const meditationType = ref('Morning Meditation')
  const meditationDescription = ref('Find your center in the clear blue sky')

  const showDropdown = ref(false)
  const showChimeSettings = ref(false)
  const selectedChime = ref('default')
  const customChimeUrl = ref<string | null>(null)
  
  // 建立對應 UI <input type="file"> 的引用
  const audioFileInput = ref<HTMLInputElement | null>(null)

  const chimeOptions = ref([
    { label: '清脆頌缽 (預設)', value: 'default' },
    { label: '低沉冥想缽', value: 'deep_bowl' },
    { label: '輕柔小鈴', value: 'soft_bell' },
    { label: '從裝置選擇...', value: 'custom' }
  ])

  // -- 業務邏輯 (Actions) --

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
      const num = parseInt(val, 10)
      if (!isNaN(num)) {
        parsedSeconds = num * 60
      }
    }

    if (parsedSeconds >= 0) {
      totalSeconds.value = Math.min(parsedSeconds, 99 * 60 + 59)
    }
  }

  const triggerChime = (type = selectedChime.value) => {
    if (type === 'custom' && customChimeUrl.value) {
      audioService.playCustomAudio(customChimeUrl.value)
    } else {
      audioService.playSynthesizedChime(type)
    }
  }

  const startTimer = () => {
    if (timerInterval) return
    isPlaying.value = true
    timerInterval = setInterval(() => {
      if (totalSeconds.value > 0) {
        totalSeconds.value--
      } else {
        pauseTimer()
        isPlaying.value = false
        triggerChime()
      }
    }, 1000)
  }

  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    isPlaying.value = false
  }

  const toggleTimer = () => {
    if (isPlaying.value) {
      pauseTimer()
    } else {
      startTimer()
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
      triggerChime('custom')
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
      triggerChime(val)
    }
  }

  const setupInitialState = () => {
    startTimer() 
  }

  const tearDownState = () => {
    pauseTimer()
    if (customChimeUrl.value) {
      URL.revokeObjectURL(customChimeUrl.value)
    }
  }

  return {
    totalSeconds,
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
  }
}
