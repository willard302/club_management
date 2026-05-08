-- ============================================================
-- get_user_profiles 名稱回傳補強
-- 建立時間：2026-05-08
-- 目的：兼容舊資料，避免 name 為空導致前端顯示未知用戶
-- ============================================================

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

REVOKE ALL ON FUNCTION public.get_user_profiles(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_profiles(UUID[]) TO authenticated;
