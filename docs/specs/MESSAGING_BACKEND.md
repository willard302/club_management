# 即時通訊後端設計文件

## 架構概覽

```
Client (Vue + Supabase SDK)
  │
  ├── REST API  ──→  PostgreSQL  (讀取歷史訊息、建立對話)
  └── Realtime  ──→  PostgreSQL LISTEN/NOTIFY  (即時推送新訊息)
```

Supabase Realtime 底層為 WebSocket，SDK 已封裝，前端不需自行管理連線。

> **注意：** `members` 表已移除。用戶名稱與大頭照統一從 `auth.users.raw_user_meta_data` 取得，
> 透過 `get_user_profiles()` RPC function 供前端批次查詢其他用戶資料。

---

## 資料表設計

### `conversations` — 對話（私訊 / 群組）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `uuid` PK | |
| `name` | `text` | 群組名稱（私訊時可為 null） |
| `is_group` | `boolean` | `false` = 私訊，`true` = 群組 |
| `avatar_url` | `text` | 群組大頭貼（可選） |
| `created_by` | `uuid` FK → `auth.users` | 建立者 |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | 最後有新訊息的時間（用於排序） |

### `conversation_members` — 對話成員

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `uuid` PK | |
| `conversation_id` | `uuid` FK → `conversations` | |
| `user_id` | `uuid` FK → `auth.users` | |
| `joined_at` | `timestamptz` | |
| `last_read_at` | `timestamptz` | 用於計算未讀數 |

### `messages` — 訊息

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `uuid` PK | |
| `conversation_id` | `uuid` FK → `conversations` | |
| `sender_id` | `uuid` FK → `auth.users` | |
| `content` | `text` | 訊息內容 |
| `message_type` | `text` | `text` / `image` / `system` |
| `image_url` | `text` | 圖片訊息用（可選） |
| `is_deleted` | `boolean` | 軟刪除 |
| `created_at` | `timestamptz` | |

---

## RLS 權限設計

| 操作 | 規則 |
|------|------|
| 讀取對話 | 只有對話成員可讀 |
| 建立對話 | 所有已登入成員可建 |
| 讀取訊息 | 只有對話成員可讀 |
| 發送訊息 | 只有對話成員可發 |
| 刪除訊息 | 只有訊息本人可軟刪除 |
| 查詢用戶資料 | 已登入成員可呼叫 `get_user_profiles()` |

---

## Supabase SQL 指令（依序執行）

以下所有指令可直接貼入 **Supabase Dashboard → SQL Editor** 執行。

### Step 1 — 建立資料表

```sql
-- 對話（私訊 or 群組）
CREATE TABLE public.conversations (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT,
  is_group    BOOLEAN     NOT NULL DEFAULT false,
  avatar_url  TEXT,
  created_by  UUID        REFERENCES auth.users(id) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 對話成員
CREATE TABLE public.conversation_members (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id   UUID        REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_read_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (conversation_id, user_id)
);

-- 訊息
CREATE TABLE public.messages (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id   UUID        REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id         UUID        REFERENCES auth.users(id) NOT NULL,
  content           TEXT        NOT NULL,
  message_type      TEXT        NOT NULL DEFAULT 'text'
                    CHECK (message_type IN ('text', 'image', 'system')),
  image_url         TEXT,
  is_deleted        BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Step 2 — Trigger：新訊息自動更新 `conversations.updated_at`

對話列表依 `updated_at` 排序，每當有新訊息插入時，此 Trigger 自動更新對應對話的時間戳，前端 Realtime 訂閱即可收到變更通知。

```sql
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_messages_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();
```

### Step 3 — Helper Function：`is_conversation_member()`

RLS Policy 中需要判斷「當前用戶是否為對話成員」，直接在 Policy 內做子查詢會讓每次操作都觸發多次查詢。改用 `SECURITY DEFINER` function 可繞過 `conversation_members` 本身的 RLS，避免遞迴問題。

```sql
CREATE OR REPLACE FUNCTION public.is_conversation_member(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = conv_id
      AND user_id = auth.uid()
  );
$$;
```

### Step 4 — 啟用 RLS

```sql
ALTER TABLE public.conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages             ENABLE ROW LEVEL SECURITY;
```

### Step 5 — RLS Policies

**conversations**

```sql
-- 讀取：只有對話成員可讀
CREATE POLICY "conversations_select_member"
  ON public.conversations FOR SELECT
  USING (public.is_conversation_member(id));

-- 建立：任何已登入成員可建立對話
CREATE POLICY "conversations_insert_authenticated"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 更新：只有建立者可修改群組名稱等資訊
CREATE POLICY "conversations_update_creator"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);
```

**conversation_members**

```sql
-- 讀取：只有對話成員可查看成員列表
CREATE POLICY "conv_members_select_member"
  ON public.conversation_members FOR SELECT
  USING (public.is_conversation_member(conversation_id));

