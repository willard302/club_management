## 1. 目標
實現社團成員查看社團行事曆，並針對特定層級開放『新增/編輯』活動的功能。

## 2. 資料結構 （Schema）
使用 TypeScript 定義：
- `id`: UUID
- `title`: string (必填, max 50 chars)
- `start_at`: ISO8601 DateTime
- `end_at`: ISO8601 DateTime
- `all_day`: boolean
- `color`: string
- `location`: string
- `description`: string
- `recurrence`: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
- `recurrence_end_at`: ISO8601 DateTime
- `created_by`: UserID (關聯至 auth.users)

**Role 型別**（定義於 `app/types/user.ts`）：
對應 Supabase `user_metadata.role` 欄位：
- `SENIOR_ROLES`：可編輯/刪除所有活動 (`Role.admin`, `Role.teacher`, `Role.counselor`, `Role.president`)
- `EDITOR_ROLES`：可新增活動 (`SENIOR_ROLES` + `Role.vice_president`, `Role.team_director`)

## 3. 業務規則 (Business Rules)
- **檢視權限**：所有社團成員皆可查看所有公開活動。
- **編輯權限**：
  - 只有角色為 `EDITOR_ROLES` 的用戶可新增活動。
  - `SENIOR_ROLES` 的用戶可以編輯所有活動。
  - `Role.vice_president`、`Role.team_director` 的用戶只能編輯自己創建的活動。
- **刪除權限**：
  - `SENIOR_ROLES` 可刪除所有活動。
  - `Role.vice_president`、`Role.team_director` 只能刪除自己建立的活動。
- **時間校驗**：
  - `end_at` 必須晚於 `start_at`。
  - 禁止建立跨度超過 7 天的單一活動。
- **狀態管理**：
  - 切換月份時，應自動觸發 API 讀取該月份起訖日內的資料。

## 4. UI 互動規範 (現有格式改用 Vant 整合)
- 使用 `van-calendar` 展示。
- 點擊有活動的日期時，下方彈出 `van-action-sheet` 顯示詳細清單。
- 點擊清單中的活動，進入詳情或編輯頁面。