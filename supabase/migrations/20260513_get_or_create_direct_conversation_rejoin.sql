-- ============================================================
-- 私聊聊天室：離開後重新開啟時重用原對話
-- 建立時間：2026-05-13
-- 目的：若任一方刪除聊天室，重新點擊好友仍回到同一私聊
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
  JOIN public.conversation_members cm_other
    ON cm_other.conversation_id = c.id
   AND cm_other.user_id = other_user_id
  WHERE c.is_group = false
    AND (
      SELECT COUNT(*)
      FROM public.conversation_members cm
      WHERE cm.conversation_id = c.id
    ) <= 2
  ORDER BY c.updated_at DESC
  LIMIT 1;

  IF existing_conversation_id IS NOT NULL THEN
    INSERT INTO public.conversation_members (
      conversation_id,
      user_id
    )
    VALUES (
      existing_conversation_id,
      current_user_id
    )
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

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
