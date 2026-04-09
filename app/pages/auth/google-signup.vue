<script setup lang="ts">
import { ref } from 'vue'
import type { GoogleSignupFormData } from '@/types'

definePageMeta({
  layout: 'auth'
})

const supabase = useSupabaseClient()
const router = useRouter()
const { completeGoogleSignup } = useUser()

const formData = ref<GoogleSignupFormData>({
  fullName: '',
  studentId: '',
  department: '',
  dateOfBirth: '',
  gender: 'Not specified',
  bio: ''
})

const loading = ref(false)
const errorMessage = ref('')
const googleUserInfo = ref<{
  name?: string
  email?: string
  picture?: string
} | null>(null)

// 頁面載入時取得 Google 使用者資訊
const loadGoogleUserInfo = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      errorMessage.value = 'User not authenticated. Please login again.'
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      return
    }

    // 從 user 物件取得 Google 提供的資訊
    googleUserInfo.value = {
      name: user.user_metadata?.name || '',
      email: user.email || '',
      picture: user.user_metadata?.picture || ''
    }

    // 預填名字
    if (googleUserInfo.value.name) {
      formData.value.fullName = googleUserInfo.value.name
    }
  } catch (err: any) {
    console.error('Error loading Google user info:', err)
    errorMessage.value = 'Failed to load user information'
  }
}

const handleSubmit = async () => {
  // 驗證必填欄位
  if (!formData.value.fullName.trim()) {
    errorMessage.value = 'Please enter your full name'
    return
  }

  if (!formData.value.studentId.trim()) {
    errorMessage.value = 'Please enter your student ID'
    return
  }

  if (!formData.value.department.trim()) {
    errorMessage.value = 'Please select your department'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    // 上傳 Google 頭像（如果存在）
    let avatarPath: string | undefined
    if (googleUserInfo.value?.picture) {
      try {
        const response = await fetch(googleUserInfo.value.picture)
        const blob = await response.blob()
        const file = new File([blob], 'google-avatar.jpg', { type: 'image/jpeg' })

        // 使用 useUser 的 uploadAvatar 方法（但不重新載入，因為還在設置中）
        // 這裡直接調用 userService.uploadAvatar
        const { userService } = await import('@/services/userService')
        avatarPath = await userService.uploadAvatar(file, supabase)
      } catch (err) {
        console.warn('Failed to upload Google avatar:', err)
        // 不中斷流程，頭像上傳失敗不影響註冊
      }
    }

    // 完成用戶資料補填
    await completeGoogleSignup({
      fullName: formData.value.fullName,
      studentId: formData.value.studentId,
      department: formData.value.department,
      dateOfBirth: formData.value.dateOfBirth,
      gender: formData.value.gender,
      bio: formData.value.bio,
      avatarPath: avatarPath
    })

    // 重定向到首頁
    router.push('/')
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to complete registration'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadGoogleUserInfo()
})
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
      <!-- Header -->
      <div class="flex flex-col items-center gap-4 w-full">
        <ZenLogo size="md" />
        <h1 class="text-white text-2xl font-bold tracking-widest drop-shadow-md text-center">Complete Your Profile</h1>
      </div>

      <!-- Form -->
      <div class="w-full max-w-sm flex flex-col gap-4 my-auto">
        <!-- Google User Info Display -->
        <div v-if="googleUserInfo" class="glass-effect rounded-xl p-4 mb-4">
          <div class="flex items-center gap-3">
            <img
              v-if="googleUserInfo.picture"
              :src="googleUserInfo.picture"
              alt="Google Avatar"
              class="w-10 h-10 rounded-full"
            />
            <div class="flex-1 text-white text-sm">
              <p class="font-semibold">{{ googleUserInfo.name }}</p>
              <p class="text-white/70">{{ googleUserInfo.email }}</p>
            </div>
          </div>
        </div>

        <!-- Full Name Input -->
        <div class="glass-effect rounded-xl p-1">
          <input
            v-model="formData.fullName"
            type="text"
            placeholder="Full Name"
            class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none"
          />
        </div>

        <!-- Student ID Input -->
        <div class="glass-effect rounded-xl p-1">
          <input
            v-model="formData.studentId"
            type="text"
            placeholder="Student ID"
            class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none"
          />
        </div>

        <!-- Department Input -->
        <div class="glass-effect rounded-xl p-1">
          <input
            v-model="formData.department"
            type="text"
            placeholder="Department (e.g., Engineering, Business)"
            class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none"
          />
        </div>

        <!-- Date of Birth Input -->
        <div class="glass-effect rounded-xl p-1">
          <input
            v-model="formData.dateOfBirth"
            type="date"
            class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none"
          />
        </div>

        <!-- Gender Select -->
        <div class="glass-effect rounded-xl p-1">
          <select
            v-model="formData.gender"
            class="w-full bg-transparent border-none text-white focus:ring-0 text-base py-3 px-4 outline-none"
          >
            <option value="Not specified" class="bg-gray-800">Not specified</option>
            <option value="Male" class="bg-gray-800">Male</option>
            <option value="Female" class="bg-gray-800">Female</option>
            <option value="Other" class="bg-gray-800">Other</option>
          </select>
        </div>

        <!-- Bio Textarea -->
        <div class="glass-effect rounded-xl p-1">
          <textarea
            v-model="formData.bio"
            placeholder="Bio (optional)"
            rows="3"
            class="w-full bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 text-base py-3 px-4 outline-none resize-none"
          ></textarea>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">
          {{ errorMessage }}
        </div>

        <!-- Submit Button -->
        <button
          @click="handleSubmit"
          :disabled="loading"
          class="w-full bg-primary text-white font-bold py-3 rounded-xl glow-button text-lg tracking-wide hover:bg-primary/90 transition-all active:scale-[0.8] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Completing...' : 'Complete Registration' }}
        </button>
      </div>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-white/50 text-sm">
          Already completed?
          <NuxtLink to="/" class="text-white/80 hover:text-white transition-colors">Go Home</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
select option {
  background-color: #1f2937;
  color: white;
}
</style>
