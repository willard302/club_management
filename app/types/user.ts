// 對應 Supabase DB enum: public.club_role
export type Role =
  | 'admin'        // 管理員
  | 'member'        // 訪客

export const ROLE_LABEL: Record<Role, string> = {
  'admin': '管理員',
  'member': '一般會員'
}

export interface UserProfile {
  name: string
  role: Role
  joinDate: string
  totalMeditation: string
  monthlyCheckIns: string
  department: string
  points: number
  phoneNumber?: string
  avatar?: string
  dateOfBirth?: string
  gender?: string
  bio?: string
}
