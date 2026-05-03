<script setup lang="ts">
import type { StatCard, MenuItem } from '@/types';

definePageMeta({
  layout: 'default'
})

const { t, locale, setLocale } = useI18n()

const toggleLanguage = () => {
  setLocale(locale.value === 'zh-TW' ? 'en-US' : 'zh-TW')
}

// 使用 useUser composable
const {
  userProfile,
  isUploadingAvatar,
  loadUserData,
  uploadAvatar
} = useUser()

// 使用 Toast
const { error: showErrorToast } = useToast()

// 載入用戶資料
onMounted(() => {
  loadUserData()
})

// 檔案輸入引用
const fileInput = ref<HTMLInputElement | null>(null)

// 處理大頭照點擊
const handleAvatarClick = () => {
  fileInput.value?.click()
}

// 處理檔案選擇
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    await uploadAvatar(file)
    // 成功上傳後清除檔案輸入
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (err: any) {
    // 顯示錯誤Toast
    showErrorToast(err.message || '上傳大頭照失敗')
    // 清除檔案輸入
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// 獲取大頭照URL，如果沒有則使用預設圖片
const getAvatarUrl = () => {
  return userProfile.value?.avatar || '/images/avatar_default.png'
}

// 統計數據
const stats = computed<StatCard[]>(() => [
  { icon: 'avg_time', label: t('totalMeditation'), value: userProfile.value?.totalMeditation || '0h' },
  { icon: 'calendar_month', label: t('monthlyCheckIns'), value: userProfile.value?.monthlyCheckIns || '0次' }
])

const menuItems = computed<MenuItem[]>(() => [
  { icon: 'account_balance_wallet', label: t('ledger'), path: '/ledger' },
  { icon: 'person_edit', label: t('editProfile'), path: '/userCenter/userInfo' },
  { icon: 'lock_reset', label: t('changePassword.title'), path: '/userCenter/changePassword' }
])
</script>

<template>
  <!-- Header Section -->
  <AppHeader :title="t('profile')" bg-class="sky-gradient" :has-padding="true"></AppHeader>

    <!-- Main Content -->
    <main class="flex-1 -mt-4 px-4 pb-24 relative z-40">
      <!-- Profile Info Card -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 flex flex-col items-center text-center mb-6">
        <div class="relative -mt-20 mb-4 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg">
          <div
            class="w-32 h-32 rounded-full border-4 border-dashed border-primary/30 p-1 overflow-hidden cursor-pointer transition-transform hover:scale-105 relative"
            @click="handleAvatarClick"
          >
            <!-- Loading overlay -->
            <div
              v-if="isUploadingAvatar"
              class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10"
            >
              <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div
              class="w-full h-full rounded-full bg-cover bg-center"
              :style="{ backgroundImage: `url('${getAvatarUrl()}')` }"
            ></div>

            <!-- Upload hint -->
            <div class="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors">
              <span class="material-symbols-outlined text-white opacity-0 hover:opacity-100 transition-opacity">photo_camera</span>
            </div>
          </div>
        </div>

        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />

        <div class="mb-4">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
            {{ userProfile?.name || $t('loading') }}
          </h2>
          <div class="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <span class="text-sm font-semibold px-3 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
              {{ userProfile?.role ? $t(`${userProfile.role}`) : $t('Role.member') }}
            </span>
          </div>
        </div>

        <div class="w-full grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
          <div class="text-left">
            <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('department') }}</p>
            <p class="font-semibold text-slate-800 dark:text-slate-200">{{ userProfile?.department || t('loading') }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('studentId') }}</p>
            <p class="font-semibold text-slate-800 dark:text-slate-200">{{ userProfile?.studentId || t('loading') }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="glass-card rounded-2xl p-4 flex flex-col items-center text-center shadow-sm"
        >
          <span class="material-symbols-outlined text-primary mb-2">{{ stat.icon }}</span>
          <p class="text-xs text-slate-600 dark:text-slate-300">{{ stat.label }}</p>
          <p class="text-xl font-bold text-primary">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Action Items List -->
      <div class="space-y-3 mb-8">
        <h3 class="px-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ t('accountSettings') }}</h3>
        <div class="bg-white/80 dark:bg-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div
            class="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors border-b border-slate-50 dark:border-slate-700 cursor-pointer"
            @click="toggleLanguage"
          >
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-slate-400">language</span>
              <span class="font-medium">{{ t('language') }} ({{ locale === 'zh-TW' ? '繁體中文' : 'English' }})</span>
            </div>
            <span class="material-symbols-outlined text-slate-300">swap_horiz</span>
          </div>
          <NuxtLink
            v-for="(item, index) in menuItems"
            :key="item.label"
            :to="item.path || '#'"
            class="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors border-b border-slate-50 dark:border-slate-700"
          >
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-slate-400">{{ item.icon }}</span>
              <span class="font-medium">{{ item.label }}</span>
            </div>
            <span class="material-symbols-outlined text-slate-300">chevron_right</span>
          </NuxtLink>
          <a
            href="/auth/login"
            class="flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div class="flex items-center gap-3 text-red-500">
              <span class="material-symbols-outlined">logout</span>
              <span class="font-bold">{{ t('logout') }}</span>
            </div>
          </a>
        </div>
      </div>
    </main>

</template>

<style scoped>
:root {
  --primary: #0ea5e9;
  --logo-red: #EF4444;
  --logo-yellow: #FBBF24;
  --logo-green: #22C55E;
}

.sky-gradient {
  background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%);
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
