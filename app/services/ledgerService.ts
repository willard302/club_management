import type { 
  Transaction, 
  LedgerSummary, 
  DatabaseTransaction,
  TransactionInsert,
  TransactionUpdate,
  TransactionFormData
} from '@/types/ledger'
import { 
  mapDatabaseTransactionToFrontend, 
  mapFrontendTransactionToDatabase,
  mapFormDataToInsert 
} from '@/types/ledger'

/**
 * Supabase 帳務服務
 * 將資料持久化到 Supabase ledger 表
 */

export const ledgerService = {
  /**
   * 取得俱樂部餘額概況
   */
  async fetchSummary(): Promise<LedgerSummary> {
    try {
      const supabase = useSupabaseClient()
      
      // 查詢所有交易
      const { data, error } = await supabase
        .from('ledger')
        .select('*')
        .throwOnError()

      if (error) throw error

      // 計算餘額
      const transactions = data || []
      const totalBalance = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const thisMonthTxs = transactions.filter(tx => new Date(tx.date) >= monthStart)
      const monthIncome = thisMonthTxs
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0)
      const monthExpense = thisMonthTxs
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0)

      return {
        clubBalance: `$${Math.round(Math.abs(totalBalance))}`,
        monthIn: `+$${Math.round(monthIncome)}`,
        monthOut: `-$${Math.round(monthExpense)}`
      }
    } catch (error) {
      console.error('Error fetching ledger summary:', error)
      // 返回默認值
      return {
        clubBalance: '$0',
        monthIn: '+$0',
        monthOut: '-$0'
      }
    }
  },

  /**
   * 取得交易歷史紀錄
   */
  async fetchTransactions(): Promise<Transaction[]> {
    try {
      const supabase = useSupabaseClient()
      
      const { data, error } = await supabase
        .from('ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .throwOnError()

      if (error) throw error

      const transactions = data || []
      return transactions.map(mapDatabaseTransactionToFrontend)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  },

  /**
   * 取得單筆交易紀錄
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const supabase = useSupabaseClient()
      
      const { data, error } = await supabase
        .from('ledger')
        .select('*')
        .eq('id', id)
        .single()
        .throwOnError()

      if (error || !data) return null
      
      return mapDatabaseTransactionToFrontend(data)
    } catch (error) {
      console.error('Error fetching transaction:', error)
      return null
    }
  },

  /**
   * 新增交易紀錄
   */
  async createTransaction(formData: TransactionFormData): Promise<Transaction> {
    const supabase = useSupabaseClient()
    
    try {
      // 計算實際金額（考慮正負號）
      const amount = formData.type === 'income'
        ? Math.abs(formData.amount)
        : -Math.abs(formData.amount)

      // 構建插入資料
      const insertData: TransactionInsert = {
        amount,
        category: formData.category,
        date: formData.date,
        finance_id: formData.financeId || formData.requesterId, // 使用 requester_id 作為預設值
        icon: formData.icon,
        is_approved: formData.isApproved ?? false,
        receipt_path: formData.receiptPath ?? null,
        requester_id: formData.requesterId,
        status: formData.status,
        title: formData.title,
        type: formData.type
      }

      const { data, error } = await supabase
        .from('ledger')
        .insert([insertData])
        .select()
        .single()
        .throwOnError()

      if (error || !data) throw error

      return mapDatabaseTransactionToFrontend(data)
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  },

  /**
   * 更新交易紀錄
   */
  async updateTransaction(id: string, formData: TransactionFormData): Promise<Transaction | null> {
    const supabase = useSupabaseClient()
    
    try {
      // 計算實際金額（考慮正負號）
      const amount = formData.type === 'income'
        ? Math.abs(formData.amount)
        : -Math.abs(formData.amount)

      // 構建更新資料
      const updateData: TransactionUpdate = {
        amount,
        category: formData.category,
        date: formData.date,
        finance_id: formData.financeId || formData.requesterId, // 使用 requester_id 作為預設值
        icon: formData.icon,
        is_approved: formData.isApproved ?? false,
        receipt_path: formData.receiptPath ?? null,
        requester_id: formData.requesterId,
        status: formData.status,
        title: formData.title,
        type: formData.type,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('ledger')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
        .throwOnError()

      if (error || !data) throw error

      return mapDatabaseTransactionToFrontend(data)
    } catch (error) {
      console.error('Error updating transaction:', error)
      return null
    }
  },

  /**
   * 刪除交易紀錄
   */
  async deleteTransaction(id: string): Promise<boolean> {
    const supabase = useSupabaseClient()
    
    try {
      const { error } = await supabase
        .from('ledger')
        .delete()
        .eq('id', id)
        .throwOnError()

      if (error) throw error
      
      return true
    } catch (error) {
      console.error('Error deleting transaction:', error)
      return false
    }
  },

  /**
   * 取得分析報表資料
   */
  async fetchReportData(): Promise<import('@/types/ledger').LedgerReportData> {
    try {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('ledger')
        .select('*')
        .order('date', { ascending: true })
        .throwOnError()

      if (error) throw error
      const transactions = data || []
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      // 1. Summary
      const totalBalance = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
      const thisMonthTxs = transactions.filter(tx => {
        const d = new Date(tx.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      const lastMonthTxs = transactions.filter(tx => {
        const d = new Date(tx.date)
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
      })

      const monthlyIncome = thisMonthTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0)
      const monthlyExpenses = Math.abs(thisMonthTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0))
      
      const lastMonthIncome = lastMonthTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0)
      const growth = lastMonthIncome > 0 ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1) : '0.0'

      // 2. Monthly Trend (Last 6 months)
      const monthlyTrend = []
      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(currentYear, currentMonth - i, 1)
        const m = targetDate.getMonth()
        const y = targetDate.getFullYear()
        const monthShort = targetDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
        const monthFull = targetDate.toLocaleString('zh-TW', { month: 'long' })
        
        const txs = transactions.filter(tx => {
          const d = new Date(tx.date)
          return d.getMonth() === m && d.getFullYear() === y
        })
        
        monthlyTrend.push({
          month: monthFull,
          monthShort,
          income: txs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
          expenses: Math.abs(txs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0))
        })
      }

      // 3. Expense Breakdown (Current Month)
      const expenseByCategory: Record<string, number> = {}
      const currentExpenses = transactions.filter(tx => tx.type === 'expense')
      currentExpenses.forEach(tx => {
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + Math.abs(tx.amount)
      })

      const colors = ['#2b9dee', '#4CAF50', '#ffb869', '#cbd5e1', '#ba1a1a', '#87ceeb']
      const totalExp = Object.values(expenseByCategory).reduce((s, a) => s + a, 0)
      const expenseBreakdown = Object.entries(expenseByCategory)
        .map(([category, amount], i) => ({
          category,
          amount,
          percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
          color: colors[i % colors.length]
        }))
        .sort((a, b) => b.amount - a.amount)

      // 4. Top Categories
      const topCategories = expenseBreakdown.slice(0, 4).map(item => ({
        category: item.category,
        amount: item.amount,
        percentage: item.percentage
      }))

      return {
        summary: {
          totalBalance: `$${totalBalance.toLocaleString()}`,
          monthlyIncome: `$${monthlyIncome.toLocaleString()}`,
          monthlyExpenses: `$${monthlyExpenses.toLocaleString()}`,
          incomeGrowth: `${parseFloat(growth) >= 0 ? '+' : ''}${growth}%`
        },
        monthlyTrend,
        expenseBreakdown,
        topCategories
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      throw error
    }
  }
}
