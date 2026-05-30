<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const supabase = useSupabaseClient()
const loading = ref(false)
const errorMessage = ref('')

const formData = ref({
  fullName: '',
  department: '',
  gender: '',
  bio: ''
})

const genderOptions = [
  { label: '未指定', value: '' },
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' }
]

// Fetch existing user data if any
const fetchUserData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      errorMessage.value = '使用者未登入，請重新登入。'
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      return
    }

    // Try to get existing profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      formData.value.fullName = profile.name || ''
      formData.value.department = profile.department || ''
      formData.value.gender = profile.gender || ''
      formData.value.bio = profile.bio || ''
    } else {
      // Fallback to metadata
      const metadata = user.user_metadata || {}
      formData.value.fullName = metadata.full_name || metadata.name || ''
    }
  } catch (err: any) {
    console.error('Error fetching user data:', err)
    errorMessage.value = '載入使用者資訊失敗'
  }
}

const handleCompleteRegistration = async () => {
  if (!formData.value.fullName) {
    errorMessage.value = '請輸入您的全名'
    return
  }

  if (!formData.value.department) {
    errorMessage.value = '請選擇您的校友會'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not found')

    // Import the service here to avoid side effects if needed, 
    // though generally it's fine at top level
    const { userService } = await import('@/services/userService')
    
    await userService.completeGoogleSignup({
      id: user.id,
      name: formData.value.fullName,
      department: formData.value.department,
      gender: formData.value.gender,
      bio: formData.value.bio
    })

    router.push('/')
  } catch (err: any) {
    console.error('Error completing registration:', err)
    errorMessage.value = err.message || '完成註冊失敗'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserData()
})
</script>

<template>
  <div class="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <div
        class="h-full w-full bg-cover bg-center"
        style="background-image: url('https://images.unsplash.com/photo-1499244015948-ac75439983c3?q=80&w=2070&auto=format&fit=crop')"
      ></div>
      <div class="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full px-6 py-12 overflow-y-auto">
      <div class="w-full max-w-sm flex flex-col gap-8">
        <!-- Title -->
        <div class="text-center space-y-2">
          <LogoIcon size="md" class="mx-auto mb-4" />
          <h1 class="text-white text-2xl font-bold tracking-widest drop-shadow-md text-center">歡迎加入！</h1>
        </div>

        <!-- Form -->
        <div class="flex flex-col gap-4">
          <!-- Full Name -->
          <div class="glass-effect rounded-xl p-1">
            <input
              v-model="formData.fullName"
              type="text"
              placeholder="全名"
              class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none"
            />
          </div>

          <!-- Department -->
          <div class="glass-effect rounded-xl p-1">
            <input
              v-model="formData.department"
              type="text"
              placeholder="校友會"
              class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none"
            />
          </div>

          <!-- Gender Selector -->
          <div class="glass-effect rounded-xl p-1">
            <select
              v-model="formData.gender"
              class="w-full bg-transparent border-none text-white focus:ring-0 text-base py-3 px-4 outline-none appearance-none"
            >
              <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value" class="text-slate-900">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Bio -->
          <div class="glass-effect rounded-xl p-1">
            <textarea
              v-model="formData.bio"
              rows="3"
              placeholder="個人簡介（選填）"
              class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none resize-none"
            ></textarea>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            @click="handleCompleteRegistration"
            :disabled="loading"
            class="w-full bg-white text-primary font-bold py-3 rounded-xl shadow-xl text-lg tracking-wide hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {{ loading ? '完成中...' : '完成註冊' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-white/60 text-sm">
            已完成了？
            <NuxtLink to="/" class="text-white/80 hover:text-white transition-colors">回首頁</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
