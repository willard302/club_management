<script setup lang="ts">
import { computed } from 'vue'
import { useTabbarConfig } from '@/composables/useTabbarConfig'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { tabbarItems, activeIndex } = useTabbarConfig()
const { toasts, removeToast } = useToast()

// 检查当前路由是否隐藏 tabbar
const hideTabbarRoutes = ['/userCenter/changePassword', '/userCenter/userInfo']
const showTabbar = computed(() => {
  const path = route.path
  // 检查完整路由路径
  if (hideTabbarRoutes.includes(path)) {
    return false
  }
  // 检查动态路由 /ledger/{id}
  if (path.startsWith('/ledger/') && path !== '/ledger') {
    return false
  }
  return true
})
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl bg-white overflow-y-auto overflow-x-hidden">
    <!-- 页面内容 -->
    <slot />

    <!-- Toast 通知 -->
    <div class="fixed top-0 right-0 z-50 p-4 space-y-2">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        @close="removeToast(toast.id)"
      />
    </div>

    <!-- Tabbar -->
    <Tabbar v-if="showTabbar" :items="tabbarItems" :active-index="activeIndex" />
  </div>
</template>

<style scoped></style>
