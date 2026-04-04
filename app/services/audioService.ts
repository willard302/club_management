/**
 * Service (基礎設施層): 負責處理瀏覽器原生的 Web Audio API 互動
 */
export const audioService = {
  /**
   * 播放自訂的音訊網址
   */
  playCustomAudio(url: string) {
    const audio = new Audio(url)
    audio.play().catch(e => console.error('Failed to play custom audio:', e))
  },

  /**
   * 使用 AudioContext 合成敲罄頻率播放
   */
  playSynthesizedChime(typeStr: string) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    
    const audioCtx = new AudioContext()
    const now = audioCtx.currentTime

    const createOscillator = (freq: number, type: OscillatorType, attack: number, decay: number, volume: number) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      
      osc.type = type
      osc.frequency.value = freq
      
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(volume, now + attack)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)
      
      osc.start(now)
      osc.stop(now + decay)
    }

    if (typeStr === 'deep_bowl') {
      const baseFreq = 432
      createOscillator(baseFreq, 'sine', 0.05, 8, 0.7)
      createOscillator(baseFreq * 2.76, 'sine', 0.05, 5, 0.3)
      createOscillator(baseFreq * 5.43, 'sine', 0.02, 3, 0.15)
      createOscillator(baseFreq * 8.92, 'sine', 0.02, 1.5, 0.05)
    } else if (typeStr === 'soft_bell') {
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
}
