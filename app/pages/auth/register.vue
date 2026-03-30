<script setup lang="ts">
import { ref } from 'vue'
import type { RegisterFormData } from '@/types'

definePageMeta({
  layout: 'auth'
})

const formData = ref<RegisterFormData>({
  fullName: '',
  studentId: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)

const handleRegister = () => {
  console.log('Register with:', formData.value)
  // TODO: Implement registration logic
}
</script>
<template>
  <div class="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden max-w-full">
    <!-- Hero Section with Background Image -->
    <div class="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden min-h-[160px] relative shadow-lg" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDgikn6xndc6b81auSFUuHvXMxgVFzpZbjSBYb3vJeufHCcJJr6LwMi-N3ecO0zG7kVwdP6-PVDClIlHPVG6-O8QVCvp-vdXMOICqJWwfRnNneu6nNeHMTlR19yucoqXullhXJ07qvYjYxISAk4_nYAhG1wZtdVbiqG_yDA4ErihwyqBAYIcBjq3pnUbxovStiHkNuSeNPoFt3HGuKZitv_U3ooygHK6EKVcw_YT8KHAM2aFfCLgp3VN7bBRWRl917yYzsgu65hwMo");'>
      <!-- Overlay for text readability -->
      <div class="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent"></div>

      <!-- Top Logo -->
      <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <ZenLogo size="sm" />
      </div>

      <!-- Header Content in Hero Section -->
      <div class="relative p-6">
        <h2 class="text-slate-900 text-2xl font-bold leading-tight tracking-tight">TKU Zen Club</h2>
        <p class="text-slate-700 text-sm font-medium">Join our peaceful community</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1">
      <!-- Header Text -->
      <div class="px-6 pt-6 pb-2">
        <h2 class="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight">Create Account</h2>
        <p class="text-slate-500 dark:text-slate-400 text-base font-normal mt-1">Start your journey to inner peace and mindfulness.</p>
      </div>

      <!-- Registration Form -->
      <div class="flex flex-col gap-4 px-6 py-4">
        <!-- Student ID -->
        <label class="flex flex-col gap-2">
          <span class="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">Student ID</span>
          <div class="relative group">
            <i class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">badge</i>
            <input
              v-model="formData.studentId"
              type="text"
              placeholder="e.g. 410012345"
              class="form-input block w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
        </label>

        <!-- Email -->
        <label class="flex flex-col gap-2">
          <span class="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">Account</span>
          <div class="relative group">
            <i class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</i>
            <input
              v-model="formData.email"
              type="email"
              placeholder="name@email.com"
              class="form-input block w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
        </label>

        <!-- Password -->
        <label class="flex flex-col gap-2">
          <span class="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">Password</span>
          <div class="relative group">
            <i class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</i>
            <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create a password"
              class="form-input block w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
            <button
              @click="showPassword = !showPassword"
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <i class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</i>
            </button>
          </div>
        </label>

        <!-- Confirm Password -->
        <label class="flex flex-col gap-2">
          <span class="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">Confirm Password</span>
          <div class="relative group">
            <i class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</i>
            <input
              v-model="formData.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Re-enter your password"
              class="form-input block w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
            <button
              @click="showPassword = !showPassword"
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <i class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</i>
            </button>
          </div>
        </label>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-4 px-6 py-6 mb-10">
        <button
          @click="handleRegister"
          class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          Register
        </button>
        <div class="flex items-center justify-center gap-2 mt-2">
          <p class="text-slate-500 dark:text-slate-400 text-sm">Already have an account?</p>
          <NuxtLink to="/auth/login" class="text-primary font-semibold text-sm hover:underline">Back to Login</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Footer Spacer for Mobile View -->
    <div class="h-6 bg-transparent"></div>
  </div>
</template>

<style scoped>
/* Material Symbols */
i {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Form Input Styling */
input {
  box-sizing: border-box;
}

input:focus {
  outline: none;
}
</style>
