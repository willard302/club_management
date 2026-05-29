import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '#imports'
import type { TabbarItem } from '@/types'
import { baseTabbarItems } from '@/config/tabbar'

export const useTabbarConfig = () => {
  const route = useRoute()

  const routeToIndexMap: Record<string, number> = {
    '/': 0,
    '/meditation': 1,
    '/calendar': 2,
    '/settings': 0,
    '/user-center/user-info': 0
  }

  const activeIndex = computed(() => {
    return routeToIndexMap[route.path] ?? 0
  })

  const tabbarItems = computed<TabbarItem[]>(() => {
    return baseTabbarItems.map((item, index) => ({
      ...item,
      label: `tabbar.${item.label.toLowerCase()}`,
      fill: index === activeIndex.value
    }))
  })

  return {
    tabbarItems,
    activeIndex
  }
}