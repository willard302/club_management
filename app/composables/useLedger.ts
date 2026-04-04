import { ref } from 'vue'
import { ledgerService } from '@/services/ledgerService'
import type { Transaction } from '@/types'

/**
 * Controller (邏輯層): 控制帳本狀態，介接 View 與 Model
 */
export function useLedger() {
  const isLedgerLoading = ref(false)
  const clubBalance = ref('$0')
  const monthIn = ref('+$0')
  const monthOut = ref('-$0')
  const transactions = ref<Transaction[]>([])

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

  // 輔助檢視用的邏輯 (UI Presentation Logic)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 text-emerald-600'
      case 'pending':
        return 'bg-amber-50 text-amber-600'
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

  return {
    isLedgerLoading,
    clubBalance,
    monthIn,
    monthOut,
    transactions,
    loadLedgerData,
    getStatusColor,
    getIconColor
  }
}
