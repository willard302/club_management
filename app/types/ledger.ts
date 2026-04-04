export interface Transaction {
  id: string | number
  icon: string
  title: string
  category?: string
  amount: string
  amountValue: number
  status: 'success' | 'settled' | 'pending' | 'approved' | 'rejected' | 'reviewing'
  time: string
  date: string
  requisitioner?: string
  reviewer?: string
  type: 'income' | 'expense'
}

export interface LedgerSummary {
  clubBalance: string
  monthIn: string
  monthOut: string
}
