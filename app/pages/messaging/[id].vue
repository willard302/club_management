<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const conversationId = route.params.id as string

const {
  messages,
  conversationName,
  isGroup,
  memberCount,
  isLoading,
  isSending,
  hasMore,
  sendMessage,
  deleteMessage,
  loadMore
} = useConversation(conversationId)

// 輸入框
const inputText = ref('')
const messagesEndRef = ref<HTMLElement | null>(null)
const messagesContainerRef = ref<HTMLElement | null>(null)
const isLoadingOlder = ref(false)
const isUserNearBottom = ref(true)

const getSenderDisplayName = (name?: string | null) => {
  const trimmed = name?.trim()
  return trimmed || '未知成員'
}

const isNearBottom = (el: HTMLElement, threshold = 100) => {
  const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  return distanceToBottom <= threshold
}

// 自動調整 textarea 高度
const autoResize = (e: Event) => {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

// 送出訊息
const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text || isSending.value) return
  inputText.value = ''
  await sendMessage(text)
  nextTick(() => scrollToBottom())
}

// Enter 送出（Shift+Enter 換行）
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 滾到底部
const scrollToBottom = () => {
  messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
}

// 監聽新訊息自動滾動
watch(() => messages.value.length, (newLen, oldLen) => {
  // 上滑分頁時不要強制捲到底
  if (isLoadingOlder.value) return
  if (oldLen === 0 || isUserNearBottom.value || newLen > oldLen) {
    nextTick(() => scrollToBottom())
  }
})

// 上滑載入更多
const handleScroll = async () => {
  const el = messagesContainerRef.value
  if (!el) return

  isUserNearBottom.value = isNearBottom(el)

  if (el.scrollTop < 60 && hasMore.value && !isLoading.value && !isLoadingOlder.value) {
    isLoadingOlder.value = true
    const prevHeight = el.scrollHeight
    const prevTop = el.scrollTop
    try {
      await loadMore()
      await nextTick()
      const heightDelta = el.scrollHeight - prevHeight
      el.scrollTop = prevTop + heightDelta
    } finally {
      isLoadingOlder.value = false
    }
  }
}

// 格式化訊息時間
const formatMsgTime = (isoString: string) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// 是否顯示日期分隔線
const showDateDivider = (index: number): boolean => {
  if (index === 0) return true
  const cur = messages.value[index]?.createdAt
  const prev = messages.value[index - 1]?.createdAt
  if (!cur || !prev) return false
  return new Date(cur).toDateString() !== new Date(prev).toDateString()
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  return date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })
}

// 長按選單（刪除）
const contextMenu = ref<{ visible: boolean; messageId: string; isMine: boolean }>({
  visible: false,
  messageId: '',
  isMine: false
})

const showContextMenu = (msg: { id: string; isMine: boolean }) => {
  if (!msg.isMine) return
  contextMenu.value = { visible: true, messageId: msg.id, isMine: true }
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
}

const confirmDelete = async () => {
  await deleteMessage(contextMenu.value.messageId)
  closeContextMenu()
}

onMounted(() => {
  const el = messagesContainerRef.value
  if (el) {
    isUserNearBottom.value = isNearBottom(el)
  }
  nextTick(() => scrollToBottom())
})
</script>

