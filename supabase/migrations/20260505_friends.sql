-- ============================================================
-- 好友功能 Migration
-- 建立時間：2026-05-05
-- 包含：friends, friend_invitations
-- ============================================================

-- ============================================================
-- 1. 建立資料表
-- ============================================================

-- 好友關係表 (雙向存儲)
CREATE TABLE public.friends (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id   UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, friend_id)
);

-- 好友邀請表
CREATE TABLE public.friend_invitations (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id   UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (sender_id, receiver_id)
);

-- ============================================================
-- 2. Helper Functions
-- ============================================================

-- 透過 Email 取得 User ID
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_addr TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = email_addr;
  RETURN target_id;
END;
$$;

-- 接受好友邀請
CREATE OR REPLACE FUNCTION public.accept_friend_invitation(invitation_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- 取得邀請資訊
  SELECT * INTO invite_record FROM public.friend_invitations 
  WHERE id = invitation_id AND receiver_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or not authorized';
  END IF;

  -- 更新邀請狀態
  UPDATE public.friend_invitations SET status = 'accepted', updated_at = NOW() WHERE id = invitation_id;

  -- 建立雙向好友關係
  INSERT INTO public.friends (user_id, friend_id)
  VALUES (invite_record.sender_id, invite_record.receiver_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.friends (user_id, friend_id)
  VALUES (invite_record.receiver_id, invite_record.sender_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- ============================================================
-- 3. RLS Policies
-- ============================================================

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_invitations ENABLE ROW LEVEL SECURITY;

-- friends: 只有自己可以查看自己的好友
CREATE POLICY "friends_select_self" ON public.friends
  FOR SELECT USING (auth.uid() = user_id);

-- friend_invitations: 傳送者或接收者可以查看
CREATE POLICY "invitations_select_related" ON public.friend_invitations
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- friend_invitations: 任何人可以建立邀請 (但 sender_id 必須是自己)
CREATE POLICY "invitations_insert_self" ON public.friend_invitations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = sender_id);

-- friend_invitations: 接收者可以更新狀態 (pending -> accepted/rejected)
CREATE POLICY "invitations_update_receiver" ON public.friend_invitations
  FOR UPDATE USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- ============================================================
-- 4. 啟用 Realtime
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
