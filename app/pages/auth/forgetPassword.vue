<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()

definePageMeta({
  layout: 'auth'
})

const email = ref('')

const handleSendCode = () => {
  // TODO: Implement send verification code logic
  console.log('Sending verification code to', email.value)
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="relative flex h-screen w-full flex-col items-center justify-center p-6 overflow-hidden font-display">
    <!-- Background Content mimicking body class in HTML -->
    <div class="absolute inset-0 z-0 celestial-bg"></div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center w-full h-full">
      <!-- Top Navigation -->
      <nav class="absolute top-0 left-0 w-full flex items-center justify-center px-6 py-6" style="margin-top: env(safe-area-inset-top);">
        <button @click="goBack" aria-label="Go back" class="absolute left-6 flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg active:scale-95 transition-transform z-10">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 class="text-[26px] font-extrabold tracking-widest text-white drop-shadow-md">
          忘記密碼
        </h1>
      </nav>

      <!-- Main Content Canvas -->
      <main class="w-full max-w-md flex flex-col items-center space-y-8 mt-28">
        <!-- Description Section -->
        <div class="flex flex-col items-center space-y-4">
          <p class="text-white/80 text-center px-4 tracking-wide leading-relaxed">
            社團管理系統<br/>
            請輸入您的電子郵件以重設密碼
          </p>
        </div>

        <!-- Forgot Password Form -->
        <div class="w-full glass-panel bg-white/10 p-8 space-y-6 border border-white/20" style="border-radius: 1rem;">
          <!-- Email Input Field -->
          <div class="space-y-2">
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-4 text-white/70">mail</span>
              <input 
                v-model="email"
                class="w-full h-14 bg-white/10 border-none px-12 text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/30 glass-panel transition-all outline-none" 
                style="border-radius: 9999px;"
                placeholder="輸入你的Email" 
                required 
                type="email"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            @click="handleSendCode"
            class="w-full h-16 bg-primary text-white font-bold text-[18px] tracking-wide shadow-[0_0_20px_rgba(43,157,238,0.4)] hover:shadow-[0_0_30px_rgba(43,157,238,0.6)] active:scale-[0.98] transition-all flex items-center justify-center"
            style="border-radius: 9999px;">
            發送驗證碼
          </button>

          <!-- Secondary Action -->
          <div class="flex justify-center">
            <a class="text-white/70 hover:text-white text-[14px] font-medium tracking-wide transition-colors flex items-center gap-2" href="#">
              <span class="material-symbols-outlined text-[18px]">support_agent</span>
              聯繫社團管理員
            </a>
          </div>
        </div>
      </main>

      <div class="flex-grow"></div>

      <!-- Footer Visual Hint -->
      <div class="flex flex-col items-center space-y-1 opacity-60 mb-8">
        <span class="material-symbols-outlined text-white text-[32px]">cloud</span>
        <p class="text-[10px] text-white tracking-[0.3em] uppercase">Ethereal Sanctuary</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.celestial-bg {
  background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDMKqJWG6idlwOaQOmIUP0Xm2503tC_jJbl9g_W2kCwNLsvxEZy2zopOH4ACkgaQiC6cIH41ehoc-2oaanU_uR_HKSMjArJmKOpNUkFIE8ULKDEomYv8C3Qdt8qca2xWuLsuLQQHSfz3PSGV8k3GubTirEDLC6R64S9jYWbuvnm0EwiNiEnXxsrfSgbKou6shG3khMhuuyM7bCL_C8uyQrdXx8U82Az7VCn-ceWkwXhSQTyTw-HnYe7S7Z3NiY1cZNWgeAC51bVrP0');
  background-size: cover;
  background-position: center;
}
.tricolor-logo {
  background: radial-gradient(circle, #4CAF50 33%, #FFD700 34% 66%, #FF4B2B 67%);
}
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
