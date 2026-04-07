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

// In-memory mock state to simulate a database session
// 使用資料庫型別存儲原始資料
let mockTransactions: DatabaseTransaction[] = [
  {
    id: '1',
    icon: 'self_improvement',
    title: 'Zen Retreat Deposit',
    category: 'Workshop',
    amount: 450,
    status: 'success',
    date: '2023-10-25',
    requester_id: 'admin',
    finance_id: 'finance_lead_1',
    type: 'income',
    created_at: '2023-10-25T10:45:00Z',
    updated_at: null,
    is_approved: true,
    receipt_path: null
  },
  {
    id: '2',
    icon: 'local_florist',
    title: 'Altar Flowers',
    category: 'Activity',
    amount: -120.5,
    status: 'settled',
    date: '2023-10-24',
    requester_id: 'jane_doe',
    finance_id: 'finance_lead_1',
    type: 'expense',
    created_at: '2023-10-24T00:00:00Z',
    updated_at: null,
    is_approved: true,
    receipt_path: null
  },
  {
    id: '3',
    icon: 'groups',
    title: 'Membership Dues',
    category: 'Collection',
    amount: 1200,
    status: 'success',
    date: '2023-10-24',
    requester_id: 'tom',
    finance_id: 'finance_lead_1',
    type: 'income',
    created_at: '2023-10-24T00:00:00Z',
    updated_at: null,
    is_approved: true,
    receipt_path: null
  },
  {
    id: '4',
    icon: 'lightbulb_outline',
    title: 'Room Electricity',
    category: 'Utilities',
    amount: -340,
    status: 'pending',
    date: '2023-10-22',
    requester_id: 'john_smith',
    finance_id: '',
    type: 'expense',
    created_at: '2023-10-22T00:00:00Z',
    updated_at: null,
    is_approved: false,
    receipt_path: null
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
   * 將資料庫記錄映射到前端型別
   */
  async fetchTransactions(): Promise<Transaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 將資料庫記錄映射到前端型別
        const frontendTransactions = mockTransactions.map(mapDatabaseTransactionToFrontend)
        resolve(frontendTransactions)
      }, 300)
    })
  },

  /**
   * 取得單筆交易紀錄
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = mockTransactions.find(t => t.id === id)
        resolve(found ? mapDatabaseTransactionToFrontend(found) : null)
      }, 200)
    })
  },

  /**
   * 新增交易紀錄
   */
  async createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 將前端型別轉換回資料庫型別
        const dbTransaction: DatabaseTransaction = {
          ...mapFrontendTransactionToDatabase(data as Transaction),
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: null
        }
        mockTransactions.unshift(dbTransaction)
        resolve(mapDatabaseTransactionToFrontend(dbTransaction))
      }, 300)
    })
  },

  /**
   * 更新交易紀錄
   */
  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockTransactions.findIndex(t => t.id === id)
        if (index > -1) {
          // 將前端資料轉換為資料庫格式
          const dbData = mapFrontendTransactionToDatabase(data as Transaction)
          mockTransactions[index] = { 
            ...mockTransactions[index], 
            ...dbData,
            updated_at: new Date().toISOString()
          }
          resolve(mapDatabaseTransactionToFrontend(mockTransactions[index]))
        } else {
          resolve(null)
        }
      }, 300)
    })
  },

  /**
   * 刪除交易紀錄
   */
  async deleteTransaction(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = mockTransactions.length
        mockTransactions = mockTransactions.filter(t => t.id !== id)
        resolve(mockTransactions.length < initialLength)
      }, 300)
    })
  }
}
