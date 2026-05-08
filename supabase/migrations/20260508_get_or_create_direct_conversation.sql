-- ============================================================
-- 私聊聊天室：取得既有對話或自動建立
-- 建立時間：2026-05-08
-- 目的：將前端「找或建私人聊天室」邏輯收斂到後端 RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  existing_conversation_id UUID;
  new_conversation_id UUID;
  advisory_lock_key TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF other_user_id IS NULL THEN
    RAISE EXCEPTION 'other_user_id is required';
  END IF;

  IF other_user_id = current_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.friends
    WHERE user_id = current_user_id
      AND friend_id = other_user_id
  ) THEN
    RAISE EXCEPTION 'Users are not friends';
  END IF;

  advisory_lock_key :=
    LEAST(current_user_id::text, other_user_id::text)
    || ':' ||
    GREATEST(current_user_id::text, other_user_id::text);

  PERFORM pg_advisory_xact_lock(hashtext(advisory_lock_key));

  SELECT c.id
  INTO existing_conversation_id
  FROM public.conversations c
  JOIN public.conversation_members cm_self
    ON cm_self.conversation_id = c.id
   AND cm_self.user_id = current_user_id
  JOIN public.conversation_members cm_other
    ON cm_other.conversation_id = c.id
   AND cm_other.user_id = other_user_id
  WHERE c.is_group = false
    AND (
      SELECT COUNT(*)
      FROM public.conversation_members cm
      WHERE cm.conversation_id = c.id
    ) = 2
  ORDER BY c.updated_at DESC
  LIMIT 1;

  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;

  INSERT INTO public.conversations (
    name,
    is_group,
    created_by
  )
  VALUES (
    NULL,
    false,
    current_user_id
  )
  RETURNING id INTO new_conversation_id;

  INSERT INTO public.conversation_members (
    conversation_id,
    user_id
  )
  VALUES
    (new_conversation_id, current_user_id),
    (new_conversation_id, other_user_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  RETURN new_conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_direct_conversation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_direct_conversation(UUID) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_conv_members_user_conversation
  ON public.conversation_members (user_id, conversation_id);