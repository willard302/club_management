<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'default'
})

const router = useRouter()

const { selectedPeriod, stats, recentSessions, isLoading, loadStats } = useMeditationStats()

onMounted(loadStats)

// 柱狀圖高度（百分比），最高的 bar = 100%
const chartDataWithHeight = computed(() => {
  const data = stats.value?.chartData ?? []
  const maxValue = Math.max(...data.map(d => d.value), 1)
  return data.map(item => ({
    ...item,
    height: Math.round((item.value / maxValue) * 100)
  }))
})

// 格式化總時間：< 60 分鐘顯示 "Xm"，否則顯示 "X.Xh"
const formattedTotalTime = computed(() => {
  const m = stats.value?.totalMinutes ?? 0
  if (m < 60) return { value: String(m), unit: 'm' }
  return { value: (m / 60).toFixed(1), unit: 'h' }
})

// 格式化 session 起始時間
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

// 格式化持續時間（秒 → "Xm" 或 "Xh Ym"）
const formatDuration = (seconds: number) => {
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

const goBack = () => router.back()
</script>

<template>
  <div class="relative flex h-full min-h-screen w-full flex-col sky-gradient overflow-x-hidden pb-24">
    <!-- Header -->
    <AppPageHeader title="冥想統計" @back="goBack" />

    <!-- Main Content -->
    <main class="flex flex-col gap-6 p-4">
      <!-- Period Selector -->
      <div class="flex h-12 items-center justify-center rounded-xl glass-effect p-1">
        <label
          v-for="period in (['Day', 'Week', 'Month', 'Year'] as const)"
          :key="period"
          class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-slate-600 text-sm font-semibold transition-all"
          :class="{ 'bg-primary text-white': selectedPeriod === period }"
        >
          <span>{{ period }}</span>
          <input v-model="selectedPeriod" type="radio" :value="period" class="hidden" />
        </label>
      </div>

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <div class="glass-effect rounded-xl p-5 shadow-sm animate-pulse">
          <div class="h-4 w-32 bg-slate-200 rounded mb-3"></div>
          <div class="h-8 w-24 bg-slate-200 rounded mb-6"></div>
          <div class="flex items-end justify-between h-40 gap-2 px-1">
            <div v-for="i in 7" :key="i" class="flex flex-col items-center flex-1 gap-2 h-full justify-end">
              <div class="w-full bg-slate-200 rounded-t-lg" :style="{ height: `${20 + i * 10}%` }"></div>
              <div class="h-2 w-6 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Stats Card -->
      <template v-else>
        <section class="glass-effect rounded-xl p-5 shadow-sm">
          <div class="flex justify-between items-end mb-6">
            <div>
              <p class="text-slate-500 text-sm font-medium">Total Meditation Time</p>
              <h2 class="text-slate-900 text-3xl font-extrabold tracking-tight">
                {{ formattedTotalTime.value }}
                <span class="text-lg font-medium text-slate-500">{{ formattedTotalTime.unit }}</span>
              </h2>
            </div>
            <!-- Trend Badge -->
            <div
              v-if="stats"
              class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
              :class="stats.trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
            >
              <span class="material-symbols-outlined text-sm">
                {{ stats.trend >= 0 ? 'trending_up' : 'trending_down' }}
              </span>
              <span>{{ stats.trend >= 0 ? '+' : '' }}{{ stats.trend }}%</span>
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="flex items-end justify-between h-40 gap-2 px-1">
            <template v-if="chartDataWithHeight.length">
              <div
                v-for="(item, index) in chartDataWithHeight"
                :key="index"
                class="flex flex-col items-center flex-1 gap-2 h-full justify-end"
              >
                <div
                  v-if="item.height > 0"
                  class="w-full bg-primary rounded-t-lg transition-all duration-300"
                  :style="{ height: `${item.height}%`, opacity: index % 2 === 0 ? 0.45 : 0.7 }"
                />
                <span class="text-[10px] font-bold text-slate-500">{{ item.label }}</span>
              </div>
            </template>
            <!-- No data yet -->
            <div v-else class="flex-1 flex items-center justify-center text-slate-400 text-sm">
              尚無本期冥想記錄
            </div>
          </div>
        </section>

        <!-- Recent Sessions -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-slate-900 text-lg font-bold">Recent Sessions</h3>
          </div>

          <!-- Empty state -->
          <div
            v-if="recentSessions.length === 0"
            class="glass-effect rounded-xl p-8 flex flex-col items-center text-center gap-3"
          >
            <span class="material-symbols-outlined text-slate-300 text-5xl">self_improvement</span>
            <p class="text-slate-500 text-sm">尚無冥想記錄，開始你的第一次冥想吧！</p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <div
              v-for="session in recentSessions"
              :key="session.id"
              class="glass-effect p-4 rounded-xl flex items-center gap-4"
            >
              <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <span class="material-symbols-outlined">self_improvement</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start gap-2">
                  <h4 class="text-slate-900 font-bold text-sm">
                    {{ session.meditationType || 'Meditation Session' }}
                  </h4>
                  <span class="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                    {{ formatDate(session.startedAt) }}
                  </span>
                </div>
                <p class="text-slate-400 text-xs mt-1">
                  {{ session.completed ? '✓ 完成' : '⏸ 部分完成' }}
                  · {{ Math.round(session.targetSeconds / 60) }}m 目標
                </p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-slate-900 font-bold text-sm">{{ formatDuration(session.durationSeconds) }}</p>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.sky-gradient {
  background: linear-gradient(180deg, #87CEEB 0%, #E0F2F7 100%);
}

.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}
</style>
