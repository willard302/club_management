# Calendar Editor 活動編輯頁面規格

## 1. 概述

提供幹部以上角色（EDITOR_ROLES）新增社團活動的表單頁面，路由為 `/calendar/editor`。
設計風格遵循 Azure Ethereal Design System（glassmorphism + sky gradient）。

## 2. 資料結構

### 表單欄位 → Supabase `events` 表對應

| 表單欄位 | DB 欄位 | 型別 | 必填 | 說明 |
|---------|---------|------|------|------|
| 活動名稱 | `title` | `string` | ✅ | max 50 chars |
| 開始時間 | `start_at` | `timestamptz` | ✅ | ISO8601 |
| 結束時間 | `end_at` | `timestamptz` | ✅ | ISO8601 |
| 全天活動 | `all_day` | `boolean` | — | 預設 `false` |
| 重複 | `recurrence` | `event_recurrence` enum | — | 預設 `'none'` |
| 地點 | `location` | `string` | — | |
| 說明 | `description` | `string` | — | |
| 顏色 | `color` | `string` | — | 預設 `'#2b9dee'` |

自動填入（不在表單中）：
- `created_by` — 從 `supabase.auth.getUser()` 取得
- `id`, `created_at` — DB 自動產生

### TypeScript 型別

```ts
// app/types/event.ts
interface CreateEventPayload {
  title: string
  description?: string
  location?: string
  start_at: string   // ISO8601
  end_at: string     // ISO8601
  all_day?: boolean
  color?: string
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
}
```

## 3. 業務規則

- **權限**：僅 `EDITOR_ROLES`（管理員、師資、輔導員、社長、副社長、家族長）可存取此頁面
- **時間校驗**：
  - `end_at` 必須晚於 `start_at`
  - 活動跨度不得超過 7 天
- **全天活動**：toggle ON 時，`start_at` 設為當日 `00:00:00`，`end_at` 設為 `23:59:59`，隱藏時間選擇器
- **重複**：純儲存，不展開重複事件（後續擴充）
- **儲存成功**：跳轉回 `/calendar`，顯示 toast 成功訊息

## 4. UI 規格

### 4.1 頁面結構（由上至下）

1. **Header**（固定頂部）
   - 左：`arrow_back` 返回按鈕 + 「新增活動」標題（`#2b9dee`）
   - 右：「儲存」按鈕（`#2b9dee`）

2. **Hero Banner**
   - 高度 `h-32`，天空漸層背景 `linear-gradient(135deg, #87CEEB, #E0F2FE)`
   - 圓角 `rounded-2xl`，底部有 `bg-gradient-to-t` 淡出

3. **活動名稱卡片** — `glass-card rounded-2xl p-5`
   - Label: 「活動名稱」+ 紅色必填標記 `•`
   - Input: 全寬，無邊框底線樣式，placeholder「請輸入活動名稱」

4. **時間設定卡片** — `glass-card rounded-2xl p-2`
   - 全天活動 row：`schedule` icon + toggle switch
   - 開始時間 row：`calendar_today` icon + 日期顯示 + 時間顯示（`#2b9dee`）
   - 結束時間 row：`event` icon + 日期顯示 + 時間顯示
   - 重複 row：`repeat` icon + select 下拉（不重複/每天/每週/每月/每年）
   - 各 row 之間以 `h-[1px] bg-white/30 mx-3` 分隔

5. **地點 & 說明卡片** — `glass-card rounded-2xl p-2`
   - 地點：`location_on` icon + text input，placeholder「請輸入地點」
   - 說明：`notes` icon + textarea（3 rows），placeholder「新增說明」

6. **顏色選擇卡片** — `glass-card rounded-2xl p-5`
   - Label:「活動標記顏色」
   - 6 色圓形按鈕（`w-8 h-8`），選中項顯示 `ring-2 ring-offset-2` + checkmark icon
   - 色票：`#2b9dee`、`#14b8a6`、`#8b5cf6`、`#f43f5e`、`#f59e0b`、`#64748b`

7. 底部留白 `pb-24`（tabbar 空間）

### 4.2 日期/時間選擇器

使用 Vant 元件：
- `van-popup` + `van-date-picker`：選擇日期
- `van-popup` + `van-time-picker`：選擇時間
- 共 4 組 popup（startDate, startTime, endDate, endTime）

### 4.3 設計系統

- 背景：`linear-gradient(135deg, #F0F9FF, #E0F2FE)`
- Glass card：`background: rgba(255,255,255,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3)`
- 主色：`#2b9dee`（sky blue）
- 圓角最小值：`rounded-2xl`（1rem）
- 無實線邊框，以透明度層次區分區塊

## 5. 檔案結構

| 檔案 | 用途 |
|------|------|
| `app/types/event.ts` | 擴充 `CreateEventPayload` 加 `recurrence` |
| `app/composables/useCalendarEditor.ts` | 表單狀態、驗證、儲存邏輯 |
| `app/pages/calendar/editor.vue` | 編輯頁面 UI |
| `app/pages/calendar/index.vue` | 「新增活動」按鈕加導航 |
| `app/services/eventService.ts` | `createEvent()` 已支援（spread payload） |

## 6. Composable API — `useCalendarEditor()`

```ts
// 回傳值
{
  formData,                // ref: 表單狀態物件
  isSaving,                // ref<boolean>
  COLOR_OPTIONS,           // 6 色陣列
  RECURRENCE_OPTIONS,      // 5 項 {value, label}
  initForm(date?: string), // 初始化表單預設值
  validateForm(),          // 回傳 { valid: boolean, error?: string }
  saveEvent(),             // 儲存至 Supabase，成功跳轉
  formatDisplayDate(str),  // '2024年5月20日'
  formatDisplayTime(str),  // '14:00'
}
```

## 7. 導航

- 入口：`/calendar` 頁面的「新增活動」按鈕
- 導航：`router.push({ path: '/calendar/editor', query: { date: selectedDate } })`
- 返回：Header 返回箭頭 → `router.back()`
- 儲存成功：`router.push('/calendar')`
