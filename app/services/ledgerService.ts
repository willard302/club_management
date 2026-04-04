import type { Transaction, LedgerSummary } from '@/types/ledger'

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
        resolve([
          {
            id: 1,
            icon: 'self_improvement',
            title: 'Zen Retreat Deposit',
            category: 'Workshop • 10:45 AM',
            amount: '+$450.00',
            status: 'success',
            time: 'Today'
          },
          {
            id: 2,
            icon: 'local_florist',
            title: 'Altar Flowers',
            category: 'Activity • Yesterday',
            amount: '-$120.50',
            status: 'settled',
            time: 'Yesterday'
          },
          {
            id: 3,
            icon: 'groups',
            title: 'Membership Dues',
            category: 'Collection • Oct 24',
            amount: '+$1,200.00',
            status: 'success',
            time: 'Oct 24'
          },
          {
            id: 4,
            icon: 'lightbulb_outline',
            title: 'Room Electricity',
            category: 'Utilities • Oct 22',
            amount: '-$340.00',
            status: 'pending',
            time: 'Oct 22'
          }
        ])
      }, 300)
    })
  }
}
