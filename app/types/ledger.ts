export interface Transaction {
  id: number
  icon: string
  title: string
  category: string
  amount: string
  status: 'success' | 'settled' | 'pending'
  time: string
}

export interface LedgerSummary {
  clubBalance: string
  monthIn: string
  monthOut: string
}
