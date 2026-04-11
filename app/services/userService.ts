import type { UserProfile, Activity, Role } from '@/types'
import type { Database } from '@/types/database.types'

/**
 * 使用者相關的 API 服務，負責網路請求 (Data Layer)
 */
export const userService = {
  /**
   * 取得使用者詳細資料
   */
  async fetchUserProfile(): Promise<UserProfile> {
    try {
      const supabase = useSupabaseClient<Database>()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const metadata = user.user_metadata || {}

      return {
        name: metadata.name || user.email?.split('@')[0] || 'User',
        role: (metadata.role as Role) ?? 'Role.member',
        joinDate: metadata.join_date || 'Since 2024',
        totalMeditation: metadata.total_meditation || '0h',
        monthlyCheckIns: metadata.monthly_checkins || '0次',
        department: metadata.department || 'Department',
        studentId: metadata.student_id || '000000000',
        avatar: metadata.avatar_url || undefined,
        dateOfBirth: metadata.date_of_birth,
        gender: metadata.gender,
        bio: metadata.bio
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // 返回默認資料
      return {
        name: 'User Name',
        role: 'Role.member',
        joinDate: 'Since 2024',
        totalMeditation: '12.5h',
        monthlyCheckIns: '8次',
        department: 'Department Name',
        studentId: '410012345',
        avatar: undefined,
        dateOfBirth: undefined,
        gender: undefined,
        bio: undefined
      }
    }
  },

  /**
   * 上傳大頭照
   */
  async uploadAvatar(file: File, supabase: any): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      // 檢查檔案大小 (3MB)
      if (file.size > 3 * 1024 * 1024) {
        throw new Error('檔案大小不能超過 3MB')
      }

      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        throw new Error('請選擇圖片檔案')
      }

      // 生成檔案名稱 (user_id + timestamp + extension)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`

      // 如果有舊的大頭照，先刪除
      const currentMetadata = user.user_metadata || {}
      if (currentMetadata.avatar_path) {
        await userService.deleteOldAvatar(currentMetadata.avatar_path, supabase)
      }

      // 上傳到 Supabase Storage
      const { data, error } = await supabase.storage
        .from('icc_avatar')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 取得公開 URL
      const { data: urlData } = supabase.storage
        .from('icc_avatar')
        .getPublicUrl(fileName)
      const publicUrl = urlData.publicUrl

      // 更新 metadata：同時儲存 avatar_path（供刪除用）與 avatar_url（直接存取用）
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          avatar_path: fileName,
          avatar_url: publicUrl
        }
      })

      if (updateError) throw updateError

      return publicUrl
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      throw new Error(error.message || '上傳大頭照失敗')
    }
  },

  /**
   * 刪除舊的大頭照檔案
   */
  async deleteOldAvatar(avatarPath: string, supabase: any): Promise<void> {
    try {
      if (avatarPath) {
        await supabase.storage
          .from('icc_avatar')
          .remove([avatarPath])
      }
    } catch (error) {
      console.error('Error deleting old avatar:', error)
      // 不拋出錯誤，因為這不是關鍵操作
    }
  },

  /**
   * 取得使用者的近期活動
   */
  async fetchRecentActivities(): Promise<Activity[]> {
    // 這裡通常會使用 $fetch 呼叫後端 API
    // return await $fetch('/api/user/activities')

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            type: 'meditation',
            date: 'Today',
            title: 'Morning Meditation',
            duration: '30 mins',
            icon: 'self_improvement'
          },
          {
            type: 'event',
            date: 'Yesterday',
            title: 'Weekly Gathering',
            duration: '1 hour',
            icon: 'groups'
          },
          {
            type: 'meditation',
            date: 'Mar 28',
            title: 'Evening Session',
            duration: '45 mins',
            icon: 'self_improvement'
          }
        ])
      }, 300)
    })
  },

  /**
   * 初始化使用者 metadata（於註冊時調用）
   */
  async initializeUserMetadata(
    supabase: any,
    displayName: string,
    studentId?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const currentMetadata = user.user_metadata || {}

      // 更新用戶 metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          name: displayName, // display_name 綁定
          display_name: displayName, // 備份字段
          student_id: studentId || '',
          join_date: new Date().toISOString().split('T')[0],
          role: 'Club Member',
          department: 'Department',
          total_meditation: '0h',
          monthly_checkins: '0次'
        }
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Error initializing user metadata:', error)
      throw new Error(error.message || 'Failed to initialize user metadata')
    }
  },

  /**
   * 更新使用者的完整資料（包含 display_name 和所有邊樣資訊）
   * @param supabase Supabase 客戶端實例
   * @param profileData 用戶資料物件
   */
  async updateUserProfile(
    supabase: any,
    profileData: {
      name?: string
      studentId?: string
      role?: string
      department?: string
      dateOfBirth?: string
      gender?: string
      bio?: string
    }
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const currentMetadata = user.user_metadata || {}

      // 構建更新物件，只包含提供的字段
      const updateData: Record<string, any> = {
        ...currentMetadata
      }

      if (profileData.name !== undefined) {
        updateData.name = profileData.name
        updateData.display_name = profileData.name
      }

      if (profileData.studentId !== undefined) {
        updateData.student_id = profileData.studentId
      }

      if (profileData.role !== undefined) {
        updateData.role = profileData.role
      }

      if (profileData.department !== undefined) {
        updateData.department = profileData.department
      }

      if (profileData.dateOfBirth !== undefined) {
        updateData.date_of_birth = profileData.dateOfBirth
      }

      if (profileData.gender !== undefined) {
        updateData.gender = profileData.gender
      }

      if (profileData.bio !== undefined) {
        updateData.bio = profileData.bio
      }

      // 更新用戶 metadata
      const { error } = await supabase.auth.updateUser({
        data: updateData
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Error updating user profile:', error)
      throw new Error(error.message || 'Failed to update user profile')
    }
  },

  /**
   * 更新使用者 display_name 與相關資訊（便利方法）
   * @deprecated 使用 updateUserProfile 代替，保留此方法以向後兼容
   */
  async updateDisplayName(
    supabase: any,
    displayName: string,
    additionalData?: {
      role?: string
      department?: string
      dateOfBirth?: string
      gender?: string
      bio?: string
    }
  ): Promise<void> {
    await userService.updateUserProfile(supabase, {
      name: displayName,
      role: additionalData?.role,
      department: additionalData?.department,
      dateOfBirth: additionalData?.dateOfBirth,
      gender: additionalData?.gender,
      bio: additionalData?.bio
    })
  },

  /**
   * 取得使用者的認證 metadata
   */
  async getUserAuthMetadata(): Promise<Record<string, any>> {
    try {
      const supabase = useSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      return user.user_metadata || {}
    } catch (error: any) {
      console.error('Error fetching user auth metadata:', error)
      return {}
    }
  },

  /**
   * 修改使用者密碼
   * @param currentPassword 當前密碼
   * @param newPassword 新密碼
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const supabase = useSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      // 驗證密碼長度
      if (!newPassword || newPassword.length < 6) {
        throw new Error('新密碼至少需要6個字符')
      }

      if (currentPassword.length === 0) {
        throw new Error('請輸入當前密碼')
      }

      // 首先使用舊密碼重新認證以驗證用戶身份
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      })

      if (signInError) {
        throw new Error('當前密碼不正確')
      }

      // 然後更新密碼
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw new Error(updateError.message || '修改密碼失敗')
      }
    } catch (error: any) {
      console.error('Error changing password:', error)
      throw new Error(error.message || '修改密碼失敗')
    }
  }
}
