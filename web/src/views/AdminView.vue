<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SignatureMark from '@/components/SignatureMark.vue'
import {
  ApiError,
  downloadAdminRsvpCsv,
  getAdminDashboard,
  type AdminDashboard,
  type AdminRsvpRecord,
} from '@/lib/api'

const SESSION_KEY = 'wedding-admin-session-token'
const password = ref('')
const token = ref('')
const dashboard = ref<AdminDashboard | null>(null)
const loading = ref(false)
const downloading = ref(false)
const errorMessage = ref('')

const summaryCards = computed(() => {
  if (!dashboard.value) return []
  const { summary } = dashboard.value
  return [
    { label: '预计到场', value: summary.guests, unit: '人', note: `${summary.confirmed} 份确认回执` },
    { label: '全部回执', value: summary.replies, unit: '份', note: `${summary.unsure} 份仍待确认` },
    { label: '到达计划', value: summary.arrivalPlans, unit: '份', note: '已填写至少一项行程' },
    { label: '婚礼祝福', value: summary.blessings, unit: '条', note: `${summary.photos} 张照片` },
  ]
})

const arrivalPlans = computed(() => {
  if (!dashboard.value) return []
  return dashboard.value.rsvps
    .filter((record) => record.transportMode || record.arrivalTime || record.arrivalLocation)
    .sort((left, right) => (left.arrivalTime || '9999').localeCompare(right.arrivalTime || '9999'))
})

const maxTransportCount = computed(() => Math.max(1, ...((dashboard.value?.transports ?? []).map((item) => item.count))))

function storeToken(value: string) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, value)
  } catch {
    // The page remains usable for the current render when storage is blocked.
  }
}

function clearStoredToken() {
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}

async function loadDashboard(candidate: string, persist = false) {
  if (!candidate || loading.value) return
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getAdminDashboard(candidate)
    token.value = candidate
    dashboard.value = result
    password.value = ''
    if (persist) storeToken(candidate)
  } catch (error) {
    dashboard.value = null
    if (error instanceof ApiError && error.status === 401) {
      token.value = ''
      clearStoredToken()
      errorMessage.value = '密码不正确，请重新输入。'
    } else {
      errorMessage.value = error instanceof Error ? error.message : '暂时无法读取统计数据。'
    }
  } finally {
    loading.value = false
  }
}

function login() {
  const candidate = password.value.trim()
  if (!candidate) {
    errorMessage.value = '请输入管理密码。'
    return
  }
  void loadDashboard(candidate, true)
}

function logout() {
  token.value = ''
  password.value = ''
  dashboard.value = null
  errorMessage.value = ''
  clearStoredToken()
}

async function downloadCsv() {
  if (!token.value || downloading.value) return
  downloading.value = true
  errorMessage.value = ''

  try {
    const blob = await downloadAdminRsvpCsv(token.value)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wedding-rsvp-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) logout()
    errorMessage.value = error instanceof Error ? error.message : '导出失败，请稍后再试。'
  } finally {
    downloading.value = false
  }
}

function attendanceMeta(attendance: AdminRsvpRecord['attendance']) {
  if (attendance === 'yes') return { label: '确认出席', className: 'is-confirmed' }
  if (attendance === 'unsure') return { label: '暂未确定', className: 'is-unsure' }
  return { label: '无法出席', className: 'is-declined' }
}

function formatDateTime(value: string | null) {
  if (!value) return '待补充'
  return value.replace('T', ' ').slice(0, 16)
}

function formatGeneratedAt(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function readStoredToken() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) || ''
  } catch {
    return ''
  }
}

onMounted(() => {
  const savedToken = readStoredToken()
  if (savedToken) void loadDashboard(savedToken)
})
</script>

