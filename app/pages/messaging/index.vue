<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const router = useRouter()

const {
  conversations,
  friends,
  pendingInvitations,
  isLoading,
  sendInvitation,
  acceptInvitation,
  rejectInvitation
} = useMessaging()

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

// 過濾後的好友列表
const filteredFriends = computed(() => {
  console.log('filteredFriends')
  console.log('Filtering friends with query:', searchQuery.value, friends.value)
  if (!searchQuery.value.trim()) return friends.value
  const q = searchQuery.value.toLowerCase()
  return friends.value.filter(f => f.name.toLowerCase().includes(q))
})

const openConversation = (id: string) => {
  router.push(`/messaging/${id}`)
}

// Tabs
const activeTab = ref<'messages' | 'friends'>('messages')

// 新增好友 Modal
const showAddFriendModal = ref(false)
const friendEmail = ref('')
const isSendingInvite = ref(false)
const inviteError = ref('')
const inviteSuccess = ref(false)

const openAddFriendModal = () => {
  friendEmail.value = ''
  inviteError.value = ''
  inviteSuccess.value = false
  showAddFriendModal.value = true
}

const sendFriendInvite = async () => {
  const email = friendEmail.value.trim()
  if (!email) return
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(email)) {
    inviteError.value = t('messaging.invalidEmail')
    return
  }
  isSendingInvite.value = true
  inviteError.value = ''
  try {
    await sendInvitation(email)
    inviteSuccess.value = true
  } catch (err: any) {
    inviteError.value = err.message || t('messaging.inviteError')
  } finally {
    isSendingInvite.value = false
  }
}

const handleAcceptInvitation = async (id: string) => {
  try {
    await acceptInvitation(id)
  } catch (err: any) {
    console.error('Accept invitation failed:', err)
  }
}

const handleRejectInvitation = async (id: string) => {
  try {
    await rejectInvitation(id)
  } catch (err: any) {
    console.error('Reject invitation failed:', err)
  }
}
</script>

