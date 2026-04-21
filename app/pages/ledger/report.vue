<script setup lang="ts">
import { onMounted } from 'vue'
const { reportData, loadReportData, isLedgerLoading } = useLedger()
const { t } = useI18n()

definePageMeta({
  layout: false
})

onMounted(() => {
  loadReportData()
})

const goBack = () => {
  router.back()
}

const router = useRouter()
</script>

<template>
  <div class="report-page bg-[#f6f7f8] min-h-screen text-[#101a22] pb-32 max-w-[430px] mx-auto relative shadow-2xl overflow-x-hidden">
    <!-- Subtle Background Texture -->
    <div class="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP2mbCyeIIL4EJ9HeThYYrRum6OkZ0GxtaTwSQWZx1b7vIq0G82gEJE_UsAWyCzfrlaR3mxcRT13S1ww4Vt8_dvIKEFONvkTh5-8SiLTW2OzD3Oon__XKqIkSxA1hXkkaOrMA-opnTSLb3VLIOHPsY_38Js9-Djhhv-fp6jEW2UCFuHRAC4mEUjv_LB7eE0Ev_eisemwNNC9nWP59AUoub93pd1euKt5-BNHfwZa91pv7hg5L0OfZ3M92E19CcJgi0BVQ5nbyfro0" alt="background" />
    </div>

    <!-- TopAppBar -->
    <AppPageHeader :title="t('ledger.report')" @back="goBack" />

    <main v-if="reportData" class="relative z-10 px-6 pt-8 space-y-8">
      <!-- Summary Bento Grid -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Balance Card -->
        <div class="glass-card p-6 rounded-3xl shadow-[0_0_20px_rgba(43,157,238,0.1)]">
          <p class="text-[12px] uppercase tracking-widest font-bold text-slate-500 mb-2">Total Balance</p>
          <h2 class="text-3xl font-extrabold text-[#2b9dee] tracking-tight">{{ reportData.summary.totalBalance }}</h2>
          <div class="mt-4 flex items-center gap-2 text-[#4CAF50] text-sm font-semibold">
            <span class="material-symbols-outlined text-sm">trending_up</span>
            <span>{{ reportData.summary.incomeGrowth }} from last month</span>
          </div>
        </div>
        <!-- Income Card -->
        <div class="glass-card p-6 rounded-3xl shadow-[0_0_20px_rgba(43,157,238,0.1)]">
          <p class="text-[12px] uppercase tracking-widest font-bold text-slate-500 mb-2">Monthly Income</p>
          <h2 class="text-3xl font-extrabold text-blue-900 tracking-tight">{{ reportData.summary.monthlyIncome }}</h2>
          <div class="mt-4 flex items-center gap-2 text-[#2b9dee] text-sm font-semibold">
            <span class="material-symbols-outlined text-sm">payments</span>
            <span>Current Month</span>
          </div>
        </div>
        <!-- Expenses Card -->
        <div class="glass-card p-6 rounded-3xl shadow-[0_0_20px_rgba(43,157,238,0.1)]">
          <p class="text-[12px] uppercase tracking-widest font-bold text-slate-500 mb-2">Monthly Expenses</p>
          <h2 class="text-3xl font-extrabold text-[#ba1a1a] tracking-tight">{{ reportData.summary.monthlyExpenses }}</h2>
          <div class="mt-4 flex items-center gap-2 text-[#ba1a1a]/70 text-sm font-semibold">
            <span class="material-symbols-outlined text-sm">shopping_cart</span>
            <span>Calculated Total</span>
          </div>
        </div>
      </section>

      <!-- Monthly Trend Chart -->
      <section class="glass-card p-8 rounded-3xl shadow-[0_0_40px_rgba(43,157,238,0.05)]">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h3 class="text-xl font-bold tracking-wide text-blue-900">Monthly Trend</h3>
            <p class="text-sm text-slate-500 font-medium">Income vs Expenses (Last 6 Months)</p>
          </div>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#2b9dee]"></span>
              <span class="text-xs font-bold uppercase tracking-widest text-slate-600">Income</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#ffb869]"></span>
              <span class="text-xs font-bold uppercase tracking-widest text-slate-600">Expenses</span>
            </div>
          </div>
        </div>
        <!-- Area Chart Visualization -->
        <div class="relative h-64 w-full flex items-end justify-between px-2 gap-4">
          <div v-for="(point, index) in reportData.monthlyTrend" :key="point.month" class="relative flex-1 group h-full flex flex-col justify-end">
            <!-- Simulated bars/areas -->
            <div 
              class="relative w-full bg-[#2b9dee]/20 rounded-t-lg transition-all duration-500 hover:bg-[#2b9dee]/30" 
              :style="{ height: `${Math.min(90, (point.income / 10000) * 80 + 10)}%` }"
            >
               <div class="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white shadow-md rounded px-2 py-1 text-[10px] whitespace-nowrap z-20">In: ${{point.income}}</div>
            </div>
            <div 
              class="absolute bottom-0 left-0 right-0 bg-[#ffb869]/40 rounded-t-lg transition-all duration-500 hover:bg-[#ffb869]/60" 
              :style="{ height: `${Math.min(90, (point.expenses / 10000) * 80 + 5)}%` }"
            >
               <div class="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white shadow-md rounded px-2 py-1 text-[10px] whitespace-nowrap z-20">Out: ${{point.expenses}}</div>
            </div>
            <p class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold" :class="index === 5 ? 'text-blue-600' : 'text-slate-400'">{{ point.monthShort }}</p>
          </div>
        </div>
      </section>

      <!-- Bottom Layout: Expense Breakdown & Top Categories -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        <!-- Expense Breakdown Donut Chart -->
        <div class="glass-card p-8 rounded-3xl flex flex-col justify-between">
          <h3 class="text-xl font-bold tracking-wide text-blue-900 mb-6">Expense Breakdown</h3>
          <div class="flex items-center gap-8">
            <!-- Donut -->
            <div class="relative w-32 h-32 flex-shrink-0">
              <svg class="w-full h-full transform -rotate-90">
                <circle class="text-slate-100" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" stroke-width="12"></circle>
                <template v-for="(item, i) in reportData.expenseBreakdown" :key="item.category">
                  <circle 
                    :class="`transition-all duration-1000`" 
                    :cx="64" :cy="64" fill="transparent" r="54" 
                    :stroke="item.color" 
                    stroke-width="12"
                    :stroke-dasharray="339"
                    :stroke-dashoffset="339 - (item.percentage / 100 * 339)"
                    :style="{ transform: `rotate(${getRotation(i, reportData.expenseBreakdown)}deg)`, transformOrigin: 'center' }"
                  ></circle>
                </template>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-tighter">Current</span>
                <span class="text-lg font-bold text-blue-900 leading-none">100%</span>
              </div>
            </div>
            <!-- Categories List -->
            <div class="flex-1 space-y-3">
              <div v-for="item in reportData.expenseBreakdown" :key="item.category" class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: item.color }"></span>
                  <span class="text-sm font-semibold text-slate-600">{{ item.category }}</span>
                </div>
                <span class="text-sm font-bold text-blue-900">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Top Transaction Categories -->
        <div class="glass-card p-8 rounded-3xl">
          <h3 class="text-xl font-bold tracking-wide text-blue-900 mb-6">Top Categories</h3>
          <div class="space-y-6">
            <div v-for="item in reportData.topCategories" :key="item.category" class="space-y-2">
              <div class="flex justify-between text-sm font-bold uppercase tracking-widest">
                <span class="text-slate-500">{{ item.category }}</span>
                <span class="text-blue-900">${{ item.amount.toLocaleString() }}</span>
              </div>
              <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-[#2b9dee] rounded-full shadow-[0_0_10px_rgba(43,157,238,0.3)] transition-all duration-1000" :style="{ width: `${item.percentage}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Loading State -->
    <div v-else class="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div class="w-12 h-12 border-4 border-[#2b9dee] border-t-transparent rounded-full animate-spin"></div>
      <p class="text-slate-400 font-bold uppercase tracking-widest">{{ t('loading') }}</p>
    </div>

    <!-- BottomNavBar -->
    <nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/10 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(43,157,238,0.1)] bg-gradient-to-t from-white/20 to-transparent max-w-[430px] mx-auto left-1/2 -translate-x-1/2">
      <NuxtLink to="/ledger" class="flex flex-col items-center justify-center text-slate-500/80 px-6 py-2 hover:text-blue-400 Transition-colors active:scale-90 transition-all">
        <span class="material-symbols-outlined">list_alt</span>
        <span class="text-[10px] tracking-widest uppercase font-bold">Ledger</span>
      </NuxtLink>
      <div class="flex flex-col items-center justify-center text-blue-600 bg-white/30 rounded-full px-6 py-2 shadow-[0_0_20px_rgba(43,157,238,0.3)] active:scale-90 transition-all">
        <span class="material-symbols-outlined">analytics</span>
        <span class="text-[10px] tracking-widest uppercase font-bold">Report</span>
      </div>
      <NuxtLink to="/" class="flex flex-col items-center justify-center text-slate-500/80 px-6 py-2 hover:text-blue-400 Transition-colors active:scale-90 transition-all">
        <span class="material-symbols-outlined">group</span>
        <span class="text-[10px] tracking-widest uppercase font-bold">Members</span>
      </NuxtLink>
      <NuxtLink to="/userCenter" class="flex flex-col items-center justify-center text-slate-500/80 px-6 py-2 hover:text-blue-400 Transition-colors active:scale-90 transition-all">
        <span class="material-symbols-outlined">settings</span>
        <span class="text-[10px] tracking-widest uppercase font-bold">Settings</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.report-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.glass-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tricolor-logo {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ba1a1a;
  position: relative;
}

.tricolor-logo-inner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffdcbb;
  display: grid;
  place-items: center;
}

.tricolor-logo-center {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4CAF50;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Donut chart rotation helper */
</style>

<script lang="ts">
// Helper for donut chart rotation
function getRotation(index: number, items: any[]) {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += items[i].percentage;
  }
  return offset * 3.6; // 360 / 100
}
</script>
