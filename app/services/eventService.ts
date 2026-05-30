import { addMonths, endOfMonth, format, parseISO, startOfMonth, subMonths } from 'date-fns'
import type { CreateEventPayload, Event } from '@/types'
import type { Database } from '@/types/database.types'

type EventRow = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']

function mapToEvent(row: EventRow): Event {
  const startAt = parseISO(row.start_at)
  const endAt = parseISO(row.end_at)
  const hours = startAt.getHours()

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    location: row.location ?? '',
    startAt,
    endAt,
    allDay: row.all_day ?? false,
    color: row.color ?? '#38bdf8',
    createdBy: row.created_by ?? '',
    attendees: row.participants?.length ?? 0,
    date: startAt,
    time: row.all_day ? '全天' : format(startAt, 'HH:mm'),
    period: hours < 12 ? 'AM' : 'PM',
  }
}

function validateTimeRange(startAtIso: string, endAtIso: string) {
  const start = parseISO(startAtIso)
  const end = parseISO(endAtIso)
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

  if (end <= start) throw new Error('結束時間必須晚於開始時間')
  if (diffDays > 7) throw new Error('活動期間不能超過 7 天')
}

function getMonthRange(yearMonth?: string) {
  const pivot = yearMonth ? parseISO(`${yearMonth}-01`) : new Date()
  const start = startOfMonth(subMonths(pivot, 1)).toISOString()
  const end = endOfMonth(addMonths(pivot, 1)).toISOString()

  return { start, end }
}

export const eventService = {
  async fetchEvents(yearMonth?: string): Promise<Event[]> {
    const supabase = useSupabaseClient<Database>()
    const { start, end } = getMonthRange(yearMonth)

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lte('start_at', end)
      .gte('end_at', start)
      .order('start_at', { ascending: true })

    if (error) throw error
    return (data ?? []).map(mapToEvent)
  },

  async fetchUpcomingEvents(limit = 5): Promise<Event[]> {
    const supabase = useSupabaseClient<Database>()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('end_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return (data ?? []).map(mapToEvent)
  },

  async fetchEventById(id: string): Promise<Event> {
    const supabase = useSupabaseClient<Database>()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToEvent(data)
  },

  async createEvent(payload: CreateEventPayload): Promise<Event> {
    validateTimeRange(payload.start_at, payload.end_at)

    const supabase = useSupabaseClient<Database>()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!authData.user) throw new Error('請先登入後再新增活動')

    const insertPayload: EventInsert = {
      ...payload,
      created_by: authData.user.id,
    }

    const { data, error } = await supabase
      .from('events')
      .insert(insertPayload)
      .select()
      .single()

    if (error) throw error
    return mapToEvent(data)
  },

  async updateEvent(id: string, payload: Partial<CreateEventPayload>): Promise<Event> {
    if (payload.start_at && payload.end_at) {
      validateTimeRange(payload.start_at, payload.end_at)
    }

    const supabase = useSupabaseClient<Database>()
    const { data, error } = await supabase
      .from('events')
      .update(payload as EventUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToEvent(data)
  },

  async deleteEvent(id: string): Promise<void> {
    const supabase = useSupabaseClient<Database>()
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
