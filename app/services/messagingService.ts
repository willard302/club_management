import type { Database } from '@/types/database.types'
import type {
  ConversationItem,
  Message,
  CreateConversationParams,
  SendMessageParams,
  Friend,
  FriendInvitation
} from '@/types/messaging'

/**
 * 即時通訊資料層：負責與 Supabase 互動
 */
export const messagingService = {
  /**
   * 取得當前使用者的所有對話（含未讀數、最後一則訊息）
   */
  async fetchConversations(supabase: ReturnType<typeof useSupabaseClient<Database>>): Promise<ConversationItem[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 取得我參與的對話 id
    const { data: myMemberships, error: memberErr } = await supabase
      .from('conversation_members')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id)

    if (memberErr) throw memberErr
    if (!myMemberships?.length) return []

    const conversationIds = myMemberships.map(m => m.conversation_id)
    const lastReadMap = new Map(myMemberships.map(m => [m.conversation_id, m.last_read_at]))

    // 取得對話基本資料
    const { data: conversations, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })

    if (convErr) throw convErr
    if (!conversations?.length) return []

    // 批次取得每個對話的最後一則訊息
    const { data: lastMessages, error: msgErr } = await supabase
      .from('messages')
      .select('conversation_id, content, sender_id, created_at, is_deleted')
      .in('conversation_id', conversationIds)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (msgErr) throw msgErr

    // 每個對話只保留最新一則訊息
    const lastMsgMap = new Map<string, typeof lastMessages[0]>()
    for (const msg of (lastMessages ?? [])) {
      if (!lastMsgMap.has(msg.conversation_id)) {
        lastMsgMap.set(msg.conversation_id, msg)
      }
    }

    // 批次取得未讀數：訊息 created_at > last_read_at 且不是自己發的
    const unreadCounts = new Map<string, number>()
    for (const convId of conversationIds) {
      const lastRead = lastReadMap.get(convId) ?? new Date(0).toISOString()
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .eq('is_deleted', false)
        .neq('sender_id', user.id)
        .gt('created_at', lastRead)

      unreadCounts.set(convId, count ?? 0)
    }

    const directConversationIds = conversations
      .filter(c => !c.is_group)
      .map(c => c.id)

    const directPartnerMap = new Map<string, string>()
    if (directConversationIds.length) {
      const { data: members, error: memberListErr } = await supabase
        .from('conversation_members')
        .select('conversation_id, user_id')
        .in('conversation_id', directConversationIds)
        .neq('user_id', user.id)
      
      if (memberListErr) throw memberListErr

      for (const m of (members ?? [])) {
        if (!directPartnerMap.has(m.conversation_id)) {
          directPartnerMap.set(m.conversation_id, m.user_id)
        }
      }
    }

    // 取得群組訊息的發送者名稱（只取需要的 user_id）
    const senderIds = [...new Set(
      [...lastMsgMap.values()].map(m => m.sender_id).filter(Boolean)
    )]
    const partnerIds = [...new Set([...directPartnerMap.values()])]
    const profileIds = [...new Set([...senderIds, ...partnerIds])]

    const profileMap = new Map<string, { name: string; avatar_url: string | null }>()
    if (profileIds.length) {
      const { data: profiles } = await supabase
        .rpc('get_user_profiles', { user_ids: profileIds })

      for (const p of (profiles ?? [])) {
        profileMap.set(p.id, { 
          name: p.name ?? p.id, 
          avatar_url: p.avatar_url ?? null 
        })
      }
    }
    
    return conversations.map(conv => {
      const lastMsg = lastMsgMap.get(conv.id)
      const isGroup = conv.is_group
      const partnerId = directPartnerMap.get(conv.id)
      const partner = partnerId ? profileMap.get(partnerId) : null

      let lastMessageText = ''
      let lastMessageSender: string | null = null
      if (lastMsg) {
        lastMessageText = lastMsg.content
        if (isGroup && lastMsg.sender_id !== user.id) {
          lastMessageSender = profileMap.get(lastMsg.sender_id)?.name ?? null
        }
      }

      return {
        id: conv.id,
        name: isGroup
          ? (conv.name ?? '未命名對話')
          : (conv.name ?? partner?.name ?? '未命名對話'),
        avatarUrl: isGroup
          ? conv.avatar_url
          : (partner?.avatar_url ?? conv.avatar_url),
        avatarIcon: isGroup ? 'groups' : null,
        isGroup,
        isOnline: false,  // 後續可透過 Presence 實作
        lastMessage: lastMessageText,
        lastMessageSender,
        updatedAt: conv.updated_at,
        unreadCount: unreadCounts.get(conv.id) ?? 0
      }
    })
  },

  /**
   * 取得某對話的訊息（最多 50 則，由舊至新）
   */
  async fetchMessages(
    supabase: ReturnType<typeof useSupabaseClient<Database>>,
    conversationId: string,
    before?: string  // cursor: 早於此 created_at（用於分頁）
  ): Promise<Message[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data, error } = await query
    if (error) throw error

    const messages = (data ?? []).reverse()

    // 取得發送者資料
    const senderIds = [...new Set(messages.map(m => m.sender_id))]
    const senderMap = new Map<string, { name: string; avatar: string | null }>()
    if (senderIds.length) {
      const { data: profiles } = await supabase
        .rpc('get_user_profiles', { user_ids: senderIds })
      for (const p of (profiles ?? [])) {
        senderMap.set(p.id, { name: p.name ?? p.id, avatar: p.avatar_url ?? null })
      }
    }

    return messages.map(m => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: senderMap.get(m.sender_id)?.name ?? '未知成員',
      senderAvatar: senderMap.get(m.sender_id)?.avatar ?? null,
      content: m.content,
      messageType: m.message_type as 'text' | 'image' | 'system',
      imageUrl: m.image_url,
      isDeleted: m.is_deleted,
      isMine: m.sender_id === user.id,
      createdAt: m.created_at
    }))
  },

  /**
   * 傳送訊息
   */
  async sendMessage(
    supabase: ReturnType<typeof useSupabaseClient<Database>>,
    params: SendMessageParams
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('messages').insert({
      conversation_id: params.conversationId,
      sender_id: user.id,
      content: params.content,
      message_type: params.messageType ?? 'text',
      image_url: params.imageUrl ?? null
    })

    if (error) throw error
  },

  /**
   * 建立新對話（私訊或群組）
   */
  async createConversation(
    supabase: ReturnType<typeof useSupabaseClient<Database>>,
    params: CreateConversationParams
  ): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    const conversationId = crypto.randomUUID()
    
    // 建立對話
    const { error: convErr } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        name: params.name ?? null,
        is_group: params.isGroup ?? false,
        created_by: user.id
      })

    if (convErr) throw convErr

    // 加入所有成員（包含自己）
    const allMemberIds = [...new Set([user.id, ...params.memberIds])]
    const { error: memberErr } = await supabase
      .from('conversation_members')
      .insert(allMemberIds.map(uid => ({
        conversation_id: conversationId,
        user_id: uid
      })))

    if (memberErr) throw memberErr

    return conversationId
  },

  async findOrCreateDirectConversation(
    supabase: ReturnType<typeof useSupabaseClient<Database>>,
    friendUserId: string
    ): Promise<string> {
    const { data, error } = await supabase
    .rpc('get_or_create_direct_conversation', { other_user_id: friendUserId })
    if (error) throw error
    if (!data) throw new Error('Failed to get or create direct conversation')

    return data
  },

  /**
   * 批次從對話中移除自己（列表刪除）
   */
  async deleteConversationsForCurrentUser(
    supabase: ReturnType<typeof useSupabaseClient<Database>>,
    conversationIds: string[]
  ): Promise<void> {
    if (!conversationIds.length) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('conversation_members')
      .delete()
      .eq('user_id', user.id)
      .in('conversation_id', conversationIds)

    if (error) throw error
  },

  /**
   * 批次刪除好友（雙向）
   */
  async deleteFriendsByIds(
    supabase: ReturnType<typeof useSupabaseClient<Database>>,
    friendUserIds: string[]
  ): Promise<void> {
    if (!friendUserIds.length) return

    const { error } = await (supabase as typeof supabase & {
      rpc: (
        fn: 'delete_friendships',
        args: { friend_user_ids: string[] }
      ) => Promise<{ data: null; error: unknown }>
    }).rpc('delete_friendships', { friend_user_ids: friendUserIds })

    if (error) throw error
  },

  /**
   * 更新已讀時間（進入對話時呼叫）
   */
  async markAsRead(
    supabase: ReturnType<typeof useSupabaseClient<Database>>,
    conversationId: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('conversation_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
  },

  /**
   * 軟刪除訊息
   */
  async deleteMessage(
    supabase: ReturnType<typeof useSupabaseClient<Database>>,
    messageId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId)

    if (error) throw error
  },

  /**
   * 取得對話基本資訊（聊天室 header 用）
   */
  async fetchConversationInfo(
    supabase: ReturnType<typeof useSupabaseClient<Database>>,
    conversationId: string
  ): Promise<{ name: string; isGroup: boolean; avatarUrl: string | null; memberCount: number }> {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: conv, error } = await supabase
      .from('conversations')
      .select('name, is_group, avatar_url')
      .eq('id', conversationId)
      .single()

    if (error) throw error

    const { count } = await supabase
      .from('conversation_members')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)

    let name = conv.name ?? '未命名對話'
    let avatarUrl = conv.avatar_url

    if (!conv.is_group && user?.id) {
      const { data: members } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', user.id)
        .limit(1)

      const partnerId = members?.[0]?.user_id
      if (partnerId) {
        const { data: profiles } = await supabase
          .rpc('get_user_profiles', { user_ids: [partnerId] })

        const partner = profiles?.[0]
        name = partner?.name ?? name
        avatarUrl = partner?.avatar_url ?? avatarUrl
      }
    }

    return {
      name,
      isGroup: conv.is_group,
      avatarUrl,
      memberCount: count ?? 0
    }
  },

  /**
   * 取得好友列表
   */
  async fetchFriends(supabase: ReturnType<typeof useSupabaseClient<Database>>): Promise<Friend[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: friends, error } = await supabase
      .from('friends')
      .select('friend_id, created_at')
      .eq('user_id', user.id)

    if (error) throw error
    if (!friends?.length) return []

    const friendIds = friends.map(f => f.friend_id)
    const { data: profiles } = await supabase
      .rpc('get_user_profiles', { user_ids: friendIds })

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]))

    return friends.map(f => {
      const p = profileMap.get(f.friend_id)
      return {
        id: f.friend_id,
        userId: f.friend_id,
        name: p?.name ?? '未知用戶',
        avatarUrl: p?.avatar_url ?? null,
        createdAt: f.created_at
      }
    })
  },

  /**
   * 取得待處理的好友邀請 (我收到的)
   */
  async fetchPendingInvitations(supabase: ReturnType<typeof useSupabaseClient<Database>>): Promise<FriendInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: invites, error } = await supabase
      .from('friend_invitations')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!invites?.length) return []

    const senderIds = invites.map(i => i.sender_id)
    const { data: profiles } = await supabase
      .rpc('get_user_profiles', { user_ids: senderIds })

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]))

    return invites.map(i => {
      const p = profileMap.get(i.sender_id)
      return {
        id: i.id,
        senderId: i.sender_id,
        senderName: p?.name ?? '未知用戶',
        senderAvatar: p?.avatar_url ?? null,
        receiverId: i.receiver_id,
        status: i.status as any,
        createdAt: i.created_at
      }
    })
  },

  /**
   * 發送好友邀請 (透過 Email)
   */
  async sendFriendInvitation(supabase: ReturnType<typeof useSupabaseClient<Database>>, email: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. 透過 Email 取得對方 ID
    const { data: targetId, error: rpcError } = await supabase
      .rpc('get_user_id_by_email', { email_addr: email })

    if (rpcError) throw rpcError
    if (!targetId) throw new Error('找不到該用戶')
    if (targetId === user.id) throw new Error('不能加自己為好友')

    // 2. 檢查是否已經是好友
    const { data: existingFriend } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', user.id)
      .eq('friend_id', targetId)
      .single()

    if (existingFriend) throw new Error('對方已經是你的好友')

    // 3. 建立邀請
    const { error: inviteError } = await supabase
      .from('friend_invitations')
      .insert({
        sender_id: user.id,
        receiver_id: targetId,
        status: 'pending'
      })

    if (inviteError) {
      if (inviteError.code === '23505') throw new Error('已發送過邀請，待對方確認')
      throw inviteError
    }
  },

  /**
   * 接受好友邀請
   */
  async acceptInvitation(supabase: ReturnType<typeof useSupabaseClient<Database>>, invitationId: string): Promise<void> {
    const { error } = await supabase.rpc('accept_friend_invitation', { invitation_id: invitationId })
    if (error) throw error
  },

  /**
   * 拒絕好友邀請
   */
  async rejectInvitation(supabase: ReturnType<typeof useSupabaseClient<Database>>, invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('friend_invitations')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', invitationId)

    if (error) throw error
  }
}
