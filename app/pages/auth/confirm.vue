<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'auth'
})

const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  try {
    // 檢查是否有郵件確認 token
    const token = route.query.token as string | undefined
    const type = route.query.type as string | undefined

    if (token && type === 'email') {
      // 驗證郵件確認 token
      const { data: { user }, error } = await supabase.auth.verifyOtp({
        email: route.query.email as string,
        token: token,
        type: 'email'
      })

      if (error) {
        errorMessage.value = error.message || 'Invalid or expired email confirmation link'
        console.error('Email verification error:', error)
      } else {
        successMessage.value = 'Email verified successfully! Redirecting to home page...'
        // 延遲 2 秒後重定向
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } else {
      // 若無 token，這通常表示是 OAuth 回調（由伺服器端的 callback.ts 己經處理）
      // 顯示等待訊息或直接重定向
      errorMessage.value = 'No confirmation token found. Redirecting to login...'
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An error occurred during email confirmation'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background-light dark:bg-background-dark font-display">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <div
        class="h-full w-full bg-cover bg-center"
        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKLqnX9ZXB6k4S_M2OiUzo28rwbVbB4qgtt-CuoJnz7esDmG4EipwCVb159pJxmBEUzY0SIMcJffb8sBWx7x0cCktLUUeogL4l_7CKhM4tw-WrZapPYOiXOJ_wFK0XCHI8tjk2PkDynPSxN-hiE_8DwZJ0-k355BY8O0Jn4yeAvRUuQ6juPcePLPZzromKaH4sAy7R06qG24jk8u4mJDZr3UbyPmicNP-tofDjENIMKDtGvnRYe5SgAVTeEDieQCXIlvpG11VqryQ')"
      ></div>
      <div class="absolute inset-0 bg-primary/10"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-center gap-6 px-6 max-w-sm">
      <!-- Logo -->
      <ZenLogo size="lg" />

      <!-- Title -->
      <h1 class="text-white text-3xl font-bold tracking-widest drop-shadow-md text-center">
        Email Confirmation
      </h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-white/70">Verifying your email...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="successMessage" class="text-center">
        <div class="text-green-400 text-4xl mb-4">✓</div>
        <p class="text-green-400 text-lg font-semibold">{{ successMessage }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="text-center">
        <div class="text-red-400 text-4xl mb-4">⚠</div>
        <p class="text-red-400 text-lg">{{ errorMessage }}</p>
        <NuxtLink
          to="/auth/login"
          class="mt-6 inline-block bg-primary text-white font-bold py-2 px-6 rounded-xl hover:bg-primary/90 transition-all"
        >
          Back to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
