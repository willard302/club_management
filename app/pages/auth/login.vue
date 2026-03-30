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

const handleLogin = () => {
  const router = useRouter();
  console.log('Login with:', formData.value)
  router.push('/userCenter')
  
  // TODO: Implement login logic
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
          <h1 class="text-white text-3xl font-bold tracking-widest drop-shadow-md">淡江大學禪學社</h1>
          <p class="text-white/80 text-sm mt-2 tracking-widest uppercase">TKU Zen Club</p>
        </div>

        <!-- Form -->
        <div class="w-full max-w-sm flex flex-col gap-4">
          <!-- Email Input -->
          <div class="glass-effect rounded-xl p-1">
            <label class="block px-4 pt-3 text-white/90 text-xs font-semibold uppercase tracking-wider">Email</label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="university-email@tku.edu.tw"
              class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none"
            />
          </div>

          <!-- Password Input -->
          <div class="glass-effect rounded-xl p-1 relative">
            <label class="block px-4 pt-3 text-white/90 text-xs font-semibold uppercase tracking-wider">Password</label>
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

          <!-- Login Button -->
          <button
            @click="handleLogin"
            class="w-full bg-primary text-white font-bold py-3 rounded-xl glow-button text-lg tracking-wide hover:bg-primary/90 transition-all active:scale-[0.8]"
          >
            Login
          </button>

          <!-- Links -->
          <div class="flex justify-between px-2">
            <NuxtLink to="#" class="text-white/80 text-sm hover:text-white transition-colors">Forgot Password?</NuxtLink>
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
          <button class="size-12 rounded-full glass-effect flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <i class="material-symbols-outlined">cloud</i>
          </button>
          <button class="size-12 rounded-full glass-effect flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <i class="material-symbols-outlined">center_focus_strong</i>
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
