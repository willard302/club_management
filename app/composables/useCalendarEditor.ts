import { ref, watch } from 'vue'
import { format, parseISO, addHours, set } from 'date-fns'
import type { CreateEventPayload } from '@/types'
import { eventService } from '@/services/eventService'

export const COLOR_OPTIONS = [
  '#2b9dee', '#14b8a6', '#8b5cf6', '#f43f5e', '#f59e0b', '#64748b',
] as const

export const RECURRENCE_OPTIONS = [
  { value: 'none', label: '不重複' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每週' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' },
] as const

export function useCalendarEditor() {
  const router = useRouter()
  const route = useRoute()
  const { addToast } = useToast()

  const isSaving = ref(false)

  const formData = ref({
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    color: COLOR_OPTIONS[0] as string,
    recurrence: 'none' as CreateEventPayload['recurrence'],
  })

  // 記住 allDay 切換前的時間
  let savedStartTime = '14:00'
  let savedEndTime = '15:30'

  const initForm = (dateStr?: string) => {
    const base = dateStr ? parseISO(dateStr) : new Date()
    const start = set(base, { hours: 14, minutes: 0, seconds: 0 })
    const end = addHours(start, 1.5)

    formData.value.startDate = format(start, 'yyyy-MM-dd')
    formData.value.startTime = format(start, 'HH:mm')
    formData.value.endDate = format(end, 'yyyy-MM-dd')
    formData.value.endTime = format(end, 'HH:mm')
    savedStartTime = formData.value.startTime
    savedEndTime = formData.value.endTime
  }

  // 全天活動 toggle
  watch(() => formData.value.allDay, (isAllDay) => {
    if (isAllDay) {
      savedStartTime = formData.value.startTime
      savedEndTime = formData.value.endTime
      formData.value.startTime = '00:00'
      formData.value.endTime = '23:59'
    } else {
      formData.value.startTime = savedStartTime
      formData.value.endTime = savedEndTime
    }
  })

  const validateForm = (): { valid: boolean; error?: string } => {
    if (!formData.value.title.trim()) {
      return { valid: false, error: '請輸入活動名稱' }
    }

    const start = parseISO(`${formData.value.startDate}T${formData.value.startTime}`)
    const end = parseISO(`${formData.value.endDate}T${formData.value.endTime}`)

    if (end <= start) {
      return { valid: false, error: '結束時間必須晚於開始時間' }
    }

    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays > 7) {
      return { valid: false, error: '活動跨度不能超過 7 天' }
    }

    return { valid: true }
  }

  const saveEvent = async () => {
    const { valid, error } = validateForm()
    if (!valid) {
      addToast(error!, 'error')
      return
    }

    isSaving.value = true
    try {
      const payload: CreateEventPayload = {
        title: formData.value.title.trim(),
        description: formData.value.description.trim() || undefined,
        location: formData.value.location.trim() || undefined,
        start_at: new Date(`${formData.value.startDate}T${formData.value.startTime}`).toISOString(),
        end_at: new Date(`${formData.value.endDate}T${formData.value.endTime}`).toISOString(),
        all_day: formData.value.allDay,
        color: formData.value.color,
        recurrence: formData.value.recurrence,
      }

      await eventService.createEvent(payload)
      addToast('活動已新增', 'success')
      router.push('/calendar')
    } catch (err: any) {
      addToast(err.message || '儲存失敗', 'error')
    } finally {
      isSaving.value = false
    }
  }

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return ''
    const d = parseISO(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  const formatDisplayTime = (timeStr: string): string => {
    return timeStr || ''
  }

  // 初始化：若 query 帶有 date 參數則使用
  const queryDate = route.query.date as string | undefined
  initForm(queryDate)

  return {
    formData,
    isSaving,
    COLOR_OPTIONS,
    RECURRENCE_OPTIONS,
    initForm,
    validateForm,
    saveEvent,
    formatDisplayDate,
    formatDisplayTime,
  }
}
