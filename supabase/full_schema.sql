-- ============================================================
-- Club Management - Full Schema Definition
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Meditation Sessions
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at       TIMESTAMPTZ  NOT NULL,
  duration_seconds INTEGER      NOT NULL,   -- Actual meditation seconds
  target_seconds   INTEGER      NOT NULL,   -- Planned meditation seconds
  completed        BOOLEAN      DEFAULT false,
  meditation_type  TEXT,
  note             TEXT,
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage own sessions"
  ON public.meditation_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_started
  ON public.meditation_sessions (user_id, started_at DESC);

-- 3. Calendar Events
CREATE TABLE IF NOT EXISTS public.events (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT         NOT NULL,
  description  TEXT         DEFAULT '',
  location     TEXT         DEFAULT '',
  start_at     TIMESTAMPTZ  NOT NULL,
  end_at       TIMESTAMPTZ  NOT NULL,
  all_day      BOOLEAN      DEFAULT false,
  color        TEXT         DEFAULT '#38bdf8', -- Default sky-400
  participants TEXT[],                          -- User IDs or names of participants
  created_by   UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "everyone can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "authenticated users can manage events"
  ON public.events FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events (start_at);

-- 4. Messaging System
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT,                                          -- Group name (null for DM)
  is_group    BOOLEAN     NOT NULL DEFAULT false,
  avatar_url  TEXT,                                          -- Group avatar
  created_by  UUID        REFERENCES auth.users(id) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL             -- Last message time
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id   UUID        REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_read_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id   UUID        REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id         UUID        REFERENCES auth.users(id) NOT NULL,
  content           TEXT        NOT NULL,
  message_type      TEXT        NOT NULL DEFAULT 'text'      -- 'text' | 'image' | 'system'
                    CHECK (message_type IN ('text', 'image', 'system')),
  image_url         TEXT,
  is_deleted        BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Messaging Helper Functions & Triggers
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

DROP TRIGGER IF EXISTS trg_messages_update_conversation ON public.messages;
CREATE TRIGGER trg_messages_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();

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

-- Messaging RLS
ALTER TABLE public.conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages             ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_member" ON public.conversations FOR SELECT USING (public.is_conversation_member(id));
CREATE POLICY "conversations_insert_authenticated" ON public.conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "conversations_update_creator" ON public.conversations FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "conv_members_select_member" ON public.conversation_members FOR SELECT USING (public.is_conversation_member(conversation_id));
CREATE POLICY "conv_members_insert_authenticated" ON public.conversation_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "conv_members_update_self" ON public.conversation_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "conv_members_delete_self" ON public.conversation_members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "messages_select_member" ON public.messages FOR SELECT USING (public.is_conversation_member(conversation_id));
CREATE POLICY "messages_insert_member" ON public.messages FOR INSERT WITH CHECK (public.is_conversation_member(conversation_id) AND auth.uid() = sender_id);
CREATE POLICY "messages_update_sender" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- 5. Friendships
CREATE TABLE IF NOT EXISTS public.friends (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id   UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS public.friend_invitations (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id   UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (sender_id, receiver_id)
);

-- Friendship Helper Functions
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

CREATE OR REPLACE FUNCTION public.accept_friend_invitation(invitation_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record FROM public.friend_invitations 
  WHERE id = invitation_id AND receiver_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or not authorized';
  END IF;

  UPDATE public.friend_invitations SET status = 'accepted', updated_at = NOW() WHERE id = invitation_id;

  INSERT INTO public.friends (user_id, friend_id)
  VALUES (invite_record.sender_id, invite_record.receiver_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.friends (user_id, friend_id)
  VALUES (invite_record.receiver_id, invite_record.sender_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Friendship RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friends_select_self" ON public.friends FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invitations_select_related" ON public.friend_invitations FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "invitations_insert_self" ON public.friend_invitations FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = sender_id);
CREATE POLICY "invitations_update_receiver" ON public.friend_invitations FOR UPDATE USING (auth.uid() = receiver_id);

-- 6. Profiles View (Helper)
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

GRANT EXECUTE ON FUNCTION public.get_user_profiles(UUID[]) TO authenticated;

-- 7. Realtime Enablement
-- Note: Ensure publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
