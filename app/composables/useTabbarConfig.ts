import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TabbarItem } from '@/types'
import { baseTabbarItems } from '@/config/tabbar'

export const useTabbarConfig = () => {
  const route = useRoute()

  const routeToIndexMap: Record<string, number> = {
    '/': 0,
    '/meditation': 1,
    '/user-center': 2
  }

  const activeIndex = computed(() => {
    // 處理子路徑
    if (route.path.startsWith('/meditation')) return 1
    if (route.path.startsWith('/user-center')) return 2
    return 0
  })

  const tabbarItems = computed<TabbarItem[]>(() => {
    return baseTabbarItems.map((item, index) => ({
      ...item,
      fill: index === activeIndex.value
    }))
  })

  return {
    tabbarItems,
    activeIndex
  }
}