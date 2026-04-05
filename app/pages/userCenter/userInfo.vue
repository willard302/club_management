<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

definePageMeta({
  layout: 'default'
})

// 使用 useUser 獲取用戶信息（用於大頭照）
const { userProfile, uploadAvatar, isUploadingAvatar, loadUserData } = useUser()

// 使用 useUserInfo 管理表單狀態
const { formData, isLoading, isSaving, error, success, updateUserInfo } = useUserInfo()

// 使用 Toast
const { success: showSuccessToast, error: showErrorToast } = useToast()

const goBack = () => {
  router.back()
}

// 處理大頭照點擊
const avatarInput = ref<HTMLInputElement | null>(null)
const handleAvatarClick = () => {
  avatarInput.value?.click()
}

// 處理大頭照上傳
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    await uploadAvatar(file)
    // 重新載入用戶資料確保最新
    await loadUserData()
    showSuccessToast('大頭照上傳成功')
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  } catch (err: any) {
    showErrorToast(err.message || '上傳大頭照失敗')
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  }
}

// 處理保存
const handleSave = async () => {
  try {
    await updateUserInfo()
    // 重新載入用戶資料確保同步
    await loadUserData()
    showSuccessToast('個人資料已更新')
  } catch (err: any) {
    showErrorToast(err.message || '保存失敗')
  }
}

// 獲取大頭照 URL
const getAvatarUrl = () => {
  return userProfile.value?.avatar || 'https://via.placeholder.com/128x128?text=No+Avatar'
}

// 初始化時載入用戶資料
onMounted(() => {
  loadUserData()
})

// 在離開頁面前同步數據
onBeforeUnmount(async () => {
  // 確保返回時數據是最新的
  await loadUserData()
})
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col bg-[#f0f9ff] overflow-x-hidden pb-16">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-sky-500/10">
      <button @click="goBack" class="flex items-center justify-center p-2 rounded-full hover:bg-sky-500/10 transition-colors">
        <span class="material-symbols-outlined text-sky-500">arrow_back</span>
      </button>
      <h1 class="text-lg font-bold tracking-tight text-slate-800">編輯個人資料</h1>
      <div class="concentric-logo">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </header>

    <main class="flex-1 w-full px-4 py-6 space-y-8">
      <!-- Profile Picture Section -->
      <div class="flex flex-col items-center gap-4">
        <div class="relative group">
          <div class="size-32 rounded-full bg-white p-1 shadow-xl border border-sky-500/20 overflow-hidden cursor-pointer transition-transform hover:scale-105"
            @click="handleAvatarClick">
            <img 
              :src="getAvatarUrl()" 
              alt="User avatar" 
              class="w-full h-full object-cover rounded-full"
            />
            <!-- Loading overlay -->
            <div
              v-if="isUploadingAvatar"
              class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
            >
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <button 
            class="absolute bottom-0 right-0 size-10 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-sky-500/90 transition-transform active:scale-95"
            @click="handleAvatarClick"
            :disabled="isUploadingAvatar"
          >
            <span class="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarUpload"
        />
        <div class="text-center">
          <p class="text-sky-500 font-semibold">社團管理系統</p>
        </div>
      </div>

      <!-- Form Section -->
      <div class="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-sm space-y-5 border border-white">
        <!-- Error Message -->
        <div v-if="error" class="p-3 bg-red-100 text-red-700 rounded-xl text-sm border border-red-200 flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="p-3 bg-green-100 text-green-700 rounded-xl text-sm border border-green-200 flex items-center gap-2">
          <span class="material-symbols-outlined text-base">check_circle</span>
          保存成功
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">姓名</label>
          <input 
            v-model="formData.name"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" 
            placeholder="請輸入姓名" 
            type="text"
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">學號</label>
          <input 
            v-model="formData.studentId"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" 
            placeholder="請輸入學號" 
            type="text"
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">系級</label>
          <input 
            v-model="formData.department"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" 
            placeholder="例如：資工系三年級" 
            type="text"
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">出生年月日</label>
          <input 
            v-model="formData.dateOfBirth"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" 
            placeholder="請選擇出生日期" 
            type="date"
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">性別</label>
          <select 
            v-model="formData.gender"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm text-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <option value="">請選擇性別</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">個人簡介</label>
          <textarea 
            v-model="formData.bio"
            class="w-full p-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 resize-none text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed" 
            placeholder="分享你的習禪心得..." 
            rows="3"
            :disabled="isLoading"
          ></textarea>
        </div>
      </div>

      <!-- Save Button -->
      <div class="pt-4">
        <button 
          @click="handleSave"
          :disabled="isSaving || isLoading"
          class="w-full h-14 bg-sky-500 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/20 hover:bg-sky-500/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isSaving" class="material-symbols-outlined">save</span>
          <span v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isSaving ? '保存中...' : '保存修改' }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.concentric-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 40px;
  height: 40px;
}
.circle {
  position: absolute;
  border-radius: 50%;
}
.circle-1 { width: 100%; height: 100%; background-color: #EF4444; z-index: 1; }
.circle-2 { width: 66.67%; height: 66.67%; background-color: #FBBF24; z-index: 2; }
.circle-3 { width: 33.33%; height: 33.33%; background-color: #22C55E; z-index: 3; }
</style>
