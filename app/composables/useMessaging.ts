import { messagingService } from '@/services/messagingService'
import type { ConversationItem, Friend, FriendInvitation } from '@/types/messaging'
import type { Database } from '@/types/database.types'

/**
 * 對話列表頁邏輯層
 * 管理對話列表狀態 + 好友列表 + 好友邀請 + Realtime 訂閱
 */
export function useMessaging() {
  const supabase = useSupabaseClient<Database>()

  const conversations = ref<ConversationItem[]>([])
  const friends = ref<Friend[]>([])
  const pendingInvitations = ref<FriendInvitation[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let isRefreshingConversations = false
  let shouldRefreshConversationsAgain = false
  let conversationsReloadTimer: ReturnType<typeof setTimeout> | null = null
  let isUnmounted = false;

  const CHANNEL_NAME = 'messaging_realtime'
  const CHANNEL_TOPIC = `realtime:${CHANNEL_NAME}`

  const loadConversations = async () => {
    if (isRefreshingConversations) {
      shouldRefreshConversationsAgain = true
      return
    }

    isRefreshingConversations = true
    try {
      do {
        shouldRefreshConversationsAgain = false
        conversations.value = await messagingService.fetchConversations(supabase)
      } while (shouldRefreshConversationsAgain)
    } catch (err: any) {
      console.error('[useMessaging] loadConversations:', err)
    } finally {
      isRefreshingConversations = false
    }
  }

  const scheduleLoadConversations = () => {
    if (conversationsReloadTimer) return

    conversationsReloadTimer = setTimeout(() => {
      conversationsReloadTimer = null
      loadConversations()
    }, 180)
  }

  const loadFriends = async () => {
    try {
      friends.value = await messagingService.fetchFriends(supabase)
    } catch (err: any) {
      console.error('[useMessaging] loadFriends:', err)
    }
  }

  const loadPendingInvitations = async () => {
    try {
      pendingInvitations.value = await messagingService.fetchPendingInvitations(supabase)
    } catch (err: any) {
      console.error('[useMessaging] loadPendingInvitations:', err)
    }
  }

  const loadAllData = async () => {
    isLoading.value = true
    error.value = null
    try {
      await Promise.all([
        loadConversations(),
        loadFriends(),
        loadPendingInvitations()
      ])
    } catch (err: any) {
      error.value = err.message ?? '載入資料失敗'
    } finally {
      isLoading.value = false
    }
  }

  // Realtime 訂閱
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

  const subscribeRealtime = () => {
    if (realtimeChannel) return;

    for (const ch of supabase.getChannels()) {
      if ((ch as any).topic === CHANNEL_TOPIC) {
        supabase.removeChannel(ch)
      }
    }

    realtimeChannel = supabase
      .channel('CHANNEL_NAME')
      // 對話變動
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => { scheduleLoadConversations() }
      )
      // 好友關係變動
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friends' },
        () => { loadFriends() }
      )
      // 好友邀請變動
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friend_invitations' },
        () => { loadPendingInvitations() }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('[useMessaging] Realtime subscribe error.')
        }
      })
  }

  const unsubscribeRealtime = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  const sendInvitation = async (email: string) => {
    await messagingService.sendFriendInvitation(supabase, email)
  }

  const acceptInvitation = async (id: string) => {
    await messagingService.acceptInvitation(supabase, id)
  }

  const rejectInvitation = async (id: string) => {
    await messagingService.rejectInvitation(supabase, id)
  }

  const getOrCreateDirectConversation = async (friendUserId: string) => {
    const conversationId = await messagingService.findOrCreateDirectConversation(supabase, friendUserId)
    return conversationId
  }

  const deleteConversations = async (conversationIds: string[]) => {
    await messagingService.deleteConversationsForCurrentUser(supabase, conversationIds)
    await loadConversations()
  }

  const deleteFriends = async (friendUserIds: string[]) => {
    await messagingService.deleteFriendsByIds(supabase, friendUserIds)
    await loadFriends()
  }

  onMounted(async () => {
    isUnmounted = false
    await loadAllData()
    if (isUnmounted) return;
    subscribeRealtime()
  })

  onUnmounted(() => {
    isUnmounted = true
    unsubscribeRealtime()
    if (conversationsReloadTimer) {
      clearTimeout(conversationsReloadTimer)
      conversationsReloadTimer = null
    }
  })

  return {
    conversations,
    friends,
    pendingInvitations,
    isLoading,
    error,
    loadAllData,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    getOrCreateDirectConversation,
    deleteConversations,
    deleteFriends
  }
}
