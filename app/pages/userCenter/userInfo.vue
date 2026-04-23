<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

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
    showSuccessToast(t('userInfo.avatarSuccess'))
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  } catch (err: any) {
    showErrorToast(err.message || t('userInfo.avatarError'))
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
    showSuccessToast(t('userInfo.saveSuccess'))
  } catch (err: any) {
    showErrorToast(err.message || t('userInfo.saveError'))
  }
}

// 獲取大頭照 URL
const getAvatarUrl = () => {
  return userProfile.value?.avatar || '/images/avatar_default.png'
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
    <AppPageHeader :title="t('userInfo.title')" @back="goBack" />

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
          <p class="text-sky-500 font-semibold">{{ t('ledger.systemTitle') }}</p>
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
          {{ t('userInfo.saveSuccess') }}
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">{{ t('userInfo.name') }}</label>
          <input 
            v-model="formData.name"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" 
            :placeholder="t('userInfo.placeholderName')" 
            type="text"
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">{{ t('userInfo.studentId') }}</label>
          <input 
            v-model="formData.studentId"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" 
            :placeholder="t('userInfo.placeholderStudentId')" 
            type="text"
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">{{ t('userInfo.department') }}</label>
          <input 
            v-model="formData.department"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" 
            :placeholder="t('userInfo.placeholderDepartment')" 
            type="text"
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">{{ t('userInfo.dateOfBirth') }}</label>
          <input 
            v-model="formData.dateOfBirth"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" 
            :placeholder="t('userInfo.placeholderDOB')" 
            type="date"
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">{{ t('userInfo.gender') }}</label>
          <select 
            v-model="formData.gender"
            class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm text-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <option value="">{{ t('userInfo.placeholderGender') }}</option>
            <option value="male">{{ t('userInfo.genderMale') }}</option>
            <option value="female">{{ t('userInfo.genderFemale') }}</option>
            <option value="other">{{ t('userInfo.genderOther') }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">{{ t('userInfo.bio') }}</label>
          <textarea 
            v-model="formData.bio"
            class="w-full p-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 resize-none text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed" 
            :placeholder="t('userInfo.bioPlaceholder')" 
            rows="3"
            :disabled="isLoading"
          ></textarea>
        </div>
      </div>

      <!-- Save Button -->
      <div class="pt-4 space-y-3">
        <button 
          @click="handleSave"
          :disabled="isSaving || isLoading"
          class="w-full h-14 bg-sky-500 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/20 hover:bg-sky-500/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isSaving" class="material-symbols-outlined">save</span>
          <span v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isSaving ? t('changePassword.submitting') : t('ledger.saveRecord') }}
        </button>

        <!-- Change Password Button -->
        <button 
          @click="router.push('/userCenter/changePassword')"
          class="w-full h-14 bg-white/60 text-sky-600 font-bold rounded-2xl border-2 border-sky-500/30 hover:bg-white/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined">lock</span>
          {{ t('changePassword.title') }}
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
</style>
