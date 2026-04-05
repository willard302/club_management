import { ref, onMounted } from 'vue'
import { userService } from '@/services/userService'
import type { UserProfile } from '@/types'

/**
 * 管理用戶信息編輯頁面的狀態與邏輯
 */
export function useUserInfo() {
  const supabase = useSupabaseClient()

  // 表單狀態
  const formData = ref({
    name: '',
    studentId: '',
    department: '',
    dateOfBirth: '',
    gender: '',
    bio: ''
  })

  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  // 載入用戶信息用於預填表單
  const loadUserInfo = async () => {
    isLoading.value = true
    error.value = null

    try {
      const profile = await userService.fetchUserProfile()

      formData.value = {
        name: profile.name || '',
        studentId: profile.studentId || '',
        department: profile.department || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        bio: profile.bio || ''
      }
    } catch (err: any) {
      error.value = err.message || '載入用戶信息失敗'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // 更新用戶信息
  const updateUserInfo = async () => {
    isSaving.value = true
    error.value = null
    success.value = false

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      // 更新用戶 metadata
      const currentMetadata = user.user_metadata || {}
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          name: formData.value.name,
          student_id: formData.value.studentId,
          department: formData.value.department,
          date_of_birth: formData.value.dateOfBirth,
          gender: formData.value.gender,
          bio: formData.value.bio
        }
      })

      if (updateError) throw updateError

      success.value = true
      // 3 秒後清除成功提示
      setTimeout(() => {
        success.value = false
      }, 3000)
    } catch (err: any) {
      error.value = err.message || '保存失敗'
      console.error(err)
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // 初始化時載入用戶信息
  onMounted(() => {
    loadUserInfo()
  })

  return {
    formData,
    isLoading,
    isSaving,
    error,
    success,
    loadUserInfo,
    updateUserInfo
  }
}
