/**
 * Tabbar Items
 */
export interface TabbarItem {
  label: string
  icon: string
  path: string
  fill?: boolean
}

/**
 * Common Data Types
 */
export * from './event'

export interface Activity {
  type: 'meditation' | 'event'
  date: string
  title: string
  duration: string
  icon: string
}

export * from './ledger'

/**
 * Form Data
 */
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  fullName: string
  studentId: string
  email: string
  password: string
  confirmPassword: string
}

/**
 * UI Components
 */
export interface MenuItem {
  icon: string
  label: string
}

export interface MenuSection {
  title: string
  items: MenuItem[]
}

export interface StatCard {
  icon: string
  label: string
  value: string
}

export * from './user'
