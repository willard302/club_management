<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()

const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  // Wait a bit to ensure the auth state is ready
  await new Promise((resolve) => setTimeout(resolve, 300))

  const hash = route.hash
  const error = route.query.error as string
  const errorDescription = route.query.error_description as string

  // Handle OAuth or PKCE errors from the URL
  if (error) {
    errorMessage.value = errorDescription || '驗證過程中發生錯誤'
    loading.value = false
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
    return
  }

  // Also check for error parameters in the hash (Supabase sometimes puts them there)
  const hashParams = new URLSearchParams(hash.substring(1))
  const oauthError = hashParams.get('error_description')
  if (oauthError) {
    errorMessage.value = decodeURIComponent(oauthError)
    loading.value = false
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
    return
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) throw userError

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile || !profile.department) {
        // Initialize profile if it doesn't exist
        if (!profile) {
          const metadata = user.user_metadata || {}
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: metadata.name || metadata.full_name || user.email?.split('@')[0] || 'User',
              avatar_url: metadata.avatar_url || null,
              role: 'member',
              points: 0
            })
        }
        
        successMessage.value = '登入成功！即將跳轉完善資料...'
        loading.value = false
        setTimeout(() => {
          router.push('/auth/google-signup')
        }, 1500)
      } else {
        successMessage.value = '驗證成功！即將跳轉首頁...'
        loading.value = false
        setTimeout(() => {
          router.push('/')
        }, 1500)
      }
    }
  } catch (err: any) {
    console.error('Confirmation error:', err)
    // If there's an error but we're already logged in, just redirect to home
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/')
    } else {
      errorMessage.value = err.message || '電子郵件確認時發生錯誤'
      loading.value = false
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
      }, 3000)
    }
  }
})
</script>

<template>
  <div class="relative flex h-screen w-full flex-col overflow-hidden bg-primary font-display">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-white/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
      <div class="w-full max-w-sm glass-effect rounded-[2.5rem] p-10 shadow-2xl space-y-8 border border-white/20">
        <div class="size-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-primary">
          <span v-if="loading" class="material-symbols-outlined text-5xl animate-spin">progress_activity</span>
          <span v-else-if="errorMessage" class="material-symbols-outlined text-5xl text-red-500">error</span>
          <span v-else class="material-symbols-outlined text-5xl text-green-500">check_circle</span>
        </div>

        <div class="space-y-3">
          <h1 class="text-white text-2xl font-bold tracking-tight">電子郵件確認</h1>
          
          <div v-if="loading" class="space-y-4">
            <p class="text-white/70">正在驗證您的電子郵件...</p>
            <div class="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div class="bg-white h-full animate-progress-bar"></div>
            </div>
          </div>

          <p v-else-if="errorMessage" class="text-red-200 font-medium">
            {{ errorMessage }}
          </p>

          <p v-else-if="successMessage" class="text-green-200 font-medium">
            {{ successMessage }}
          </p>
        </div>

        <div class="pt-4">
          <NuxtLink 
            to="/auth/login" 
            class="inline-flex items-center gap-2 text-white/60 hover:text-white font-bold transition-colors"
          >
            <span class="material-symbols-outlined text-xl">arrow_back</span>
            <span>返回登入</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

@keyframes progress-bar {
  0% { width: 0%; transform: translateX(-100%); }
  50% { width: 70%; transform: translateX(0); }
  100% { width: 100%; transform: translateX(100%); }
}

.animate-progress-bar {
  width: 100%;
  animation: progress-bar 2s infinite ease-in-out;
}
</style>
