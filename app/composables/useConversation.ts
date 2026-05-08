import { messagingService } from '@/services/messagingService'
import type { Message, DbMessage } from '@/types/messaging'
import type { Database } from '@/types/database.types'

/**
 * 聊天室頁邏輯層
 * 管理訊息列表狀態 + Realtime 訂閱（messages INSERT）
 */
export function useConversation(conversationId: string) {
  const supabase = useSupabaseClient<Database>()
  const messages = ref<Message[]>([])
  const conversationName = ref('')
  const isGroup = ref(false)
  const memberCount = ref(0)
  const avatarUrl = ref<string | null>(null)
  const isLoading = ref(false)
  const isSending = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)   // 是否還有更早的訊息可載入
  let currentUserId: string | null = null
  const senderProfileCache = new Map<string, { name: string; avatar: string | null }>()
  let markAsReadTimer: ReturnType<typeof setTimeout> | null = null

  const scheduleMarkAsRead = () => {
    if (markAsReadTimer) return

    markAsReadTimer = setTimeout(async () => {
      markAsReadTimer = null
      try {
        await messagingService.markAsRead(supabase, conversationId)
      } catch (err) {
        console.error('[useConversation] markAsRead:', err)
      }
    }, 300)
  }

  // ── 載入訊息 ────────────────────────────────────────────────

  const loadMessages = async () => {
    isLoading.value = true
    error.value = null
    try {
      messages.value = await messagingService.fetchMessages(supabase, conversationId)
      if (messages.value.length < 50) hasMore.value = false
    } catch (err: any) {
      error.value = err.message ?? '載入訊息失敗'
      console.error('[useConversation] loadMessages:', err)
    } finally {
      isLoading.value = false
    }
  }

  // ── 載入更早的訊息（上滑分頁）──────────────────────────────

  const loadMore = async () => {
    if (!hasMore.value || isLoading.value) return
    const oldest = messages.value[0]?.createdAt
    if (!oldest) return

    isLoading.value = true
    try {
      const older = await messagingService.fetchMessages(supabase, conversationId, oldest)
      if (older.length < 50) hasMore.value = false
      messages.value = [...older, ...messages.value]
    } catch (err: any) {
      error.value = err.message ?? '載入更多訊息失敗'
    } finally {
      isLoading.value = false
    }
  }

  // ── 載入對話資訊 ─────────────────────────────────────────────

  const loadConversationInfo = async () => {
    try {
      const info = await messagingService.fetchConversationInfo(supabase, conversationId)
      conversationName.value = info.name
      isGroup.value = info.isGroup
      memberCount.value = info.memberCount
      avatarUrl.value = info.avatarUrl
    } catch (err: any) {
      console.error('[useConversation] loadConversationInfo:', err)
    }
  }

  // ── 傳送訊息 ─────────────────────────────────────────────────

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isSending.value) return
    isSending.value = true
    try {
      await messagingService.sendMessage(supabase, {
        conversationId,
        content: trimmed
      })
    } catch (err: any) {
      error.value = err.message ?? '傳送失敗'
      console.error('[useConversation] sendMessage:', err)
    } finally {
      isSending.value = false
    }
  }

  // ── 軟刪除訊息 ───────────────────────────────────────────────

  const deleteMessage = async (messageId: string) => {
    try {
      await messagingService.deleteMessage(supabase, messageId)
      const msg = messages.value.find(m => m.id === messageId)
      if (msg) msg.isDeleted = true
    } catch (err: any) {
      error.value = err.message ?? '刪除失敗'
    }
  }

  // ── Realtime 訂閱 ─────────────────────────────────────────────

  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

  const subscribeRealtime = () => {
    realtimeChannel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          try {
            const raw = payload.new as DbMessage

            let profile = senderProfileCache.get(raw.sender_id)
            if (!profile) {
              const { data: profiles } = await supabase
                .rpc('get_user_profiles', { user_ids: [raw.sender_id] })

              const rawProfile = profiles?.[0] ?? null
              const senderName = (rawProfile?.name ?? rawProfile?.display_name ?? '').trim() || '未知成員'
              profile = {
                name: senderName,
                avatar: rawProfile?.avatar_url ?? null
              }
              senderProfileCache.set(raw.sender_id, profile)
            }

            const newMsg: Message = {
              id: raw.id,
              conversationId: raw.conversation_id,
              senderId: raw.sender_id,
              senderName: profile.name,
              senderAvatar: profile.avatar,
              content: raw.content,
              messageType: raw.message_type as 'text' | 'image' | 'system',
              imageUrl: raw.image_url,
              isDeleted: raw.is_deleted,
              isMine: raw.sender_id === currentUserId,
              createdAt: raw.created_at
            }

            // 避免重複推入（自己傳送時 service 已加入）
            if (!messages.value.some(m => m.id === newMsg.id)) {
              messages.value.push(newMsg)
            }

            // 更新已讀
            scheduleMarkAsRead()
          } catch (err) {
            console.error('[useConversation] Realtime handler:', err)
          }
        }
      )
      .subscribe()
  }

  const unsubscribeRealtime = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  onMounted(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    currentUserId = user?.id ?? null
    await Promise.all([loadConversationInfo(), loadMessages()])
    await messagingService.markAsRead(supabase, conversationId)
    subscribeRealtime()
  })

  onUnmounted(() => {
    unsubscribeRealtime()
    if (markAsReadTimer) {
      clearTimeout(markAsReadTimer)
      markAsReadTimer = null
    }
  })

  return {
    messages,
    conversationName,
    isGroup,
    memberCount,
    avatarUrl,
    isLoading,
    isSending,
    error,
    hasMore,
    sendMessage,
    deleteMessage,
    loadMore
  }
}
