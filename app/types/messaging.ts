// ── DB Row 型別（對應 Supabase 資料表） ─────────────────────────

export type MessageType = 'text' | 'image' | 'system'

export interface DbConversation {
  id: string
  name: string | null
  is_group: boolean
  avatar_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface DbConversationMember {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  last_read_at: string
}

export interface DbMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  image_url: string | null
  is_deleted: boolean
  created_at: string
}

// ── 前端顯示用型別 ───────────────────────────────────────────────

/** 對話列表卡片 */
export interface ConversationItem {
  id: string
  name: string
  avatarUrl: string | null
  avatarIcon: string | null   // 群組時使用 material-symbol icon name
  isGroup: boolean
  isOnline: boolean
  lastMessage: string
  lastMessageSender: string | null  // 群組時顯示「發送者名稱：」
  updatedAt: string
  unreadCount: number
}

/** 聊天室訊息 */
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string | null
  content: string
  messageType: MessageType
  imageUrl: string | null
  isDeleted: boolean
  isMine: boolean
  createdAt: string
}

/** 建立對話的參數 */
export interface CreateConversationParams {
  memberIds: string[]        // 對方的 user_id（不含自己）
  name?: string              // 群組名稱（私訊可省略）
  isGroup?: boolean
}

/** 傳送訊息的參數 */
export interface SendMessageParams {
  conversationId: string
  content: string
  messageType?: MessageType
  imageUrl?: string
}

// ── 好友相關型別 ───────────────────────────────────────────────

export interface Friend {
  id: string
  userId: string
  name: string
  avatarUrl: string | null
  createdAt: string
}

export interface FriendInvitation {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string | null
  receiverId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}
