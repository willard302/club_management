import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/services/userService'
import type { UserProfile, Activity, Role } from '@/types'

/**
 * Logic Layer: 使用者的業務邏輯與狀態管理
 */
export function useUser() {
  const router = useRouter()
  const supabase = useSupabaseClient()

  // 狀態 (State)
  const userProfile = ref<UserProfile | null>(null)
  const recentActivities = ref<Activity[]>([])
  const isLoading = ref(false)
  const isUploadingAvatar = ref(false)
  const isUpdatingProfile = ref(false)
  const isChangingPassword = ref(false)
  const error = ref<string | null>(null)

  // 動作 (Actions)
  const loadUserData = async () => {
    isLoading.value = true
    error.value = null
    try {
      // 呼叫 Data Layer (這兩支可以放 Promise.all 提升效能)
      const [profileData, activitiesData] = await Promise.all([
        userService.fetchUserProfile(),
        userService.fetchRecentActivities()
      ])

      console.log('Fetched user profile:', profileData)

      userProfile.value = profileData
      recentActivities.value = activitiesData
    } catch (err: any) {
      error.value = err.message || 'Failed to load user data'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!userProfile.value) return

    isUploadingAvatar.value = true
    error.value = null

    try {
      // 上傳新大頭照
      const avatarUrl = await userService.uploadAvatar(file, supabase)

      // 更新本地狀態
      userProfile.value.avatar = avatarUrl

      // 重新載入用戶資料確保資料一致性
      await loadUserData()
    } catch (err: any) {
      error.value = err.message || 'Failed to upload avatar'
      console.error(err)
      throw err
    } finally {
      isUploadingAvatar.value = false
    }
  }

  /**
   * 更新使用者的 display_name 和其他個人資訊
   * @deprecated 使用 updateUserProfile 代替，保留此方法以向後兼容
   */
  const updateDisplayName = async (
    displayName: string,
    additionalData?: {
      role?: string
      department?: string
      dateOfBirth?: string
      gender?: string
      bio?: string
    }
  ) => {
    await updateUserProfile({
      name: displayName,
      ...additionalData
    })
  }

  /**
   * 更新使用者個人資料（統一方法）
   */
  const updateUserProfile = async (
    profileData: {
      name?: string
      studentId?: string
      role?: string
      department?: string
      dateOfBirth?: string
      gender?: string
      bio?: string
    }
  ) => {
    if (!userProfile.value) return

    isUpdatingProfile.value = true
    error.value = null

    try {
      // 呼叫 userService 更新 metadata
      await userService.updateUserProfile(supabase, profileData)

      // 更新本地狀態
      if (profileData.name !== undefined) userProfile.value.name = profileData.name
      if (profileData.studentId !== undefined) userProfile.value.studentId = profileData.studentId
      if (profileData.role !== undefined) userProfile.value.role = profileData.role as Role
      if (profileData.department !== undefined) userProfile.value.department = profileData.department
      if (profileData.dateOfBirth !== undefined) userProfile.value.dateOfBirth = profileData.dateOfBirth
      if (profileData.gender !== undefined) userProfile.value.gender = profileData.gender
      if (profileData.bio !== undefined) userProfile.value.bio = profileData.bio

      // 重新載入用戶資料確保資料一致性
      await loadUserData()
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile'
      console.error(err)
      throw err
    } finally {
      isUpdatingProfile.value = false
    }
  }

  const handleLogout = () => {
    // 這裡可以處理清除 Token 等邏輯
    // ...

    // 跳轉回登入頁
    router.push('/auth/login')
  }

  /**
   * 修改密碼
   */
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    error.value = null

    // 驗證確認密碼是否相同
    if (newPassword !== confirmPassword) {
      error.value = '新密碼和確認密碼不相符'
      throw new Error(error.value)
    }

    // 驗證新密碼和舊密碼是否不同
    if (currentPassword === newPassword) {
      error.value = '新密碼不能與當前密碼相同'
      throw new Error(error.value)
    }

    isChangingPassword.value = true

    try {
      await userService.changePassword(currentPassword, newPassword)
    } catch (err: any) {
      error.value = err.message || 'Failed to change password'
      console.error(err)
      throw err
    } finally {
      isChangingPassword.value = false
    }
  }

  return {
    userProfile,
    recentActivities,
    isLoading,
    isUploadingAvatar,
    isUpdatingProfile,
    isChangingPassword,
    error,
    loadUserData,
    uploadAvatar,
    updateDisplayName,
    updateUserProfile,
    changePassword,
    handleLogout
  }
}
