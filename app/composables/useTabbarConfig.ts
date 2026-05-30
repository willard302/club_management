import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TabbarItem } from '@/types'
import { baseTabbarItems } from '@/config/tabbar'

export const useTabbarConfig = () => {
  const route = useRoute()

  const routeToIndexMap: Record<string, number> = {
    '/': 0,
    '/calendar': 1,
    '/user-center/user-info': 2
  }

  const activeIndex = computed(() => {
    return routeToIndexMap[route.path] ?? 0
  })

  const labelsMap: Record<string, string> = {
    'Home': '首頁',
    'Calendar': '行事曆',
    'User Center': '會員中心'
  }

  const tabbarItems = computed<TabbarItem[]>(() => {
    return baseTabbarItems.map((item, index) => ({
      ...item,
      label: labelsMap[item.label] || item.label,
      fill: index === activeIndex.value
    }))
  })

  return {
    tabbarItems,
    activeIndex
  }
}