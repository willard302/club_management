<script setup lang="ts">
import { ref } from 'vue'
import type { Event } from '@/types'

definePageMeta({
  layout: 'default'
})

const currentMonth = ref('November 2023')

const eventsToday: Event[] = [
  {
    id: 1,
    time: '09:00',
    period: 'AM',
    title: 'Morning Zen Meditation',
    icon: 'self_improvement',
    location: 'Activity Center Room 302',
    attendees: 15
  },
  {
    id: 2,
    time: '12:30',
    period: 'PM',
    title: 'Mindful Lunch Meetup',
    icon: 'restaurant',
    location: 'Vegetarian Dining Hall',
    attendees: 8
  }
]
</script>

<template>
  <!-- Header -->
  <div class="sky-header-gradient pt-8 pb-20 px-6 relative overflow-hidden">
      <div class="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-[-10px] left-[-10px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

      <header class="flex items-center justify-between relative z-10">
        <div class="flex items-center gap-3">
          <button class="flex items-center justify-center size-9 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <span class="material-symbols-outlined text-white text-2xl">menu</span>
          </button>
          <div class="flex items-center gap-3">
            <ZenLogo size="sm" />
            <div class="flex flex-col">
              <h1 class="text-white font-bold text-lg leading-tight tracking-tight">淡江大學禪學社</h1>
              <p class="text-white/80 text-[10px] font-medium tracking-widest uppercase">TKU Zen Club</p>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="flex items-center justify-center size-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <span class="material-symbols-outlined text-white text-xl">search</span>
          </button>
          <button class="flex items-center justify-center size-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <span class="material-symbols-outlined text-white text-xl">notifications</span>
          </button>
        </div>
      </header>

      <div class="mt-8 flex flex-col items-center justify-between relative z-10 text-white">
        <span class="text-[10px] font-bold opacity-80 uppercase tracking-widest">Club Calendar</span>
        <div class="flex gap-1.5">
          <button class="mr-1 size-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
            <span class="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <div>
            <span class="text-2xl font-bold">{{ currentMonth }}</span>
          </div>
          <button class="ml-1 size-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
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
          <div class="h-10 flex items-center justify-center text-slate-300 text-sm">30</div>
          <div class="h-10 flex items-center justify-center text-slate-300 text-sm">31</div>
          <div v-for="i in 28" :key="`day-${i}`" class="h-10 flex items-center justify-center text-slate-800 text-sm font-medium relative">
            {{ i }}
            <div v-if="[4, 14, 17].includes(i)" class="absolute bottom-1.5 size-1 bg-sky-400 rounded-full"></div>
            <div v-if="i === 10" class="absolute inset-0 rounded-2xl bg-sky-500 shadow-lg shadow-sky-200 ring-4 ring-sky-100 flex items-center justify-center">
              <span class="text-white font-bold">{{ i }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Events -->
    <main class="flex-1 bg-white p-6 pb-24">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-800">Events Today</h3>
        <button class="flex items-center gap-1 text-sky-500 font-bold text-xs uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-full hover:bg-sky-100 transition-colors">
          <span class="material-symbols-outlined text-sm">add</span>
          Add Event
        </button>
      </div>
      <div class="space-y-5">
        <div v-for="event in eventsToday" :key="event.id" class="event-item pb-5 flex items-start gap-4">
          <div class="min-w-[50px] text-center pt-1">
            <p class="text-sm font-bold text-slate-800">{{ event.time }}</p>
            <p class="text-[10px] text-slate-400 uppercase font-bold">{{ event.period }}</p>
          </div>
          <div class="flex-1 bg-sky-50/40 p-4 rounded-2xl border border-sky-100/50">
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-sky-500 text-xl">{{ event.icon }}</span>
              <p class="font-bold text-slate-800 text-sm">{{ event.title }}</p>
            </div>
            <p class="text-xs text-slate-500 mb-4 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">location_on</span>
              {{ event.location }}
            </p>
            <div class="flex items-center justify-between">
              <div class="flex -space-x-2">
                <div v-for="i in 3" :key="i" :style="{ background: `hsl(${200 + i * 30}, 70%, 70%)` }" class="size-7 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold">
                  {{ String.fromCharCode(64 + i) }}{{ String.fromCharCode(64 + i) }}
                </div>
                <div v-if="event.attendees > 3" class="size-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                  +{{ event.attendees - 3 }}
                </div>
              </div>
              <span class="text-[10px] font-bold text-sky-600 bg-sky-100/50 px-2 py-1 rounded-md">Join Now</span>
            </div>
          </div>
        </div>
      </div>
    </main>
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
