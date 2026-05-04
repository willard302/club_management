<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

// 從 Controller 取得處理好的狀態與操作方法
const {
  clubBalance,
  monthIn,
  monthOut,
  transactions,
  loadLedgerData,
  getStatusColor,
  getIconColor
} = useLedger()

// 載入初始資料
onMounted(() => {
  loadLedgerData()
})

const { t } = useI18n()

const goBack = () => {
  const router = useRouter()
  router.back()
}
</script>

<template>
  <!-- Header -->
  <AppPageHeader :title="t('ledger.title')" @back="goBack">
    <template #right-actions>
      <button class="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
        <span class="material-symbols-outlined text-3xl">menu</span>
      </button>
    </template>
  </AppPageHeader>

    <!-- Balance Card -->
    <section class="px-6 py-4">
      <div class="sky-gradient-card p-6 rounded-[32px] relative overflow-hidden shadow-xl shadow-sky-200/50">
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div class="relative z-10 flex flex-col items-center">
          <p class="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-2">{{ t('ledger.treasuryBalance') }}</p>
          <h1 class="text-5xl font-bold tracking-tight text-white mb-6">{{ clubBalance }}</h1>
          <div class="flex gap-4 w-full">
            <NuxtLink to="/ledger/new" class="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-white/30 inline-flex">
              <span class="material-symbols-outlined text-lg">add_circle</span> {{ t('ledger.newEntry') }}
            </NuxtLink>
            <NuxtLink to="/ledger/report" class="flex-1 bg-white text-sky-500 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 hover:shadow-lg">
              <span class="material-symbols-outlined text-lg">ios_share</span> {{ t('ledger.report') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-4 px-6 mb-2">
      <div class="cloud-card p-4 rounded-2xl flex items-center gap-3">
        <div class="size-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
          <span class="material-symbols-outlined">trending_up</span>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{{ t('ledger.monthIn') }}</p>
          <p class="font-bold text-slate-800 text-base">{{ monthIn }}</p>
        </div>
      </div>
      <div class="cloud-card p-4 rounded-2xl flex items-center gap-3">
        <div class="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
          <span class="material-symbols-outlined">trending_down</span>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{{ t('ledger.monthOut') }}</p>
          <p class="font-bold text-slate-800 text-base">{{ monthOut }}</p>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <main class="flex-1 px-6 pb-32">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-slate-800">{{ t('ledger.transactionHistory') }}</h3>
        <button class="text-sky-500 text-sm font-semibold hover:text-sky-600 transition-colors">{{ t('ledger.viewAll') }}</button>
      </div>
      <div class="space-y-0">
        <NuxtLink
          v-for="transaction in transactions"
          :key="transaction.id"
          :to="`/ledger/${transaction.id}`"
          class="transaction-item flex items-center justify-between py-3 hover:bg-slate-50/50 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div :class="`size-12 rounded-2xl flex items-center justify-center ${getIconColor(transaction.icon)}`">
              <span class="material-symbols-outlined">{{ transaction.icon }}</span>
            </div>
            <div>
              <p class="font-semibold text-slate-800 text-sm">{{ transaction.title }}</p>
              <p class="text-xs text-slate-400">{{ transaction.category }}</p>
            </div>
          </div>
          <div class="text-right">
            <p :class="[
              'font-bold px-2',
              transaction.type === 'income' ? 'text-sky-500' : 'text-slate-700'
            ]">
              {{ transaction.amountDisplay }}
            </p>
            <span :class="[
              'inline-block px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider',
              getStatusColor(transaction.status)
            ]">
              {{ t('ledger.status' + transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)) }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </main>

</template>

<style scoped>
.sky-gradient-card {
  background: linear-gradient(180deg, #0EA5E9 0%, #38BDF8 100%);
}

.transaction-item {
  border-bottom: 1px solid #F1F5F9;
}

.transaction-item:last-child {
  border-bottom: none;
}

.cloud-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: var(--ios-blur);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: var(--cloud-shadow);
}

.ios-tab-bar {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: var(--ios-blur);
}
</style>
