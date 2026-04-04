import type { Transaction, LedgerSummary } from '@/types/ledger'

// In-memory mock state to simulate a database session
let mockTransactions: Transaction[] = [
  {
    id: 1,
    icon: 'self_improvement',
    title: 'Zen Retreat Deposit',
    category: 'Workshop • 10:45 AM',
    amount: '+$450.00',
    amountValue: 450,
    status: 'success',
    time: 'Today',
    date: '2023-10-25',
    requisitioner: 'Admin',
    reviewer: 'Finance Lead',
    type: 'income'
  },
  {
    id: 2,
    icon: 'local_florist',
    title: 'Altar Flowers',
    category: 'Activity • Yesterday',
    amount: '-$120.50',
    amountValue: 120.5,
    status: 'settled',
    time: 'Yesterday',
    date: '2023-10-24',
    requisitioner: 'Jane Doe',
    reviewer: 'Finance Lead',
    type: 'expense'
  },
  {
    id: 3,
    icon: 'groups',
    title: 'Membership Dues',
    category: 'Collection • Oct 24',
    amount: '+$1,200.00',
    amountValue: 1200,
    status: 'success',
    time: 'Oct 24',
    date: '2023-10-24',
    requisitioner: 'Tom',
    reviewer: 'Finance Lead',
    type: 'income'
  },
  {
    id: 4,
    icon: 'lightbulb_outline',
    title: 'Room Electricity',
    category: 'Utilities • Oct 22',
    amount: '-$340.00',
    amountValue: 340,
    status: 'pending',
    time: 'Oct 22',
    date: '2023-10-22',
    requisitioner: 'John Smith',
    reviewer: '',
    type: 'expense'
  }
]

/**
 * Model (資料存取層): 負責功德帳目與庫存資料的操作
 */
export const ledgerService = {
  /**
   * 取得俱樂部餘額概況
   */
  async fetchSummary(): Promise<LedgerSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          clubBalance: '$12,450',
          monthIn: '+$2,400',
          monthOut: '-$850'
        })
      }, 300)
    })
  },

  /**
   * 取得交易歷史紀錄
   */
  async fetchTransactions(): Promise<Transaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockTransactions]) // return copy
      }, 300)
    })
  },

  /**
   * 取得單筆交易紀錄
   */
  async getTransactionById(id: string | number): Promise<Transaction | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = mockTransactions.find(t => String(t.id) === String(id))
        resolve(found ? { ...found } : null)
      }, 200)
    })
  },

  /**
   * 新增交易紀錄
   */
  async createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTx: Transaction = {
          ...data,
          id: Date.now().toString()
        }
        mockTransactions.unshift(newTx)
        resolve({ ...newTx })
      }, 300)
    })
  },

  /**
   * 更新交易紀錄
   */
  async updateTransaction(id: string | number, data: Partial<Transaction>): Promise<Transaction | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockTransactions.findIndex(t => String(t.id) === String(id))
        if (index > -1) {
          mockTransactions[index] = { ...mockTransactions[index], ...data } as Transaction
          resolve({ ...mockTransactions[index] })
        } else {
          resolve(null)
        }
      }, 300)
    })
  },

  /**
   * 刪除交易紀錄
   */
  async deleteTransaction(id: string | number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = mockTransactions.length
        mockTransactions = mockTransactions.filter(t => String(t.id) !== String(id))
        resolve(mockTransactions.length < initialLength)
      }, 300)
    })
  }
}