<template>
  <div class="admin-page">
    <section v-if="!dashboard" class="admin-login">
      <div class="admin-login__card">
        <span class="admin-login__eyebrow">PRIVATE GUEST LIST · 2026</span>
        <SignatureMark flourish class="admin-login__signature" />
        <h1 class="serif">婚礼数据后台</h1>
        <p>输入服务器配置的 ADMIN_EXPORT_TOKEN，查看回执与行程统计。</p>
        <form @submit.prevent="login">
          <label>
            <span>ADMIN ACCESS</span>
            <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入管理密码" autofocus />
          </label>
          <p v-if="errorMessage" class="admin-form-error" role="alert">{{ errorMessage }}</p>
          <button class="admin-primary-button pressable" type="submit" :disabled="loading">
            <span>{{ loading ? '正在验证…' : '进入统计页面' }}</span><span>→</span>
          </button>
        </form>
        <small>密码仅保留在当前浏览器标签页</small>
      </div>
    </section>

    <template v-else>
      <header class="admin-header">
        <div>
          <span class="admin-kicker">WEDDING OVERVIEW · PRIVATE</span>
          <h1 class="serif">宾客与行程</h1>
          <p>最后刷新于 {{ formatGeneratedAt(dashboard.generatedAt) }}</p>
        </div>
        <div class="admin-header__actions">
          <button class="admin-action" :disabled="loading" @click="loadDashboard(token)">{{ loading ? '刷新中' : '刷新' }}</button>
          <button class="admin-action" :disabled="downloading" @click="downloadCsv">{{ downloading ? '导出中' : '导出 CSV' }}</button>
          <button class="admin-action admin-action--quiet" @click="logout">退出</button>
        </div>
      </header>

      <main class="admin-dashboard">
        <p v-if="errorMessage" class="admin-dashboard-error" role="alert">{{ errorMessage }}</p>

        <section class="admin-summary" aria-label="回执概览">
          <article v-for="card in summaryCards" :key="card.label" class="admin-summary-card">
            <small>{{ card.label }}</small>
            <p><strong>{{ card.value }}</strong><span>{{ card.unit }}</span></p>
            <i>{{ card.note }}</i>
          </article>
        </section>

        <section class="admin-status-strip">
          <span><small>确认出席</small><b>{{ dashboard.summary.confirmed }}</b></span>
          <span><small>暂未确定</small><b>{{ dashboard.summary.unsure }}</b></span>
          <span><small>无法出席</small><b>{{ dashboard.summary.declined }}</b></span>
          <span><small>照片收集</small><b>{{ dashboard.summary.photos }}</b></span>
        </section>

        <div class="admin-grid">
          <section class="admin-panel admin-transport-panel">
            <header>
              <span><small>TRANSPORT</small><h2 class="serif">交通方式</h2></span>
              <i>{{ dashboard.transports.reduce((total, item) => total + item.count, 0) }} 份已填写</i>
            </header>
            <div v-if="dashboard.transports.length" class="admin-transport-list">
              <div v-for="item in dashboard.transports" :key="item.label">
                <span><b>{{ item.label }}</b><small>{{ item.count }} 人</small></span>
                <i><b :style="{ width: `${(item.count / maxTransportCount) * 100}%` }"></b></i>
              </div>
            </div>
            <p v-else class="admin-empty">暂时还没有宾客填写交通方式。</p>
          </section>

          <section class="admin-panel admin-arrival-panel">
            <header>
              <span><small>ARRIVAL PLAN</small><h2 class="serif">到达安排</h2></span>
              <i>{{ arrivalPlans.length }} 条行程</i>
            </header>
            <div v-if="arrivalPlans.length" class="admin-arrival-list">
              <article v-for="record in arrivalPlans" :key="record.id">
                <div><b>{{ record.name }}</b><small>{{ record.attendance === 'yes' ? `${record.guestCount} 人` : '待确认' }}</small></div>
                <p>{{ formatDateTime(record.arrivalTime) }}</p>
                <span>{{ [record.transportMode, record.arrivalLocation].filter(Boolean).join(' · ') || '其他信息待补充' }}</span>
              </article>
            </div>
            <p v-else class="admin-empty">暂时还没有到达计划。</p>
          </section>
        </div>

        <section class="admin-panel admin-record-panel">
          <header>
            <span><small>ALL REPLIES</small><h2 class="serif">全部回执</h2></span>
            <i>{{ dashboard.rsvps.length }} 位回复者</i>
          </header>
          <div v-if="dashboard.rsvps.length" class="admin-record-list">
            <article v-for="record in dashboard.rsvps" :key="record.id" class="admin-record">
              <div class="admin-record__identity">
                <b>{{ record.name }}</b>
                <span class="admin-status" :class="attendanceMeta(record.attendance).className">{{ attendanceMeta(record.attendance).label }}</span>
              </div>
              <div class="admin-record__facts">
                <span><small>人数</small><b>{{ record.attendance === 'yes' ? record.guestCount : '—' }}</b></span>
                <span><small>交通</small><b>{{ record.transportMode || '—' }}</b></span>
                <span><small>到达时间</small><b>{{ formatDateTime(record.arrivalTime) }}</b></span>
                <span><small>到达地点</small><b>{{ record.arrivalLocation || '—' }}</b></span>
              </div>
              <p v-if="record.message" class="admin-record__message">“{{ record.message }}”</p>
              <time>{{ formatDateTime(record.updatedAt) }} 更新</time>
            </article>
          </div>
          <p v-else class="admin-empty">暂时还没有收到回执。</p>
        </section>

        <section class="admin-panel admin-blessing-panel">
          <header>
            <span><small>BLESSINGS</small><h2 class="serif">收到的祝福</h2></span>
            <i>{{ dashboard.blessings.length }} 条 · {{ dashboard.summary.photos }} 张照片</i>
          </header>
          <div v-if="dashboard.blessings.length" class="admin-blessing-list">
            <article v-for="blessing in dashboard.blessings" :key="blessing.id">
              <header>
                <b>{{ blessing.name || '匿名宾客' }}</b>
                <span v-if="blessing.photoCount">{{ blessing.photoCount }} 张照片</span>
              </header>
              <p>{{ blessing.message || '分享了婚礼照片' }}</p>
              <time>{{ formatDateTime(blessing.createdAt) }}</time>
            </article>
          </div>
          <p v-else class="admin-empty">暂时还没有收到祝福。</p>
        </section>
      </main>
    </template>
  </div>
</template>
