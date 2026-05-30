<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { format as fnsFormat } from 'date-fns'
import { eventService } from '@/services/eventService'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

interface AnnouncementItem {
  id: string
  category: '活動' | '公告'
  title: string
  date: string
  time: string
  content: string
}

const router = useRouter()
const { addToast } = useToast()

const { userProfile, loadUserData, isLoading: isUserLoading } = useUser()

const isEventLoading = ref(false)
const upcomingEventTitle = ref('2024 全球校友禪修大會')
const upcomingEventMeta = ref('下週六 09:00，主禮堂')

const announcements = ref<AnnouncementItem[]>([
  {
    id: '1',
    category: '活動',
    title: '北區校友聯誼會 - 報名開始',
    date: '2024.10.24',
    time: '14:30',
    content: '誠摯邀請本會社員及校友參與 11 月聯誼活動，歡迎攜伴參加。報名截止日前完成登記即可獲得活動紀念品。'
  },
  {
    id: '2',
    category: '公告',
    title: '113 學年度社團經費審核報告已公開',
    date: '2024.10.23',
    time: '18:20',
    content: '本學期經費使用已完成第一階段審核，細項與執行成果已更新於社團公告區，歡迎社員檢視並提出建議。'
  }
])

const userPoints = computed(() => userProfile.value?.points ?? 0)

const isLoading = computed(() => isUserLoading.value)

const goToCalendar = () => {
  router.push('/calendar')
}

const loadUpcomingEvent = async () => {
  isEventLoading.value = true
  try {
    const events = await eventService.fetchEvents()
    const now = new Date()
    const nextEvent = events
      .filter(event => event.startAt.getTime() >= now.getTime())
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0]

    if (nextEvent) {
      upcomingEventTitle.value = nextEvent.title
      upcomingEventMeta.value = `${fnsFormat(nextEvent.startAt, 'MM/dd HH:mm')}，${nextEvent.location || '待定地點'}`
    }
  } catch (error) {
    console.error('Failed to load upcoming event', error)
  } finally {
    isEventLoading.value = false
  }
}

const goToProfile = () => {
  router.push('/user-center')
}

const goToAnnouncement = () => {
  router.push('/calendar')
}

const openSupportAction = () => {
  addToast('募款頁面建置中，將於近期開放', 'info')
}

const viewAllAnnouncements = () => {
  addToast('完整公告列表建置中', 'info')
}

onMounted(async () => {
  await Promise.all([loadUserData(), loadUpcomingEvent()])
})
</script>

<template>
  <main class="home-page">
    <section class="event-banner" @click="goToCalendar">
      <div class="event-banner__mask"></div>
      <div class="event-banner__content">
        <p class="event-banner__label">UPCOMING EVENT</p>
        <h1 class="event-banner__title">{{ isEventLoading ? '活動載入中...' : upcomingEventTitle }}</h1>
        <p class="event-banner__meta">{{ upcomingEventMeta }}</p>
        <button class="event-banner__cta" type="button">
          了解更多
        </button>
      </div>
    </section>

    <section class="stats-grid">
      <article class="points-card" @click="goToProfile">
        <div class="points-card__overlay">
          <div class="points-card__icon-wrap">
            <span class="material-symbols-outlined">stars</span>
          </div>
        </div>
        <p class="points-card__value">{{ userPoints }} pts</p>
      </article>
    </section>

    <section class="announcement-section">
      <div class="section-title-row">
        <h2 class="section-title">最新公告內容</h2>
        <button type="button" class="section-link" @click="viewAllAnnouncements">查看全部</button>
      </div>

      <div v-if="isLoading" class="announcement-loading">
        <span class="material-symbols-outlined spin">progress_activity</span>
        資料載入中...
      </div>

      <div v-else class="announcement-list">
        <button
          v-for="item in announcements"
          :key="item.id"
          type="button"
          class="announcement-item"
          @click="goToAnnouncement"
        >
          <div class="announcement-item__head">
            <span class="announcement-item__category">【{{ item.category }}】</span>
            <span class="announcement-item__meta">{{ item.date }} {{ item.time }}</span>
          </div>
          <h3 class="announcement-item__title">{{ item.title }}</h3>
          <p class="announcement-item__content">{{ item.content }}</p>
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100%;
  padding: 22px 14px 98px;
  background:
    radial-gradient(150px 80px at 105% 2%, rgba(38, 173, 255, 0.2), transparent 70%),
    radial-gradient(200px 130px at -8% 35%, rgba(124, 195, 241, 0.18), transparent 70%),
    #edf2f7;
}

.event-banner {
  position: relative;
  min-height: 155px;
  border-radius: 26px;
  overflow: hidden;
  background-image:
    linear-gradient(110deg, rgba(9, 30, 60, 0.72), rgba(4, 53, 82, 0.38)),
    linear-gradient(145deg, #193d56 10%, #1f5a7d 52%, #5aa2d4 100%);
  box-shadow: 0 16px 28px rgba(30, 78, 108, 0.25);
}

.event-banner__mask {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(0, 0, 0, 0.35), transparent 48%),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0,
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px,
      transparent 36px
    );
}

