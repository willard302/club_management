import { ref } from 'vue'
import { ledgerService } from '@/services/ledgerService'
import type { Transaction, TransactionFormData } from '@/types/ledger'

/**
 * Controller (邏輯層): 控制帳本狀態，介接 View 與 Model
 */
export function useLedger() {
  const isLedgerLoading = ref(false)
  const clubBalance = ref('$0')
  const monthIn = ref('+$0')
  const monthOut = ref('-$0')
  const transactions = ref<Transaction[]>([])
  const reportData = ref<import('@/types/ledger').LedgerReportData | null>(null)

  const loadLedgerData = async () => {
    isLedgerLoading.value = true
    try {
      const [summary, transData] = await Promise.all([
        ledgerService.fetchSummary(),
        ledgerService.fetchTransactions()
      ])
      clubBalance.value = summary.clubBalance
      monthIn.value = summary.monthIn
      monthOut.value = summary.monthOut
      transactions.value = transData
    } catch (error) {
      console.error('Failed to load ledger data', error)
    } finally {
      isLedgerLoading.value = false
    }
  }

  const loadReportData = async () => {
    isLedgerLoading.value = true
    try {
      reportData.value = await ledgerService.fetchReportData()
    } catch (error) {
      console.error('Failed to load report data', error)
    } finally {
      isLedgerLoading.value = false
    }
  }

  // 輔助檢視用的邏輯 (UI Presentation Logic)
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
      case 'success':
        return 'bg-emerald-50 text-emerald-600'
      case 'pending':
      case 'reviewing':
        return 'bg-amber-50 text-amber-600'
      case 'rejected':
        return 'bg-red-50 text-red-600'
      case 'settled':
        return 'bg-blue-50 text-blue-600'
      default:
        return 'bg-slate-50 text-slate-400'
    }
  }

  const getIconColor = (icon: string) => {
    if (icon === 'local_florist' || icon === 'lightbulb_outline') {
      return 'bg-slate-50 text-slate-400'
    }
    return 'bg-sky-50 text-sky-500'
  }

  const getTransaction = async (id: string) => {
    isLedgerLoading.value = true
    try {
      return await ledgerService.getTransactionById(id)
    } finally {
      isLedgerLoading.value = false
    }
  }

  const saveTransaction = async (formData: TransactionFormData, transactionId?: string) => {
    isLedgerLoading.value = true
    try {
      if (transactionId && transactionId !== 'new') {
        // 編輯現有記錄
        const updated = await ledgerService.updateTransaction(transactionId, formData)
        if (updated) {
          const index = transactions.value.findIndex(t => t.id === transactionId)
          if (index > -1) {
            transactions.value[index] = updated
          }
        }
        return updated
      } else {
        // 新增記錄
        const created = await ledgerService.createTransaction(formData)
        transactions.value.unshift(created)
        return created
      }
    } catch (error) {
      console.error('Failed to save transaction', error)
      throw error
    } finally {
      isLedgerLoading.value = false
    }
  }

  const removeTransaction = async (id: string) => {
    isLedgerLoading.value = true
    try {
      const success = await ledgerService.deleteTransaction(id)
      if (success) {
        transactions.value = transactions.value.filter(t => t.id !== id)
      }
      return success
    } finally {
      isLedgerLoading.value = false
    }
  }

  return {
    isLedgerLoading,
    clubBalance,
    monthIn,
    monthOut,
    transactions,
    reportData,
    loadLedgerData,
    loadReportData,
    getTransaction,
    saveTransaction,
    removeTransaction,
    getStatusColor,
    getIconColor
  }
}
