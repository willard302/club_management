import { parseISO, startOfMonth, endOfMonth, format } from 'date-fns'
import type { Event, CreateEventPayload } from '@/types'
import type { Database } from '@/types/database.types'

type EventRow = Database['public']['Tables']['events']['Row']

function mapToEvent(row: EventRow): Event {
  const startAt = parseISO(row.start_at)
  const hours = startAt.getHours()
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    startAt,
    endAt: parseISO(row.end_at),
    allDay: row.all_day,
    color: row.color,
    recurrence: row.recurrence,
    recurrenceEndAt: row.recurrence_end_at ? parseISO(row.recurrence_end_at) : undefined,
    createdBy: row.created_by,
    attendees: row.participants?.length ?? 0,
    date: startAt,
    time: format(startAt, 'HH:mm'),
    period: hours < 12 ? 'AM' : 'PM',
  }
}

function validateTimeRange(start_at: string, end_at: string) {
  const start = parseISO(start_at)
  const end = parseISO(end_at)
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (end <= start) throw new Error('結束時間必須晚於開始時間')
  if (diffDays > 7) throw new Error('活動跨度不能超過 7 天')
}

/**
 * Model (資料存取層): 負責資料獲取與持久化處理
 */
export const eventService = {
  /**
   * 取得指定月份的活動列表（含歷史重複活動）
   */
  async fetchEvents(yearMonth?: string): Promise<Event[]> {
    const supabase = useSupabaseClient<Database>()
    const base = yearMonth ?? format(new Date(), 'yyyy-MM')
    const pivot = parseISO(`${base}-01`)
    const rangeEnd = endOfMonth(pivot).toISOString()

    // 抓取所有在月底前開始的活動，以便後續在前端計算重複實例
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lte('start_at', rangeEnd)
      .order('start_at', { ascending: true })

    if (error) throw error
    return (data ?? []).map(mapToEvent)
  },

  /**
   * 新增活動（含時間校驗）
   */
  async createEvent(payload: CreateEventPayload): Promise<Event> {
    validateTimeRange(payload.start_at, payload.end_at)

    const supabase = useSupabaseClient<Database>()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登入')

    const { data, error } = await supabase
      .from('events')
      .insert({ ...payload, created_by: user.id })
      .select()
      .single()

    if (error) throw error
    return mapToEvent(data)
  },

  /**
   * 編輯活動（含時間校驗）
   */
  async updateEvent(id: string, payload: Partial<CreateEventPayload>): Promise<Event> {
    if (payload.start_at && payload.end_at) {
      validateTimeRange(payload.start_at, payload.end_at)
    }

    const supabase = useSupabaseClient<Database>()
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToEvent(data)
  },

  /**
   * 刪除活動
   */
  async deleteEvent(id: string): Promise<void> {
    const supabase = useSupabaseClient<Database>()
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
  },

  // 額外功能：根據 ID 取得單一活動詳情
  async fetchEventById(id: string): Promise<Event> {
    const supabase = useSupabaseClient<Database>()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
  
    if (error) throw error
    return mapToEvent(data)
  }
}
