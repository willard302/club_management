import { computed } from 'vue'
import { useRoute } from 'vue-router' // Nuxt 4 環境下其實可省略，因為會自動引入
import type { TabbarItem } from '@/types'
// 現在我們只需要引入唯一真相來源：基礎設定
import { baseTabbarItems } from '@/config/tabbar'

/**
 * 根據當前路由返回對應的 tabbar 配置與狀態
 */
export const useTabbarConfig = () => {
  const route = useRoute()

  // 1. 簡化映射表：只記錄「路由」對應的「activeIndex」
  // 這樣就能輕鬆處理多個頁面共用同一個 Tab 的情況
  const routeToIndexMap: Record<string, number> = {
    '/': 0,
    '/ledger': 1,
    '/meditation': 2,
    '/calendar': 3,
    '/settings': 0,
    '/userCenter/userInfo': 0
  }

  // 2. 計算當前的 activeIndex，如果找不到匹配的路徑，預設亮起第一個 (0)
  const activeIndex = computed(() => {
    return routeToIndexMap[route.path] ?? 0
  })

  // 3. 動態計算 TabbarItems，並根據 activeIndex 決定誰的 fill 是 true
  const tabbarItems = computed<TabbarItem[]>(() => {
    return baseTabbarItems.map((item, index) => ({
      ...item,
      fill: index === activeIndex.value // 只要 index 對上了，它就是實心/啟用狀態
    }))
  })

  return {
    tabbarItems,
    activeIndex
  }
}