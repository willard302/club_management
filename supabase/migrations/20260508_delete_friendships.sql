-- ============================================================
-- 批次刪除好友關係（雙向）
-- 建立時間：2026-05-08
-- 目的：支援前端好友列表多選刪除
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_friendships(friend_user_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF friend_user_ids IS NULL OR array_length(friend_user_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM public.friends
  WHERE (user_id = current_user_id AND friend_id = ANY(friend_user_ids))
     OR (friend_id = current_user_id AND user_id = ANY(friend_user_ids));

  DELETE FROM public.friend_invitations
  WHERE (sender_id = current_user_id AND receiver_id = ANY(friend_user_ids))
     OR (receiver_id = current_user_id AND sender_id = ANY(friend_user_ids));
END;
$$;

REVOKE ALL ON FUNCTION public.delete_friendships(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_friendships(UUID[]) TO authenticated;