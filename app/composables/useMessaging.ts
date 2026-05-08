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

  const loadConversations = async () => {
    try {
      conversations.value = await messagingService.fetchConversations(supabase)
    } catch (err: any) {
      console.error('[useMessaging] loadConversations:', err)
    }
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
    realtimeChannel = supabase
      .channel('messaging_realtime')
      // 對話變動
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => { loadConversations() }
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
      .subscribe()
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

  onMounted(async () => {
    await loadAllData()
    subscribeRealtime()
  })

  onUnmounted(() => {
    unsubscribeRealtime()
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
    rejectInvitation
  }
}
