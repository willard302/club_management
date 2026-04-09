<script setup lang="ts">
import { ref } from 'vue'
import type { LoginFormData } from '@/types'

definePageMeta({
  layout: 'auth'
})

const formData = ref<LoginFormData>({
  email: '',
  password: ''
})

const showPassword = ref(false)
const supabase = useSupabaseClient()
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  const router = useRouter()
  
  if (!formData.value.email || !formData.value.password) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.value.email,
      password: formData.value.password,
    })
    
    if (error) throw error
    
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred during login.'
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    // 呼叫伺服器端 API 取得 Google 授權 URL
    const response = await $fetch<{ url: string }>('/api/auth/google')
    
    if (response?.url) {
      // 重定向到 Google 授權頁面
      window.location.href = response.url
    } else {
      errorMessage.value = 'Failed to initialize Google login'
    }
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Google login setup failed'
    console.error('Google login error:', error)
  }
}
</script>

<template>
  <div class="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <div
        class="h-full w-full bg-cover bg-center"
        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKLqnX9ZXB6k4S_M2OiUzo28rwbVbB4qgtt-CuoJnz7esDmG4EipwCVb159pJxmBEUzY0SIMcJffb8sBWx7x0cCktLUUeogL4l_7CKhM4tw-WrZapPYOiXOJ_wFK0XCHI8tjk2PkDynPSxN-hiE_8DwZJ0-k355BY8O0Jn4yeAvRUuQ6juPcePLPZzromKaH4sAy7R06qG24jk8u4mJDZr3UbyPmicNP-tofDjENIMKDtGvnRYe5SgAVTeEDieQCXIlvpG11VqryQ')"
      ></div>
      <div class="absolute inset-0 bg-primary/10"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-between h-full px-6 py-12 overflow-y-auto">

      <!-- Center Content -->
      <div class="flex flex-col items-center gap-6 w-full">
        <!-- Logo -->
        <ZenLogo size="lg" />

        <!-- Title -->
        <div class="text-center">
          <h1 class="text-white text-3xl font-bold tracking-widest drop-shadow-md">社團管理系統</h1>
        </div>

        <!-- Form -->
        <div class="w-full max-w-sm flex flex-col gap-4">
          <!-- Email Input -->
          <div class="glass-effect rounded-xl p-1">
            <input
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none"
            />
          </div>

          <!-- Password Input -->
          <div class="glass-effect rounded-xl p-1 relative">
            <div class="flex items-center">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none"
              />
              <button
                @click="showPassword = !showPassword"
                type="button"
                class="pr-4 text-white/70 hover:text-white transition-colors"
              >
                <i class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</i>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">
            {{ errorMessage }}
          </div>

          <!-- Login Button -->
          <button
            @click="handleLogin"
            :disabled="loading"
            class="w-full bg-primary text-white font-bold py-3 rounded-xl glow-button text-lg tracking-wide hover:bg-primary/90 transition-all active:scale-[0.8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <!-- Links -->
          <div class="flex justify-between px-2">
            <NuxtLink to="/auth/forgetPassword" class="text-white/80 text-sm hover:text-white transition-colors">Forgot Password?</NuxtLink>
            <NuxtLink to="/auth/register" class="text-white/80 text-sm font-semibold hover:text-white transition-colors border-b border-white/30">Sign Up</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Social Login -->
      <div class="flex flex-col items-center gap-4 mt-4 w-full">
        <div class="flex items-center gap-4 w-full max-w-sm">
          <div class="h-[1px] flex-1 bg-white/20"></div>
          <span class="text-white/40 text-xs uppercase tracking-widest">or continue with</span>
          <div class="h-[1px] flex-1 bg-white/20"></div>
        </div>
        <div class="flex gap-4">
          <button 
            @click="handleGoogleLogin"
            type="button"
            class="size-12 rounded-full glass-effect flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            title="Login with Google"
          >
            <!-- Google Icon (using Material Symbols or inline SVG) -->
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Material Symbols */
i {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