.event-banner__content {
  position: relative;
  z-index: 1;
  padding: 24px 18px 18px;
}

.event-banner__label {
  color: #0bb2ff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  margin-bottom: 8px;
}

.event-banner__title {
  color: #fff;
  font-size: 26px;
  line-height: 1.08;
  font-weight: 800;
  max-width: 78%;
  margin: 0;
  text-wrap: balance;
}

.event-banner__meta {
  margin: 8px 0 12px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 11px;
  font-weight: 600;
}

.event-banner__cta {
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #12b4ff 0%, #0b9fec 100%);
  color: #fff;
  font-size: 12px;
  padding: 8px 18px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(7, 151, 225, 0.45);
}

.progress-card {
  margin-top: 14px;
  border-radius: 24px;
  background: #f3f7fb;
  border: 1px solid #e8f0f6;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.progress-card__ring-wrap {
  width: 74px;
  height: 74px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  width: 74px;
  height: 74px;
  transform: rotate(-90deg);
}

.progress-ring__track {
  fill: none;
  stroke: #dce8f2;
  stroke-width: 7;
}

.progress-ring__bar {
  fill: none;
  stroke: #1ca6ea;
  stroke-width: 7;
  stroke-linecap: round;
  stroke-dasharray: 201.06;
  transition: stroke-dashoffset 0.3s ease;
}

.progress-card__icon {
  position: absolute;
  color: #1ca6ea;
  font-size: 20px;
}

.progress-card__main {
  flex: 1;
  min-width: 0;
}

.progress-card__label {
  font-size: 12px;
  font-weight: 700;
  color: #94a6b9;
  margin: 0;
}

.progress-card__time-row {
  margin-top: 2px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.progress-card__time {
  font-size: 39px;
  line-height: 0.95;
  font-weight: 800;
  color: #0f1e32;
}

.progress-card__divider,
.progress-card__target {
  font-size: 22px;
  font-weight: 700;
  color: #a3b2c0;
}

.progress-card__target {
  font-size: 22px;
}

.progress-card__hint {
  margin-top: 2px;
  margin-bottom: 0;
  color: #86a0b8;
  font-size: 11px;
  font-weight: 600;
}

.progress-card__hint--done {
  color: #0ea5e9;
}

.progress-card__play {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  border: none;
  color: #fff;
  background: linear-gradient(180deg, #13b2fa 0%, #0d98e4 100%);
  box-shadow: 0 10px 18px rgba(10, 148, 222, 0.36);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-card__play .material-symbols-outlined {
  font-size: 28px;
  font-variation-settings: 'FILL' 1, 'wght' 560, 'GRAD' 0, 'opsz' 24;
}

.stats-grid {
  margin-top: 14px;
  display: grid;
}

.points-card,
.support-card {
  border-radius: 22px;
  background: #f4f7fb;
  border: 1px solid #e8eff5;
  padding: 14px;
}

.points-card {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.points-card__icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffdd62, #f9bf1a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.points-card__label {
  margin: 0;
  color: #8ea1b4;
  font-size: 16px;
  font-weight: 700;
}

.points-card__value {
  margin: 0;
  font-size: 31px;
  line-height: 1;
  font-weight: 800;
  color: #18253b;
}

.announcement-section {
  margin-top: 16px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-title {
  margin: 0;
  color: #182b41;
  font-size: 22px;
  font-weight: 800;
}

.section-link {
  border: none;
  background: transparent;
  color: #2aa6e8;
  font-size: 11px;
  font-weight: 700;
}

.announcement-loading {
  border-radius: 20px;
  background: #f7fafc;
  border: 1px solid #e8eff4;
  color: #8da2b5;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 120px;
}

.announcement-list {
  border-radius: 22px;
  background: #f8fafc;
  border: 1px solid #e9eff4;
  padding: 8px 12px;
}

.announcement-item {
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
  padding: 12px 0;
}

.announcement-item + .announcement-item {
  border-top: 1px solid #ebf1f5;
}

.announcement-item__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.announcement-item__category {
  font-size: 11px;
  font-weight: 700;
  color: #2aa6e8;
}

.announcement-item__meta {
  color: #9aa9b8;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.announcement-item__title {
  margin: 3px 0;
  color: #233349;
  font-size: 13px;
  font-weight: 700;
}

.announcement-item__content {
  margin: 0;
  color: #8ea2b6;
  font-size: 11px;
  line-height: 1.5;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 360px) {
  .event-banner__title {
    font-size: 22px;
    max-width: 85%;
  }

  .progress-card__time {
    font-size: 35px;
  }

  .progress-card__target,
  .progress-card__divider {
    font-size: 18px;
  }
}
</style>
