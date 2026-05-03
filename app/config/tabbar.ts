import type { TabbarItem } from '@/types'

/**
 * 1. 基礎設定：只定義一次所有的 Tabbar 項目
 * (假設你的 TabbarItem 型別要求有 fill，我們在這邊先省略它，稍後動態補上)
 */
export const baseTabbarItems: Omit<TabbarItem, 'fill'>[] = [
  { label: 'Home', icon: 'home', path: '/' },
  { label: 'Meditation', icon: 'self_improvement', path: '/meditation' },
  { label: 'Calendar', icon: 'calendar_month', path: '/calendar' }
]

/**
 * 2. 動態生成函式：根據傳入的當前路徑，自動判斷誰該被 fill
 */
export const getTabbarItems = (currentPath: string): TabbarItem[] => {
  return baseTabbarItems.map(item => ({
    ...item,
    fill: item.path === currentPath // 只有當前路徑匹配時，fill 才是 true
  }))
}

/**
 * 3. 自動生成 Index Map：透過基礎設定自動推導，不用手動維護數字
 * 結果依然會是 { '/': 0, '/ledger': 1, ... }
 */
export const tabbarActiveIndexMap: Record<string, number> = baseTabbarItems.reduce(
  (map, item, index) => {
    map[item.path] = index
    return map
  },
  {} as Record<string, number>
)