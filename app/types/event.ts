export interface Event {
  id: string
  title: string
  description: string
  location: string
  startAt: Date
  endAt: Date
  allDay: boolean
  color: string
  createdBy: string
  attendees: number
  // Derived display fields
  date: Date        // alias of startAt for calendar grid lookup
  time: string      // 'HH:mm' formatted from startAt
  period: 'AM' | 'PM'
}

export interface CreateEventPayload {
  title: string
  description?: string
  location?: string
  start_at: string  // ISO8601
  end_at: string    // ISO8601
  all_day?: boolean
  color?: string
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
}
