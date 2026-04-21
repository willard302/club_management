import type { Tables, TablesInsert, TablesUpdate } from './database.types'

/**
 * 帳務狀態常數
 */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUCCESS: 'success', // 舊資料相容
  SETTLED: 'settled' // 舊資料相容
} as const

export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS]

/**
 * 交易類型常數
 */
export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense'
} as const

export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE]

/**
 * 資料庫交易記錄（直接來自 Supabase）
 * 對應 ledger table 的 Row 型別
 */
export type DatabaseTransaction = Tables<'ledger'>

/**
 * 交易記錄新增型別（直接來自 Supabase）
 */
export type TransactionInsert = TablesInsert<'ledger'>

/**
 * 交易記錄更新型別（直接來自 Supabase）
 */
export type TransactionUpdate = TablesUpdate<'ledger'>

/**
 * 前端使用的交易記錄（增強版）
 * 將資料庫欄位名轉換為駝峰式，並添加 UI 輔助欄位
 */
export interface Transaction extends Omit<DatabaseTransaction, 'finance_id' | 'requester_id'> {
  /** 顯示用的金額文字（含符號，e.g., "+$100.00" 或 "-$50.00"） */
  amountDisplay?: string
  /** 請款人ID / 負責人ID（駝峰式） */
  requesterId: string
  /** 財務長ID（駝峰式） */
  financeId: string
}

/**
 * 交易表單輸入型別（用於新建/編輯）
 */
export interface TransactionFormData {
  title: string
  date: string
  amount: number
  type: TransactionType
  category: string
  icon: string
  status: TransactionStatus | string
  requesterId: string
  financeId?: string
  isApproved?: boolean
  receiptPath?: string
}

/**
 * 帳本摘要
 */
export interface LedgerSummary {
  clubBalance: string
  monthIn: string
  monthOut: string
}

/**
 * 帳務報表資料
 */
export interface LedgerReportData {
  summary: {
    totalBalance: string
    monthlyIncome: string
    monthlyExpenses: string
    incomeGrowth: string
  }
  monthlyTrend: {
    month: string
    monthShort: string
    income: number
    expenses: number
  }[]
  expenseBreakdown: {
    category: string
    percentage: number
    amount: number
    color: string
  }[]
  topCategories: {
    category: string
    amount: number
    percentage: number
  }[]
}

/**
 * Mapper: 資料庫記錄 → 前端交易記錄
 * 轉換蛇形式欄位名為駝峰式，並計算顯示文字
 */
export function mapDatabaseTransactionToFrontend(
  dbTx: DatabaseTransaction
): Transaction {
  // 確保 amount 是數字
  const numAmount = typeof dbTx.amount === 'number' ? dbTx.amount : parseFloat(dbTx.amount as any)
  const amount = Math.abs(numAmount)
  const prefix = dbTx.type === 'income' ? '+' : '-'
  const amountDisplay = `${prefix}$${amount.toFixed(0)}`

  return {
    ...dbTx,
    requesterId: dbTx.requester_id,
    financeId: dbTx.finance_id,
    amountDisplay
  }
}

/**
 * Mapper: 前端交易記錄 → 資料庫記錄
 * 轉換駝峰式欄位名為蛇形式，準備提交到資料庫
 */
export function mapFrontendTransactionToDatabase(
  tx: Transaction
): DatabaseTransaction {
  return {
    ...tx,
    requester_id: tx.requesterId,
    finance_id: tx.financeId
  }
}

/**
 * Mapper: 表單資料 → 資料庫插入型別
 */
export function mapFormDataToInsert(
  formData: TransactionFormData
): TransactionInsert {
  // 計算實際金額（考慮正負號）
  const amount = formData.type === 'income' 
    ? Math.abs(formData.amount)
    : -Math.abs(formData.amount)

  return {
    title: formData.title,
    date: formData.date,
    amount,
    type: formData.type,
    category: formData.category,
    icon: formData.icon,
    status: formData.status,
    requester_id: formData.requesterId,
    finance_id: formData.financeId || '',
    is_approved: formData.isApproved ?? false,
    receipt_path: formData.receiptPath ?? null
  }
}
