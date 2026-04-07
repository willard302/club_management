<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLedger } from '@/composables/useLedger'
import type { Transaction, TransactionFormData } from '@/types/ledger'
import ZenLogo from '@/components/ZenLogo.vue'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const { getTransaction, saveTransaction, removeTransaction } = useLedger()

const isNew = computed(() => route.params.id === 'new')
const currentUserId = ref<string>('')

const formData = ref<Partial<TransactionFormData>>({
  date: new Date().toISOString().split('T')[0],
  title: '',
  amount: 0,
  requesterId: '', // 將在 onMounted 中設置
  type: 'expense',
  status: 'pending',
  category: '',
  icon: '',
  financeId: '' // 可選
})

onMounted(async () => {
  // 獲取當前用戶 ID
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      currentUserId.value = user.id
      formData.value.requesterId = user.id // 將當前用戶設為請款人
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
  }

  if (!isNew.value) {
    const tx = await getTransaction(route.params.id as string)
    if (tx) {
      formData.value = {
        title: tx.title,
        date: tx.date,
        amount: tx.amount,
        type: tx.type as 'income' | 'expense',
        requesterId: tx.requesterId,
        status: tx.status,
        category: tx.category,
        icon: tx.icon,
        financeId: tx.financeId,
        isApproved: tx.is_approved ?? undefined
      }
    }
  }
})

const goBack = () => {
  router.push('/ledger')
}

const handleSave = async () => {
  if (!formData.value.amount || !formData.value.title || !formData.value.date) {
    alert('請填寫必要欄位')
    return
  }

  // 驗證必要字段
  if (!formData.value.type || !formData.value.status) {
    alert('請選擇交易類型和審核狀態')
    return
  }

  // 確保 requesterId 有值（應該是當前用戶 ID）
  if (!formData.value.requesterId) {
    alert('無法獲取用戶信息，請重新載入頁面')
    return
  }

  // 建立表單資料物件
  const formDataObj: TransactionFormData = {
    title: formData.value.title!,
    date: formData.value.date!,
    amount: Math.abs(formData.value.amount), // 存儲絕對值，type 決定正負
    type: formData.value.type as 'income' | 'expense',
    category: formData.value.category || (formData.value.type === 'income' ? 'Income' : 'Expense'),
    icon: formData.value.icon || (formData.value.type === 'income' ? 'savings' : 'receipt_long'),
    status: formData.value.status as any,
    requesterId: formData.value.requesterId || '',
    financeId: formData.value.financeId || '', // 允許空值
    isApproved: formData.value.isApproved,
    receiptPath: formData.value.receiptPath
  }

  await saveTransaction(formDataObj, isNew.value ? 'new' : route.params.id as string)
  goBack()
}

const handleDelete = async () => {
  if (!isNew.value) {
    if (confirm('確定要刪除這筆紀錄嗎？')) {
      await removeTransaction(route.params.id as string)
      goBack()
    }
  }
}
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col bg-gradient-to-b from-[#e0f2fe] to-white dark:from-slate-900 dark:to-slate-900 overflow-x-hidden pb-20 font-display">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-sky-500/10">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="text-slate-900 dark:text-slate-100 flex items-center justify-center p-2 rounded-lg hover:bg-sky-500/10 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="flex flex-col">
          <h1 class="text-xs font-bold text-sky-500 tracking-wider uppercase">社團管理系統</h1>
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{{ isNew ? '新增紀錄' : '編輯紀錄' }}</h2>
        </div>
      </div>
      <ZenLogo size="sm" />
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-4 max-w-lg mx-auto w-full">
      <div class="glass-card rounded-xl p-6 shadow-xl shadow-sky-500/5 space-y-6">
        
        <!-- Type Selection -->
        <div class="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button @click="formData.type = 'expense'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-colors', formData.type === 'expense' ? 'bg-white shadow text-slate-800' : 'text-slate-500']">支出</button>
          <button @click="formData.type = 'income'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-colors', formData.type === 'income' ? 'bg-white shadow text-slate-800' : 'text-slate-500']">收入</button>
        </div>

        <!-- Date Field -->
        <div class="flex flex-col gap-2">
          <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500 text-lg">calendar_today</span>
            日期
          </label>
          <div class="relative flex items-stretch">
            <input v-model="formData.date" class="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 h-12 px-4 text-base transition-all" type="date" />
          </div>
        </div>

        <!-- Item Field -->
        <div class="flex flex-col gap-2">
          <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500 text-lg">edit_note</span>
            項目
          </label>
          <input v-model="formData.title" class="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 h-12 px-4 text-base transition-all" placeholder="例：社課點心採買" type="text" />
        </div>

        <!-- Amount Field -->
        <div class="flex flex-col gap-2">
          <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500 text-lg">payments</span>
            金額
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-4 text-slate-500 font-bold">$</span>
            <input v-model.number="formData.amount" class="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 h-12 pl-8 pr-4 text-base transition-all" type="number" />
          </div>
        </div>

        <!-- Requisitioner Field -->
        <div class="flex flex-col gap-2">
          <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500 text-lg">person</span>
            請款人 / 負責人
          </label>
          <input v-model="formData.requesterId" class="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 h-12 px-4 text-base transition-all" type="text" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500 text-lg">admin_panel_settings</span>
            財務長
          </label>
          <input v-model="formData.financeId" class="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 h-12 px-4 text-base transition-all" placeholder="請輸入財務長ID" type="text" />
        </div>

        <!-- Finance Review Field -->
        <div class="flex flex-col gap-2">
          <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500 text-lg">account_balance_wallet</span>
            財務審核
          </label>
          <select v-model="formData.status" class="form-select flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 h-12 px-4 text-base transition-all">
            <option value="pending">待處理</option>
            <option value="approved">已核銷</option>
            <option value="rejected">退回</option>
            <option value="reviewing">審核中</option>
            <option value="success">成功 (舊資料相容)</option>
            <option value="settled">已結算 (舊資料相容)</option>
          </select>
        </div>

        <!-- Save Button -->
        <div class="pt-4">
          <button @click="handleSave" class="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95">
            <span class="material-symbols-outlined">save</span>
            儲存紀錄
          </button>
          <button v-if="!isNew" @click="handleDelete" class="w-full mt-3 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-semibold py-3 rounded-xl transition-colors text-sm">
            刪除此筆紀錄
          </button>
        </div>
      </div>
    </main>

    <!-- Decorative Background Element -->
    <div class="fixed top-20 -right-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-40 -left-20 w-64 h-64 bg-sky-300/20 rounded-full blur-3xl pointer-events-none"></div>
  </div>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.dark .glass-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
