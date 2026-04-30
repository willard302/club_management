import { ref, computed, watch } from 'vue'
import type { Event } from '@/types'
import type { Role } from '@/types/user'
import { SENIOR_ROLES, EDITOR_ROLES } from '@/types/user'
import type { Database } from '@/types/database.types'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  add,
  sub
} from 'date-fns'
import { eventService } from '@/services/eventService'

/**
 * Controller (邏輯層): 處理行事曆邏輯、UI 互動與資料層介接
 */
export function useCalendar() {
  const isCalendarLoading = ref(false)
  const allEvents = ref<Event[]>([])

  const today = ref(new Date())
  const currentDate = ref(new Date())
  const selectedDate = ref(today.value)

  // -- 權限狀態 --

  const currentUserId = ref<string | null>(null)
  const currentRole = ref<Role | null>(null)

  const loadCurrentUserRole = async () => {
    const supabase = useSupabaseClient<Database>()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    currentUserId.value = user.id
    const metadata = user.user_metadata || {}
    if (metadata.role) currentRole.value = metadata.role as Role
  }

  const canAddEvent = computed(() =>
    currentRole.value !== null && EDITOR_ROLES.includes(currentRole.value)
  )

  const canEditEvent = (createdBy: string): boolean => {
    if (!currentRole.value) return false
    if (SENIOR_ROLES.includes(currentRole.value)) return true
    return (
      (currentRole.value === 'Role.vice_president' || currentRole.value === 'Role.team_director') &&
      createdBy === currentUserId.value
    )
  }

  const canDeleteEvent = (createdBy: string): boolean => canEditEvent(createdBy)

  // -- Action Sheet 狀態 --

  const actionSheetVisible = ref(false)

  const openActionSheet = (date: Date) => {
    selectedDate.value = date
    if (eventsForSelectedDate.value.length > 0) {
      actionSheetVisible.value = true
    }
  }

  // -- Computed Properties: 負責提供處理好的資料給 View --
  
  const monthYear = computed(() => format(currentDate.value, 'MMMM yyyy'))

  const calendarGrid = computed(() => {
    const startOfMonthDate = startOfMonth(currentDate.value)
    const endOfMonthDate = endOfMonth(currentDate.value)
    const startDate = startOfWeek(startOfMonthDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(endOfMonthDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: startDate, end: endDate })
  })

  // -- 輔助檢驗: View 畫面上用來加上 CSS 狀態 --
  
  const isToday = (date: Date) => isSameDay(date, today.value)
  const isSelected = (date: Date) => isSameDay(date, selectedDate.value)
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate.value)

  // -- 互動處理 (Actions): View 觸發的事件 --

  const selectDate = (date: Date) => {
    selectedDate.value = date
  }

  const previousMonth = () => {
    currentDate.value = sub(currentDate.value, { months: 1 })
  }

  const nextMonth = () => {
    currentDate.value = add(currentDate.value, { months: 1 })
  }

  const goToToday = () => {
    const now = new Date()
    currentDate.value = now
    selectedDate.value = now
  }

  const eventsForSelectedDate = computed(() => {
    return allEvents.value.filter(event => isSameDay(event.date, selectedDate.value))
  })

  const eventsInMonth = computed(() => {
    const eventsMap = new Map<number, boolean>()
    allEvents.value.forEach(event => {
      if (isSameMonth(event.date, currentDate.value)) {
        eventsMap.set(event.date.getDate(), true)
      }
    })
    return eventsMap
  })
  
  // -- 初始化與撈取資料 --

  const loadEvents = async () => {
    isCalendarLoading.value = true
    try {
      allEvents.value = await eventService.fetchEvents(format(currentDate.value, 'yyyy-MM'))
    } catch (error) {
      console.error('Failed to load events', error)
      allEvents.value = []
    } finally {
      isCalendarLoading.value = false
    }
  }

  // 切換月份自動重新載入資料
  watch(currentDate, () => loadEvents())

  return {
    today,
    currentDate,
    selectedDate,
    monthYear,
    calendarGrid,
    isToday,
    isSelected,
    isCurrentMonth,
    selectDate,
    previousMonth,
    nextMonth,
    goToToday,
    eventsForSelectedDate,
    eventsInMonth,
    format,
    loadEvents,
    loadCurrentUserRole,
    isCalendarLoading,
    canAddEvent,
    canEditEvent,
    canDeleteEvent,
    actionSheetVisible,
    openActionSheet,
  }
}
