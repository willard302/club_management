<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

definePageMeta({
  layout: 'default'
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col bg-[#f0f9ff] overflow-x-hidden pb-16">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-sky-500/10">
      <button @click="goBack" class="flex items-center justify-center p-2 rounded-full hover:bg-sky-500/10 transition-colors">
        <span class="material-symbols-outlined text-sky-500">arrow_back</span>
      </button>
      <h1 class="text-lg font-bold tracking-tight text-slate-800">編輯個人資料</h1>
      <div class="concentric-logo">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </header>

    <main class="flex-1 w-full px-4 py-6 space-y-8">
      <!-- Profile Picture Section -->
      <div class="flex flex-col items-center gap-4">
        <div class="relative group">
          <div class="size-32 rounded-full bg-white p-1 shadow-xl border border-sky-500/20 overflow-hidden">
            <img alt="User avatar" class="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATEH2UrMZ_npmyIyW2Ut1ayB3kMFtc6zO4G6ZIsIhTogehhQLEN_8j9fgZrGQceDh9aqhr_3gd3XH4V73Bl5wvftx_aN1hEa5vNjNuh-_nVhN3LdX5ut3OhHMqSol0Dfyr6hdAs3VvM4FOhJJUVNFlP1BOx_oodxeYdB1ZXKZJyPbsa-ja834BFgvbZgj53QWNi43MSMOmuDfOCrKEdvRH2_7N91g-N3FB6QGfuZShbwjA4EG5-9eEX5HggZgvLaa13klDLtJKEiw"/>
          </div>
          <button class="absolute bottom-0 right-0 size-10 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-sky-500/90 transition-transform active:scale-95">
            <span class="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
        <div class="text-center">
          <p class="text-sky-500 font-semibold">社團管理系統</p>
        </div>
      </div>

      <!-- Form Section -->
      <div class="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-sm space-y-5 border border-white">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">姓名</label>
          <input class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" placeholder="請輸入姓名" type="text" value="李大同"/>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">學號</label>
          <input class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" placeholder="請輸入學號" type="text" value="410220123"/>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">系級</label>
          <input class="w-full h-12 px-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 text-slate-800" placeholder="例如：資工系三年級" type="text" value="中文系二年級"/>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700 ml-1">個人簡介</label>
          <textarea class="w-full p-4 rounded-2xl border-none bg-white/80 focus:ring-2 focus:ring-sky-500/50 shadow-sm placeholder:text-slate-400 resize-none text-slate-800" placeholder="分享你的習禪心得..." rows="3">靜中養成，動中磨練。在淡江禪學社找到心靈的平靜。</textarea>
        </div>
      </div>

      <!-- Save Button -->
      <div class="pt-4">
        <button class="w-full h-14 bg-sky-500 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/20 hover:bg-sky-500/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <span class="material-symbols-outlined">save</span>
          保存修改
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.concentric-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 40px;
  height: 40px;
}
.circle {
  position: absolute;
  border-radius: 50%;
}
.circle-1 { width: 100%; height: 100%; background-color: #EF4444; z-index: 1; }
.circle-2 { width: 66.67%; height: 66.67%; background-color: #FBBF24; z-index: 2; }
.circle-3 { width: 33.33%; height: 33.33%; background-color: #22C55E; z-index: 3; }
</style>