-- 加入：任何已登入成員可加入（建立對話時一併寫入）
CREATE POLICY "conv_members_insert_authenticated"
  ON public.conversation_members FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 更新：只有自己可更新自己的 last_read_at
CREATE POLICY "conv_members_update_self"
  ON public.conversation_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 離開：只有自己可刪除自己的成員資料
CREATE POLICY "conv_members_delete_self"
  ON public.conversation_members FOR DELETE
  USING (auth.uid() = user_id);
```

**messages**

```sql
-- 讀取：只有對話成員可讀
CREATE POLICY "messages_select_member"
  ON public.messages FOR SELECT
  USING (public.is_conversation_member(conversation_id));

-- 發送：只有對話成員可發，且 sender_id 必須是自己
CREATE POLICY "messages_insert_member"
  ON public.messages FOR INSERT
  WITH CHECK (
    public.is_conversation_member(conversation_id)
    AND auth.uid() = sender_id
  );

-- 軟刪除：只有訊息本人可將 is_deleted 設為 true
CREATE POLICY "messages_update_sender"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);
```

### Step 6 — Indexes（效能最佳化）

```sql
-- 對話列表依最新訊息時間排序
CREATE INDEX idx_conversations_updated_at
  ON public.conversations (updated_at DESC);

-- 查詢某用戶的所有對話
CREATE INDEX idx_conv_members_user_id
  ON public.conversation_members (user_id);

-- 查詢某對話的所有成員
CREATE INDEX idx_conv_members_conversation_id
  ON public.conversation_members (conversation_id);

-- 查詢某對話的訊息（依時間，支援分頁 cursor）
CREATE INDEX idx_messages_conversation_created
  ON public.messages (conversation_id, created_at DESC);

-- 查詢某用戶發送的訊息
CREATE INDEX idx_messages_sender_id
  ON public.messages (sender_id);
```

### Step 7 — 啟用 Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
```

> 或至 **Supabase Dashboard → Database → Replication**，手動勾選 `messages` 和 `conversations`。

### Step 8 — `get_user_profiles()` RPC（查詢其他用戶資料）

`members` 表已移除，用戶名稱與大頭照改存於 `auth.users.raw_user_meta_data`。
由於前端無法直接查詢 `auth.users`，需透過此 `SECURITY DEFINER` function 暴露受限的公開欄位。

```sql
CREATE OR REPLACE FUNCTION public.get_user_profiles(user_ids UUID[])
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar_url TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    u.id,
    COALESCE(
      NULLIF((u.raw_user_meta_data->>'name')::text, ''),
      NULLIF((u.raw_user_meta_data->>'display_name')::text, ''),
      split_part(COALESCE(u.email, ''), '@', 1),
      '未知用戶'
    ) AS name,
    NULLIF((u.raw_user_meta_data->>'avatar_url')::text, '') AS avatar_url
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
$$;

-- 只有已登入用戶可呼叫
REVOKE ALL ON FUNCTION public.get_user_profiles(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_profiles(UUID[]) TO authenticated;
```

**前端呼叫方式：**

```ts
// 批次查詢（多位用戶）
const { data } = await supabase
  .rpc('get_user_profiles', { user_ids: ['uuid-1', 'uuid-2'] })

// 單一用戶
const { data } = await supabase
  .rpc('get_user_profiles', { user_ids: [senderId] })
const profile = data?.[0]
```

---

## Realtime 訂閱設計

### 對話列表頁（`useMessaging`）

訂閱 `conversations` 表的 UPDATE/INSERT 事件。當任何對話有新訊息（Trigger 更新 `updated_at`），重新拉取列表（含未讀數）。

```ts
supabase
  .channel('messaging_list')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' },
    () => loadConversations())
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' },
    () => loadConversations())
  .subscribe()
```

### 聊天室頁（`useConversation`）

訂閱 `messages` 表的 INSERT，filter 限定特定 `conversation_id`，避免收到不相關的訊息。

```ts
supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, async (payload) => {
    // 取得 sender 資料後推入本地列表
    const { data } = await supabase
      .rpc('get_user_profiles', { user_ids: [payload.new.sender_id] })
    // ...push to messages
  })
  .subscribe()
```

---

## 未讀數計算邏輯

```sql
-- 某對話的未讀訊息數
SELECT COUNT(*)
FROM messages m
JOIN conversation_members cm
  ON cm.conversation_id = m.conversation_id
  AND cm.user_id = auth.uid()
WHERE m.conversation_id = '<conversation_id>'
  AND m.created_at > cm.last_read_at
  AND m.sender_id != auth.uid();
```

前端讀取對話時，呼叫以下 SQL 更新 `last_read_at`：

```sql
UPDATE conversation_members
SET last_read_at = NOW()
WHERE conversation_id = '<conversation_id>'
  AND user_id = auth.uid();
```
