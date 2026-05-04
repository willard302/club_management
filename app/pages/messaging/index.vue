<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const router = useRouter()

const { conversations, isLoading } = useMessaging()

// 搜尋關鍵字
const searchQuery = ref('')

// 格式化時間顯示
const formatTime = (isoString: string): string => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `週${'日一二三四五六'[date.getDay()]}`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 過濾後的對話列表
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return conversations.value
  const q = searchQuery.value.toLowerCase()
  return conversations.value.filter(c =>
    c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
  )
})

const openConversation = (id: string) => {
  router.push(`/messaging/${id}`)
}
</script>

<template>
  <AppHeader title="即時訊息" bgClass="sky-gradient"></AppHeader>

  <main class="flex-1 px-4 pb-28 pt-4 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- 搜尋列 -->
    <div class="relative mb-4">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
        search
      </span>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('messaging.searchPlaceholder')"
        class="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm shadow-sm border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition"
      />
    </div>

    <!-- 對話列表 -->
    <div class="space-y-0">
      <div
        v-for="conv in filteredConversations"
        :key="conv.id"
        class="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-4 cursor-pointer hover:bg-sky-50/60 dark:hover:bg-slate-700/60 transition-colors border-b border-slate-100 dark:border-slate-700/50 first:rounded-t-2xl last:rounded-b-2xl last:border-b-0"
        @click="openConversation(conv.id)"
      >
        <!-- 大頭貼 -->
        <div class="relative flex-shrink-0">
          <!-- 群組 icon 大頭貼 -->
          <div
            v-if="conv.avatarIcon"
            class="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-sky-500 text-2xl">{{ conv.avatarIcon }}</span>
          </div>
          <!-- 圖片大頭貼 or 文字 fallback -->
          <div
            v-else
            class="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden flex items-center justify-center"
          >
            <img
              v-if="conv.avatarUrl"
              :src="conv.avatarUrl"
              :alt="conv.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-lg font-bold text-slate-500 dark:text-slate-300">
              {{ conv.name.charAt(0) }}
            </span>
          </div>
          <!-- 在線狀態 -->
          <span
            v-if="conv.isOnline"
            class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-slate-800 rounded-full"
          />
          <!-- 未讀角標（群組頭像右上） -->
        </div>

        <!-- 訊息內容 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-0.5">
            <span class="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{{ conv.name }}</span>
            <span class="text-xs text-slate-400 flex-shrink-0 ml-2">{{ formatTime(conv.updatedAt) }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
              <span v-if="conv.lastMessageSender" class="text-sky-500 font-medium">{{ conv.lastMessageSender }}：</span>
              {{ conv.lastMessage }}
            </p>
            <!-- 未讀角標 -->
            <span
              v-if="conv.unreadCount"
              class="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center"
            >
              {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
            </span>
          </div>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-slate-400">
        <div class="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-sm">{{ t('loading') }}</p>
      </div>

      <!-- 空白狀態 -->
      <div
        v-else-if="filteredConversations.length === 0"
        class="flex flex-col items-center justify-center py-16 text-slate-400"
      >
        <span class="material-symbols-outlined text-5xl mb-3">chat_bubble</span>
        <p class="text-sm">{{ t('messaging.noResults') }}</p>
      </div>
    </div>
  </main>

  <!-- 新增對話 FAB -->
  <button
    class="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg flex items-center justify-center hover:bg-sky-600 active:scale-95 transition-all z-30"
    @click="() => {}"
  >
    <span class="material-symbols-outlined text-2xl">edit_square</span>
  </button>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.sky-gradient {
  background: var(--sky-gradient-dark);
}
</style>