<template>
  <!-- Header -->
  <header class="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-sky-500/10">
    <button
      class="p-2 rounded-lg hover:bg-sky-500/10 transition-colors text-slate-700 dark:text-slate-200"
      @click="router.back()"
    >
      <span class="material-symbols-outlined">arrow_back</span>
    </button>

    <!-- 大頭貼 -->
    <div class="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center flex-shrink-0">
      <span class="material-symbols-outlined text-sky-500 text-xl">{{ isGroup ? 'groups' : 'person' }}</span>
    </div>

    <div class="flex-1 min-w-0">
      <p class="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{{ conversationName }}</p>
      <p v-if="isGroup" class="text-xs text-slate-400">{{ memberCount }} 位成員</p>
    </div>

    <button class="p-2 rounded-lg hover:bg-sky-500/10 transition-colors text-slate-400">
      <span class="material-symbols-outlined">more_vert</span>
    </button>
  </header>

  <!-- 訊息列表 -->
  <main
    ref="messagesContainerRef"
    class="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-1 bg-slate-50 dark:bg-slate-900 min-h-0"
    style="height: calc(100dvh - 56px - 64px)"
    @scroll="handleScroll"
  >
    <!-- 載入更多 -->
    <div v-if="isLoading && messages.length > 0" class="flex justify-center py-2">
      <div class="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- 載入中（初次） -->
    <div v-if="isLoading && messages.length === 0" class="flex flex-col items-center justify-center h-full py-16 text-slate-400">
      <div class="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-sm">{{ $t('loading') }}</p>
    </div>

    <template v-for="(msg, index) in messages" :key="msg.id">
      <!-- 日期分隔線 -->
      <div v-if="showDateDivider(index)" class="flex items-center gap-3 py-3">
        <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
        <span class="text-xs text-slate-400 px-2">{{ formatDate(msg.createdAt) }}</span>
        <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
      </div>

      <!-- 系統訊息 -->
      <div v-if="msg.messageType === 'system'" class="flex justify-center py-1">
        <span class="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{{ msg.content }}</span>
      </div>

      <!-- 一般訊息 -->
      <div
        v-else
        class="flex gap-2"
        :class="msg.isMine ? 'flex-row-reverse' : 'flex-row'"
        @click="showContextMenu(msg)"
      >
        <!-- 對方大頭貼 -->
        <div
          v-if="!msg.isMine"
          class="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center flex-shrink-0 self-end mb-1"
        >
          <img
            v-if="msg.senderAvatar"
            :src="msg.senderAvatar"
            :alt="getSenderDisplayName(msg.senderName)"
            class="w-full h-full rounded-full object-cover"
          />
          <span v-else class="text-xs font-bold text-sky-500">{{ getSenderDisplayName(msg.senderName).charAt(0) }}</span>
        </div>

        <div
          class="flex flex-col max-w-[70%]"
          :class="msg.isMine ? 'items-end' : 'items-start'"
        >
          <!-- 發送者名稱（群組才顯示） -->
          <span
            v-if="isGroup && !msg.isMine"
            class="text-xs text-slate-400 mb-0.5 ml-1"
          >{{ getSenderDisplayName(msg.senderName) }}</span>

          <!-- 訊息泡泡 -->
          <div
            v-if="!msg.isDeleted"
            class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
            :class="msg.isMine
              ? 'bg-sky-500 text-white rounded-br-sm'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm rounded-bl-sm'"
          >
            <!-- 圖片訊息 -->
            <img
              v-if="msg.messageType === 'image' && msg.imageUrl"
              :src="msg.imageUrl"
              class="max-w-full rounded-lg"
              alt="圖片"
            />
            <!-- 文字訊息 -->
            <span v-else class="whitespace-pre-wrap break-words">{{ msg.content }}</span>
          </div>

          <!-- 已刪除訊息 -->
          <div
            v-else
            class="px-4 py-2 rounded-2xl text-xs text-slate-400 italic border border-dashed border-slate-300 dark:border-slate-600"
          >
            此訊息已刪除
          </div>

          <!-- 時間 -->
          <span class="text-[10px] text-slate-400 mt-0.5 mx-1">{{ formatMsgTime(msg.createdAt) }}</span>
        </div>
      </div>
    </template>

    <!-- 捲動錨點 -->
    <div ref="messagesEndRef" class="h-1" />
  </main>

  <!-- 輸入列 -->
  <div class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-20">
    <div class="flex items-end gap-2">
      <textarea
        v-model="inputText"
        rows="1"
        :placeholder="$t('messaging.inputPlaceholder')"
        class="flex-1 resize-none rounded-2xl px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 border-0 focus:outline-none focus:ring-2 focus:ring-sky-400/40 max-h-32 overflow-y-auto transition"
        @keydown="handleKeydown"
        @input="autoResize"
      />
      <button
        :disabled="!inputText.trim() || isSending"
        class="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-sky-600 active:scale-95 transition-all"
        @click="handleSend"
      >
        <span v-if="isSending" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span v-else class="material-symbols-outlined text-xl">send</span>
      </button>
    </div>
  </div>

  <!-- 刪除確認選單 -->
  <Teleport to="body">
    <div
      v-if="contextMenu.visible"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      @click="closeContextMenu"
    >
      <div
        class="w-full max-w-[430px] bg-white dark:bg-slate-800 rounded-t-3xl p-4 pb-8 space-y-2"
        @click.stop
      >
        <div class="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-4"></div>
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          @click="confirmDelete"
        >
          <span class="material-symbols-outlined">delete</span>
          刪除訊息
        </button>
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          @click="closeContextMenu"
        >
          <span class="material-symbols-outlined">close</span>
          取消
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
