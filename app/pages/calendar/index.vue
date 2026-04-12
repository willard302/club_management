<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({ layout: 'default' })

const menuVisible = ref(false)

const {
  selectedDate, monthYear, calendarGrid,
  isToday, isSelected, isCurrentMonth,
  selectDate, previousMonth, nextMonth,
  eventsForSelectedDate, eventsInMonth,
  format, loadEvents, loadCurrentUserRole, isCalendarLoading,
  canAddEvent, canEditEvent, canDeleteEvent,
} = useCalendar()

onMounted(() => {
  loadEvents()
  loadCurrentUserRole()
})
</script>

<template>
  <!-- Header -->
  <div class="sky-header-gradient pb-20 relative overflow-hidden">
    <AppHeader title="社團行事曆" bg-class="bg-soft-sky">
      <template #right-actions>
        <button @click="menuVisible = true" class="flex items-center justify-center size-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
          <span class="material-symbols-outlined text-white text-3xl">menu</span>
        </button>
      </template>
    </AppHeader>

    <div class="mt-8 flex flex-col items-center justify-between relative z-10 text-white">
      <span class="text-[10px] font-bold opacity-80 uppercase tracking-widest">Club Calendar</span>
      <div class="flex gap-1.5 items-center">
        <button @click="previousMonth" class="mr-1 size-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
          <span class="material-symbols-outlined text-xl">chevron_left</span>
        </button>
        <div>
          <span class="text-2xl font-bold">{{ monthYear }}</span>
        </div>
        <button @click="nextMonth" class="ml-1 size-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
          <span class="material-symbols-outlined text-xl">chevron_right</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Calendar Card -->
  <div class="px-4 -mt-16 relative z-20">
    <div class="cloud-card rounded-3xl p-5 mb-2">
      <div class="calendar-grid text-center mb-4">
        <div class="text-[10px] font-bold text-sky-500/60 uppercase">Mon</div>
        <div class="text-[10px] font-bold text-sky-500/60 uppercase">Tue</div>
        <div class="text-[10px] font-bold text-sky-500/60 uppercase">Wed</div>
        <div class="text-[10px] font-bold text-sky-500/60 uppercase">Thu</div>
        <div class="text-[10px] font-bold text-sky-500/60 uppercase">Fri</div>
        <div class="text-[10px] font-bold text-sky-500/60 uppercase">Sat</div>
        <div class="text-[10px] font-bold text-sky-500/60 uppercase">Sun</div>
      </div>
      <div class="calendar-grid gap-y-3">
        <div 
          v-for="day in calendarGrid" 
          :key="day.toISOString()"
          class="h-10 flex items-center justify-center text-sm font-medium relative cursor-pointer"
          :class="{
            'text-slate-300': !isCurrentMonth(day),
            'text-slate-800': isCurrentMonth(day),
            'text-white font-bold': isSelected(day) && isToday(day),
            'text-slate-900': isSelected(day) && !isToday(day)
          }"
          @click="selectDate(day)"
        >
          <div 
            class="absolute inset-0 flex items-center justify-center"
            :class="{
              'bg-sky-500 shadow-lg shadow-sky-200 ring-4 ring-sky-100 rounded-2xl': isSelected(day),
              'bg-sky-200 rounded-full w-8 h-8': isToday(day) && !isSelected(day)
            }"
          >
              <span :class="{'text-white': isSelected(day) || (isToday(day) && !isSelected(day))}">
              {{ format(day, 'd') }}
            </span>
          </div>
          <div v-if="eventsInMonth.get(day.getDate()) && isCurrentMonth(day) && !isSelected(day)" class="absolute bottom-1.5 size-1 bg-sky-400 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Selected Date Events -->
  <div class="px-4 pb-24">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-bold text-slate-700">{{ format(selectedDate, 'M 月 d 日') }}</span>
      <button
        v-if="canAddEvent"
        class="flex items-center gap-1 text-xs text-sky-500 font-bold hover:text-sky-600 transition-colors"
      >
        <span class="material-symbols-outlined text-base">add</span>
        新增活動
      </button>
    </div>

    <div v-if="isCalendarLoading" class="text-center py-8 text-slate-400 text-sm">
      <span class="material-symbols-outlined text-3xl block mb-2 animate-spin opacity-40">progress_activity</span>
      載入中…
    </div>
    <div v-else-if="eventsForSelectedDate.length === 0" class="text-center py-8 text-slate-400 text-sm">
      <span class="material-symbols-outlined text-3xl block mb-2 opacity-30">event_busy</span>
      此日沒有活動
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="event in eventsForSelectedDate"
        :key="event.id"
        class="flex items-start gap-4 bg-white p-4 rounded-2xl border border-sky-100/60 shadow-sm"
      >
        <div class="min-w-[48px] text-center">
          <p class="text-sm font-bold text-slate-800">{{ event.time }}</p>
          <p class="text-[10px] text-slate-400 uppercase font-bold">{{ event.period }}</p>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-block w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: event.color || '#0EA5E9' }"></span>
            <p class="font-bold text-slate-800 text-sm truncate">{{ event.title }}</p>
          </div>
          <p class="text-xs text-slate-500 flex items-center gap-1 mb-2">
            <span class="material-symbols-outlined text-[14px]">location_on</span>
            {{ event.location || '未指定地點' }}
          </p>
          <p v-if="event.description" class="text-xs text-slate-400 mb-2 line-clamp-2">{{ event.description }}</p>
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-sky-600 font-bold bg-sky-100/50 px-2 py-1 rounded-md">
              {{ event.attendees }} 人參與
            </span>
            <div class="flex gap-2" v-if="canEditEvent(event.createdBy)">
              <button class="text-[10px] text-slate-500 flex items-center gap-0.5 hover:text-sky-500 transition-colors">
                <span class="material-symbols-outlined text-sm">edit</span>
                編輯
              </button>
              <button
                v-if="canDeleteEvent(event.createdBy)"
                class="text-[10px] text-slate-500 flex items-center gap-0.5 hover:text-red-500 transition-colors"
              >
                <span class="material-symbols-outlined text-sm">delete</span>
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Nav Menu Action Sheet -->
  <van-action-sheet v-model:show="menuVisible" title="選單" class="pb-safe">
    <div class="px-4 pb-6 space-y-2">
      <button
        v-if="canAddEvent"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 hover:bg-sky-100 transition-colors text-sky-600 font-bold text-sm"
      >
        <span class="material-symbols-outlined text-lg">add</span>
        新增活動
      </button>
    </div>
  </van-action-sheet>


</template>

<style scoped>
.sky-header-gradient {
  background: linear-gradient(180deg, #0EA5E9 0%, #38BDF8 100%);
}

.cloud-card {
  --cloud-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.1);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.cloud-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: var(--cloud-shadow);
}

.event-item {
  border-bottom: 1px solid rgba(224, 242, 254, 0.6);
}

.event-item:last-child {
  border-bottom: none;
}
</style>
