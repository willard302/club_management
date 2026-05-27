# Supabase 設置說明

## Events 行事曆 RLS 設置

### 角色對應表

| 前端顯示 | DB enum (`members.club_role`) |
|----------|-------------------------------|
| 管理員 | `Role.admin` |
| 師資 | `Role.teacher` |
| 輔導員 | `Role.counselor` |
| 社長 | `Role.president` |
| 副社長 | `Role.vice_president` |
| 家族長 | `Role.team_director` |
| 社員 | `Role.member` |

### 1. 建立 Helper Function（SECURITY DEFINER）

此 function 可繞過 members 表的 RLS，安全取得目前使用者的角色：

```sql
CREATE OR REPLACE FUNCTION public.get_my_club_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT club_role::text FROM public.members WHERE id = auth.uid() LIMIT 1;
$$;
```

### 2. 啟用 events 表 RLS

```sql
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
```

### 3. 建立 RLS Policies

#### SELECT：所有認證成員可讀取活動
```sql
CREATE POLICY "events_select_members" ON public.events
FOR SELECT USING (auth.role() = 'authenticated');
```

#### INSERT：幹部以上可新增活動
（管理員 / 師資 / 輔導員 / 社長 / 副社長 / 家族長）
```sql
CREATE POLICY "events_insert_editor_roles" ON public.events
FOR INSERT WITH CHECK (
  public.get_my_club_role() IN (
    'Role.admin', 'Role.teacher', 'Role.counselor',
    'Role.president', 'Role.vice_president', 'Role.team_director'
  )
);
```

#### UPDATE：高層角色可編輯所有活動
（管理員 / 師資 / 輔導員 / 社長）
```sql
CREATE POLICY "events_update_senior_roles" ON public.events
FOR UPDATE USING (
  public.get_my_club_role() IN (
    'Role.admin', 'Role.teacher', 'Role.counselor', 'Role.president'
  )
);
```

#### UPDATE：副社長 / 家族長只能編輯自己的活動
```sql
CREATE POLICY "events_update_own_by_editor" ON public.events
FOR UPDATE USING (
  created_by = auth.uid()
  AND public.get_my_club_role() IN ('Role.vice_president', 'Role.team_director')
);
```

#### DELETE：高層角色可刪除所有活動
```sql
CREATE POLICY "events_delete_senior_roles" ON public.events
FOR DELETE USING (
  public.get_my_club_role() IN (
    'Role.admin', 'Role.teacher', 'Role.counselor', 'Role.president'
  )
);
```

#### DELETE：副社長 / 家族長只能刪除自己建立的活動
```sql
CREATE POLICY "events_delete_own_by_editor" ON public.events
FOR DELETE USING (
  created_by = auth.uid()
  AND public.get_my_club_role() IN ('Role.vice_president', 'Role.team_director')
);
```

---

## 大頭照功能設置

### 1. 創建 Storage Bucket

在 Supabase 控制台中：

1. 進入 **Storage** 頁面
2. 點擊 **Create bucket**
3. Bucket 名稱：`icc_avatar`
4. 設置為 **Public bucket**（公開讀取）

### 2. 設置 Bucket 權限

在 `icc_avatar` bucket 中：

1. 進入 **Policies** 標籤
2. 創建以下政策：

#### 允許已認證用戶上傳檔案
```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'icc_avatar'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 允許公開讀取檔案
```sql
-- Allow public read access to avatar files
CREATE POLICY "Avatar files are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'icc_avatar');
```

#### 允許用戶更新自己的檔案
```sql
-- Allow users to update their own avatar files
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'icc_avatar'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 允許用戶刪除自己的檔案
```sql
-- Allow users to delete their own avatar files
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'icc_avatar'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. 用戶資料存儲說明

用戶資料（包括 `avatar_path`）存儲在 Supabase Auth 的 `user_metadata` 中：

- **name**: 用戶名稱
- **role**: 用戶角色
- **department**: 學系
- **points**: 點數
- **join_date**: 加入日期
- **total_meditation**: 總禪定時數
- **monthly_checkins**: 本月打卡次數
- **avatar_path**: 大頭照檔案路徑

### 4. 測試功能

設置完成後：

1. 確保用戶已登入
2. 進入個人資料頁面
3. 點擊大頭照區域
4. 選擇圖片檔案（小於 3MB）
5. 等待上傳完成

如果遇到權限錯誤，請檢查上述政策是否正確設置。