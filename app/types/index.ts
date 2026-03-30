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
export interface Event {
  id: number
  date: Date
  time: string
  period: 'AM' | 'PM'
  title: string
  icon: string
  location:string
  attendees: number
}

export interface Activity {
  type: 'meditation' | 'event'
  date: string
  title: string
  duration: string
  icon: string
}

export interface Transaction {
  id: number
  icon: string
  title: string
  category: string
  amount: string
  status: 'success' | 'settled' | 'pending'
  time: string
}

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