<template>
  <AppHeader title="即時訊息" bgClass="sky-gradient"></AppHeader>

  <!-- Tabs -->
  <div class="flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
    <button
      v-for="tab in [{ key: 'messages', label: t('messaging.tabMessages') }, { key: 'friends', label: t('messaging.tabFriends') }]"
      :key="tab.key"
      class="flex-1 py-3 text-sm font-medium transition-colors relative"
      :class="activeTab === tab.key
        ? 'text-sky-500 dark:text-sky-400'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
      @click="activeTab = tab.key as 'messages' | 'friends'"
    >
      <div class="flex items-center justify-center gap-1.5">
        {{ tab.label }}
        <!-- 紅點提醒（好友邀請） -->
        <span
          v-if="tab.key === 'friends' && pendingInvitations.length > 0"
          class="w-2 h-2 rounded-full bg-red-500"
        />
      </div>
      <span
        v-if="activeTab === tab.key"
        class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-sky-500 rounded-full"
      />
    </button>
  </div>

  <main class="flex-1 px-4 pb-28 pt-4 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- 搜尋列 -->
    <div class="relative mb-4">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
        search
      </span>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="activeTab === 'messages' ? t('messaging.searchPlaceholder') : t('messaging.searchFriendsPlaceholder')"
        class="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm shadow-sm border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition"
      />
    </div>

    <!-- 訊息 Tab -->
    <template v-if="activeTab === 'messages'">
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
    </template>

    <!-- 好友 Tab -->
    <template v-else-if="activeTab === 'friends'">
      <!-- 好友邀請區塊 -->
      <div v-if="pendingInvitations.length > 0" class="mb-6">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
          {{ t('messaging.pendingInvitations') }} ({{ pendingInvitations.length }})
        </h3>
        <div class="space-y-2">
          <div
            v-for="invite in pendingInvitations"
            :key="invite.id"
            class="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50"
          >
            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
              <img v-if="invite.senderAvatar" :src="invite.senderAvatar" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-500">
                <span class="material-symbols-outlined">person</span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{{ invite.senderName }}</p>
              <p class="text-xs text-slate-400">{{ t('messaging.wantsToBeFriend') }}</p>
            </div>
            <div class="flex gap-2">
              <button
                class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center hover:bg-slate-200"
                @click="handleRejectInvitation(invite.id)"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
              <button
                class="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600"
                @click="handleAcceptInvitation(invite.id)"
              >
                <span class="material-symbols-outlined text-xl">check</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 好友列表 -->
      <div class="space-y-0">
        <div
          v-for="friend in filteredFriends"
          :key="friend.id"
          class="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-4 cursor-pointer hover:bg-sky-50/60 dark:hover:bg-slate-700/60 transition-colors border-b border-slate-100 dark:border-slate-700/50 first:rounded-t-2xl last:rounded-b-2xl last:border-b-0"
        >
          <div class="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img
              v-if="friend.avatarUrl"
              :src="friend.avatarUrl"
              :alt="friend.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-lg font-bold text-slate-500 dark:text-slate-300">
              {{ friend.name.charAt(0) }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <span class="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{{ friend.name }}</span>
          </div>
          <button
            class="p-2 text-slate-400 hover:text-sky-500 transition-colors"
            @click.stop="() => {}"
          >
            <span class="material-symbols-outlined">chat_bubble</span>
          </button>
        </div>

        <!-- 載入中 -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-slate-400">
          <div class="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-sm">{{ t('loading') }}</p>
        </div>

        <!-- 空白狀態 -->
        <div
          v-else-if="filteredFriends.length === 0"
          class="flex flex-col items-center justify-center py-16 text-slate-400"
        >
          <span class="material-symbols-outlined text-5xl mb-3">group</span>
          <p class="text-sm">{{ t('messaging.noFriends') }}</p>
        </div>
      </div>
    </template>
  </main>

  <!-- FAB -->
  <!-- 訊息 tab：新增對話 -->
  <button
    v-if="activeTab === 'messages'"
    class="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg flex items-center justify-center hover:bg-sky-600 active:scale-95 transition-all z-30"
    @click="() => {}"
  >
    <span class="material-symbols-outlined text-2xl">edit_square</span>
  </button>
  <!-- 好友 tab：新增好友 -->
  <button
    v-else-if="activeTab === 'friends'"
    class="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg flex items-center justify-center hover:bg-sky-600 active:scale-95 transition-all z-30"
    @click="openAddFriendModal"
  >
    <span class="material-symbols-outlined text-2xl">person_add</span>
  </button>

  <!-- 新增好友 Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showAddFriendModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="showAddFriendModal = false"
      >
        <!-- 遠闇 -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showAddFriendModal = false" />

        <!-- 卡片 -->
        <div class="relative w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl px-6 pt-6 pb-10 sm:pb-6 z-10">
          <!-- 拉桟 -->
          <div class="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-5 sm:hidden" />

          <h2 class="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
            {{ t('messaging.addFriendTitle') }}
          </h2>

          <!-- 成功狀態 -->
          <div v-if="inviteSuccess" class="flex flex-col items-center py-6 gap-3">
            <span class="material-symbols-outlined text-5xl text-sky-500">check_circle</span>
            <p class="text-sm text-slate-600 dark:text-slate-300 text-center">{{ t('messaging.inviteSent') }}</p>
            <button
              class="mt-2 px-6 py-2 rounded-full bg-sky-500 text-white text-sm font-medium"
              @click="showAddFriendModal = false"
            >
              {{ t('messaging.close') }}
            </button>
          </div>

          <!-- 輸入表單 -->
          <template v-else>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ t('messaging.addFriendDesc') }}</p>

            <div class="relative mb-3">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">mail</span>
              <input
                v-model="friendEmail"
                type="email"
                inputmode="email"
                autocomplete="email"
                :placeholder="t('messaging.emailPlaceholder')"
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition"
                @keydown.enter="sendFriendInvite"
              />
            </div>

            <p v-if="inviteError" class="text-xs text-red-500 mb-3">{{ inviteError }}</p>

            <div class="flex gap-3">
              <button
                class="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                @click="showAddFriendModal = false"
              >
                {{ t('messaging.cancel') }}
              </button>
              <button
                class="flex-1 py-3 rounded-xl bg-sky-500 text-white text-sm font-medium flex items-center justify-center gap-1 hover:bg-sky-600 active:scale-95 transition disabled:opacity-50"
                :disabled="isSendingInvite || !friendEmail.trim()"
                @click="sendFriendInvite"
              >
                <div v-if="isSendingInvite" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <template v-else>{{ t('messaging.sendInvite') }}</template>
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.sky-gradient {
  background: var(--sky-gradient-dark);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
