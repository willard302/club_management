import type { TabbarItem } from '@/types'

/**
 * 1. 基礎設定：只定義一次所有的 Tabbar 項目
 */
export const baseTabbarItems: Omit<TabbarItem, 'fill'>[] = [
  { label: '首頁', icon: 'home', path: '/' },
  { label: '個人中心', icon: 'person', path: '/user-center' }
]

/**
 * 2. 動態生成函式：根據傳入的當前路徑，自動判斷誰該被 fill
 */
export const getTabbarItems = (currentPath: string): TabbarItem[] => {
  return baseTabbarItems.map(item => ({
    ...item,
    fill: item.path === currentPath
  }))
}

/**
 * 3. 自動生成 Index Map
 */
export const tabbarActiveIndexMap: Record<string, number> = baseTabbarItems.reduce(
  (map, item, index) => {
    map[item.path] = index
    return map
  },
  {} as Record<string, number>
)