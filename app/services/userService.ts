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

      // 優先從 profiles 表獲取最新的詳細資料
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      const metadata = user.user_metadata || {}

      return {
        name: profile?.name || metadata.name || user.email?.split('@')[0] || 'User',
        role: (profile?.role as Role) || (metadata.role as Role) || 'member',
        joinDate: profile?.created_at || metadata.join_date || 'Since 2024',
        department: profile?.department || metadata.department || '',
        points: profile?.points || metadata.points || 0,
        avatar: profile?.avatar_url || metadata.avatar_url || undefined,
        phoneNumber: profile?.phone_number || metadata.phone_number || '',
        gender: profile?.gender || metadata.gender || '',
        bio: profile?.bio || metadata.bio || ''
      }
    } catch (error) {
      throw new Error('User not authenticated')
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

      // 1. 更新 profiles 表
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      // 2. 更新 auth metadata
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
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            type: 'event',
            date: 'Yesterday',
            title: 'Weekly Gathering',
            duration: '1 hour',
            icon: 'groups'
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
    points: number = 0
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const currentMetadata = user.user_metadata || {}
      
      // 更新用戶 metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          name: displayName,
          display_name: displayName,
          points: points || 0,
          join_date: new Date().toISOString().split('T')[0],
          role: 'member',
          department: ''
        }
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Error initializing user metadata:', error)
      throw new Error(error.message || 'Failed to initialize user metadata')
    }
  },

  /**
   * 更新使用者的完整資料
   * @param supabase Supabase 客戶端實例
   * @param profileData 用戶資料物件
   */
  async updateUserProfile(
    supabase: any,
    profileData: {
      name?: string
      points?: number
      role?: string
      department?: string
      phoneNumber?: string
      gender?: string
      bio?: string
    }
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const currentMetadata = user.user_metadata || {}

      // 1. 更新 profiles 表
      const dbUpdate: Record<string, any> = {}
      if (profileData.name !== undefined) dbUpdate.name = profileData.name
      if (profileData.points !== undefined) dbUpdate.points = profileData.points
      if (profileData.role !== undefined) dbUpdate.role = profileData.role
      if (profileData.department !== undefined) dbUpdate.department = profileData.department
      if (profileData.phoneNumber !== undefined) dbUpdate.phone_number = profileData.phoneNumber
      if (profileData.gender !== undefined) dbUpdate.gender = profileData.gender
      if (profileData.bio !== undefined) dbUpdate.bio = profileData.bio

      const { error: dbError } = await supabase
        .from('profiles')
        .update(dbUpdate)
        .eq('id', user.id)

      if (dbError) throw dbError

      // 2. 更新 auth metadata
      const authUpdate: Record<string, any> = { ...currentMetadata }
      if (profileData.name !== undefined) {
        authUpdate.name = profileData.name
        authUpdate.display_name = profileData.name
      }
      if (profileData.points !== undefined) authUpdate.points = profileData.points
      if (profileData.role !== undefined) authUpdate.role = profileData.role
      if (profileData.department !== undefined) authUpdate.department = profileData.department
      if (profileData.phoneNumber !== undefined) authUpdate.phone_number = profileData.phoneNumber
      if (profileData.gender !== undefined) authUpdate.gender = profileData.gender
      if (profileData.bio !== undefined) authUpdate.bio = profileData.bio

      const { error: authError } = await supabase.auth.updateUser({
        data: authUpdate
      })

      if (authError) throw authError
    } catch (error: any) {
      console.error('Error updating user profile:', error)
      throw new Error(error.message || 'Failed to update user profile')
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
  },

  /**
   * 完成 Google 註冊後的基本資料設置
   */
  async completeGoogleSignup(data: {
    id: string
    name: string
    department: string
    gender?: string
    bio?: string
  }): Promise<void> {
    try {
      const supabase = useSupabaseClient<Database>()
      
      // 1. 在 profiles 表中創建或更新資料
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.id,
          name: data.name,
          department: data.department,
          gender: data.gender,
          bio: data.bio,
          role: 'member',
          points: 0,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // 2. 更新 auth.users 的 metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          display_name: data.name,
          department: data.department,
          gender: data.gender,
          bio: data.bio,
          role: 'member',
          points: 0,
          join_date: new Date().toISOString().split('T')[0]
        }
      })

      if (authError) throw authError
    } catch (error: any) {
      console.error('Error completing Google signup:', error)
      throw new Error(error.message || '完成註冊失敗')
    }
  }
}
