// 對應 Supabase DB enum: public.club_role
export type Role =
  | 'Role.admin'        // 管理員
  | 'Role.teacher'      // 師資
  | 'Role.counselor'    // 輔導員
  | 'Role.president'    // 社長
  | 'Role.vice_president' // 副社長
  | 'Role.team_director'  // 家族長
  | 'Role.deputy_team_director' // 副家族長
  | 'Role.committee_member'     // 幹部
  | 'Role.member'       // 社員
  | 'Role.new_member'   // 新生
  | 'Role.guest'        // 訪客

export const ROLE_LABEL: Record<Role, string> = {
  'Role.admin': '管理員',
  'Role.teacher': '師資',
  'Role.counselor': '輔導員',
  'Role.president': '社長',
  'Role.vice_president': '副社長',
  'Role.team_director': '家族長',
  'Role.deputy_team_director': '副家族長',
  'Role.committee_member': '幹部',
  'Role.member': '社員',
  'Role.new_member': '新生',
  'Role.guest': '訪客',
}

export const SENIOR_ROLES: Role[] = [
  'Role.admin', 'Role.teacher', 'Role.counselor', 'Role.president'
]
export const EDITOR_ROLES: Role[] = [
  ...SENIOR_ROLES, 'Role.vice_president', 'Role.team_director'
]

export interface UserProfile {
  name: string
  role: Role
  joinDate: string
  totalMeditation: string
  monthlyCheckIns: string
  department: string
  points: number
  avatar?: string
  dateOfBirth?: string
  gender?: string
  bio?: string
}
