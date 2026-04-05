<script setup lang="ts">
import type { StatCard, MenuItem } from '@/types'

definePageMeta({
  layout: 'default'
})

const userProfile = {
  name: '陳大文',
  roles: ['核心成員', '財務長'],
  department: '資訊工程學系',
  studentId: '410012345',
  profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPTwNfZkkvdSNnk4ggyWDVBsgX2YyHOr7gZn1yeVJhBSbDBO-_Ov-Qotvm9w1XQIxy0-ZBlAO73mbDWsnYwBHv7LiygGiTz42BeNKRymX74nsMo6w5SnEf_fNrsWfRC01U2yzyxH3YZHHB1QgwAzkBQRVmmemS9D6xIrR_xtzyELSYIkvpFLfp8wGQ-jDnbQz0QTGOYR7BVMLOlrEaagVU2j7xZVMDxHiBX7ZpnjsrR-HGtqi2gyljt5me9yiOnh6fDiVAU8Wal54'
}

const stats: StatCard[] = [
  { icon: 'avg_time', label: '總禪定時數', value: '42.5h' },
  { icon: 'calendar_month', label: '本月打卡', value: '12次' }
]

const menuItems: MenuItem[] = [
  { icon: 'person_edit', label: '編輯個人資料', path: '/userCenter/userInfo' },
  { icon: 'lock_reset', label: '修改密碼' },
  { icon: 'security', label: '隱私權設定' }
]
</script>

<template>
  <!-- Header Section -->
  <AppHeader title="個人資料" bg-class="sky-gradient" :has-padding="true">
    <template #right-actions>
      <button class="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
        <span class="material-symbols-outlined text-3xl">menu</span>
      </button>
    </template>
  </AppHeader>

    <!-- Main Content -->
    <main class="flex-1 -mt-4 px-4 pb-24 relative z-20">
      <!-- Profile Info Card -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 flex flex-col items-center text-center mb-6">
        <div class="relative -mt-20 mb-4 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg">
          <div class="w-32 h-32 rounded-full border-4 border-dashed border-primary/30 p-1 overflow-hidden">
            <div
              class="w-full h-full rounded-full bg-cover bg-center"
              :style="{ backgroundImage: `url('${userProfile.profileImage}')` }"
            ></div>
          </div>
        </div>
        <div class="mb-4">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ userProfile.name }}</h2>
          <div class="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <span
              v-for="role in userProfile.roles"
              :key="role"
              :class="[
                'text-sm font-semibold px-3 py-1 rounded-full border',
                role === '核心成員'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-amber-100 text-amber-700 border-amber-200'
              ]"
            >
              {{ role }}
            </span>
          </div>
        </div>
        <div class="w-full grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
          <div class="text-left">
            <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">學系</p>
            <p class="font-semibold text-slate-800 dark:text-slate-200">{{ userProfile.department }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">學號</p>
            <p class="font-semibold text-slate-800 dark:text-slate-200">{{ userProfile.studentId }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="glass-card rounded-2xl p-4 flex flex-col items-center text-center shadow-sm"
        >
          <span class="material-symbols-outlined text-primary mb-2">{{ stat.icon }}</span>
          <p class="text-xs text-slate-600 dark:text-slate-300">{{ stat.label }}</p>
          <p class="text-xl font-bold text-primary">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Action Items List -->
      <div class="space-y-3 mb-8">
        <h3 class="px-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">帳戶設定</h3>
        <div class="bg-white/80 dark:bg-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          <NuxtLink
            v-for="(item, index) in menuItems"
            :key="item.label"
            :to="item.path || '#'"
            class="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
            :class="{ 'border-b border-slate-50 dark:border-slate-700': index < menuItems.length - 1 }"
          >
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-slate-400">{{ item.icon }}</span>
              <span class="font-medium">{{ item.label }}</span>
            </div>
            <span class="material-symbols-outlined text-slate-300">chevron_right</span>
          </NuxtLink>
          <a
            href="/auth/login"
            class="flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div class="flex items-center gap-3 text-red-500">
              <span class="material-symbols-outlined">logout</span>
              <span class="font-bold">登出</span>
            </div>
          </a>
        </div>
      </div>
    </main>

</template>

<style scoped>
:root {
  --primary: #0ea5e9;
  --logo-red: #EF4444;
  --logo-yellow: #FBBF24;
  --logo-green: #22C55E;
}

.sky-gradient {
  background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%);
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
