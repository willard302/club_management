# Display Name 整合指南

## 概述
使用者名稱（display_name）與 Supabase 後端的綁定已統一實現，確保分層架構清晰。

## 核心方法

### 📀 Data Layer - `userService.ts`

#### `updateUserProfile(supabase, profileData)`
**統一的 metadata 更新方法** - 推薦使用
```typescript
await userService.updateUserProfile(supabase, {
  name: '新名字',
  studentId: '學號',
  department: '系級',
  dateOfBirth: '生日',
  gender: '性別',
  bio: '簡介'
})
```

#### `updateDisplayName(supabase, displayName, additionalData)`
**便利方法** - 保留供向後兼容
```typescript
await userService.updateDisplayName(supabase, '新名字', {
  department: '資工系三年級'
})
```

#### `initializeUserMetadata(supabase, displayName, studentId)`
**初始化方法** - 在註冊後調用
```typescript
await userService.initializeUserMetadata(supabase, '全名', '學號')
```

---

### 🎯 Logic Layer - `composables`

#### `useUser` - 通用用戶操作

**推薦方法：**
```typescript
const { updateUserProfile } = useUser()

await updateUserProfile({
  name: '新名字',
  studentId: '學號'
})
```

**向後兼容方法：**
```typescript
const { updateDisplayName } = useUser()

await updateDisplayName('新名字', {
  department: '資工系三年級'
})
```

#### `useUserInfo` - 個人信息編輯

```typescript
const { updateUserInfo } = useUserInfo()

// formData.value.name, studentId, department 等已自動綁定

await updateUserInfo() // 更新並反映在 formData 中
```

---

## 使用流程

### 1️⃣ 註冊流程
```
用戶提交 fullName → signUp() → initializeUserMetadata()
    ↓
Supabase Auth metadata:
{
  name: "fullName",
  display_name: "fullName",
  student_id: "studentId",
  role: "Club Member",
  ...
}
```

### 2️⃣ 編輯個人資料
```
編輯表單 → updateUserInfo() → updateUserProfile() → Supabase
    ↓
本地狀態更新 → 重新載入 → UI 更新
```

### 3️⃣ 任意地點更新名字
```
任何元件 → useUser().updateUserProfile() → Supabase
    ↓
所有訂閱該狀態的元件自動更新
```

---

## 架構圖

```
UI Layer (Pages & Components)
        ↓
        useUser.ts / useUserInfo.ts (Logic Layer)
        ↓
        userService.ts (Data Layer)
        ↓
        Supabase Auth API
```

---

## 重要注意事項

✅ **所有 metadata 更新都通過 userService**
✅ **Composables 不直接調用 Supabase API**
✅ **updateDisplayName() 被 @deprecated，使用 updateUserProfile() 代替未來新代碼**
✅ **舊代碼繼續工作，無需立即更改**

---

## 常見場景

### 場景1：用戶更改姓名
```typescript
// 在 userCenter/userInfo.vue
const { updateUserProfile } = useUser()

await updateUserProfile({
  name: '新姓名'
})
```

### 場景2：用戶更新多個信息
```typescript
// 在任何元件
const { updateUserProfile } = useUser()

await updateUserProfile({
  name: '新姓名',
  department: '資工系四年級',
  bio: '熱愛禪定'
})
```

### 場景3：編輯個人資料頁面
```typescript
// 在 userCenter/userInfo.vue
const { updateUserInfo } = useUserInfo()

// 表單綁定已自動設置
await updateUserInfo() // 一次更新所有字段
```

---

## 文件清單

- ✅ `app/services/userService.ts` - 數據層
- ✅ `app/composables/useUser.ts` - 用戶狀態管理層
- ✅ `app/composables/useUserInfo.ts` - 用戶信息編輯層
- ✅ `app/pages/auth/register.vue` - 註冊頁面
- ✅ `app/pages/userCenter/userInfo.vue` - 個人資料編輯頁面

---

**最後更新**: 2026年4月7日
**狀態**: ✅ 已整合完成
