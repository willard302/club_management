-- ============================================================
-- 私聊成員離開時，自動寫入系統訊息
-- 建立時間：2026-05-13
-- 目的：讓剩餘成員看到「對方已離開」
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_conversation_member_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining_member_count INTEGER;
  convo_is_group BOOLEAN;
  leaver_name TEXT;
BEGIN
  SELECT c.is_group
    INTO convo_is_group
  FROM public.conversations c
  WHERE c.id = OLD.conversation_id;

  IF convo_is_group IS NULL OR convo_is_group THEN
    RETURN OLD;
  END IF;

  SELECT COUNT(*)
    INTO remaining_member_count
  FROM public.conversation_members cm
  WHERE cm.conversation_id = OLD.conversation_id;

  IF remaining_member_count = 0 THEN
    RETURN OLD;
  END IF;

  SELECT COALESCE(
    NULLIF((u.raw_user_meta_data->>'name')::text, ''),
    NULLIF((u.raw_user_meta_data->>'display_name')::text, ''),
    split_part(COALESCE(u.email, ''), '@', 1),
    '對方'
  )
    INTO leaver_name
  FROM auth.users u
  WHERE u.id = OLD.user_id;

  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    content,
    message_type
  )
  VALUES (
    OLD.conversation_id,
    OLD.user_id,
    COALESCE(leaver_name, '對方') || ' 已離開',
    'system'
  );

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversation_member_delete_leave_message ON public.conversation_members;

CREATE TRIGGER trg_conversation_member_delete_leave_message
  AFTER DELETE ON public.conversation_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_conversation_member_delete();
