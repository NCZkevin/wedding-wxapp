<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { images, wedding } from '@/data/wedding'
import { getOrCreateClientId } from '@/lib/browser'
import { submitRsvp, type RsvpPayload } from '@/lib/api'
import { useToast } from '@/composables/useToast'

const STORAGE_KEY = 'wedding-rsvp'
const router = useRouter()
const toast = useToast()
const step = ref(1)
const submitted = ref(false)
const submitting = ref(false)
const form = reactive<RsvpPayload>({
  clientId: '',
  name: '',
  attendance: 'yes',
  guestCount: 1,
  transportMode: '',
  arrivalTime: '',
  arrivalLocation: '',
  message: '',
})

const copy = computed(() => {
  if (form.attendance === 'yes') {
    return { title: '告诉我们你的行程', description: '这些信息只用于统计人数和安排接送。', action: '确认出席' }
  }
  if (form.attendance === 'unsure') {
    return { title: '先留下你的计划', description: '行程还未确定也没关系，之后可以再次修改。', action: '保存待定回复' }
  }
  return { title: '谢谢你告诉我们', description: '只需留下姓名；如果愿意，也可以写一句话。', action: '发送回复' }
})

function formatArrivalTime(value: string) {
  if (!value) return '待补充'
  const [date, time] = value.split('T')
  const [, month, day] = date.split('-')
  return `${Number(month)} 月 ${Number(day)} 日 · ${time}`
}

function formatTransfer() {
  return [form.transportMode, form.arrivalLocation].filter(Boolean).join(' · ') || '待补充'
}

function chooseAttendance(value: RsvpPayload['attendance']) {
  form.attendance = value
  if (value === 'no') {
    form.guestCount = 1
    form.transportMode = ''
    form.arrivalTime = ''
    form.arrivalLocation = ''
  }
}

function nextStep() {
  step.value = 2
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function submit() {
  form.name = form.name.trim()
  form.arrivalLocation = form.arrivalLocation.trim()
  form.message = form.message.trim()

  if (!form.name) {
    toast.show('请填写姓名')
    return
  }

  submitting.value = true
  try {
    await submitRsvp(form)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast.show('回复已经保存')
  } catch (error) {
    toast.show(error instanceof Error ? error.message : '提交失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  form.clientId = getOrCreateClientId('wedding-rsvp-client-id')
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    Object.assign(form, JSON.parse(saved) as RsvpPayload, { clientId: form.clientId })
    submitted.value = true
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
})
</script>

<template>
  <div class="page-shell rsvp-page">
    <nav class="rsvp-nav">
      <button aria-label="返回" @click="router.back()">←</button>
      <span>RSVP</span>
      <i class="serif">K / M</i>
    </nav>

    <section v-if="submitted" v-photo-motion class="success-view">
      <img class="cover-image" :src="images.floralSculpture" alt="" />
      <div class="success-shade"></div>
      <div v-reveal class="success-content">
        <span class="eyebrow">{{ form.attendance === 'yes' ? 'ADMISSION CONFIRMED' : 'REPLY RECEIVED' }}</span>
        <h1 class="success-title serif">
          {{ form.attendance === 'yes' ? '期待与你见面' : form.attendance === 'unsure' ? '为你保留一束光' : '下次见面也值得期待' }}
        </h1>
        <p>{{ form.name }}，{{ form.attendance === 'yes' ? '灯光已经为你亮起。' : '谢谢你认真回复这份邀请。' }}</p>
        <article class="wedding-ticket">
          <header><b class="serif">K × M</b><span>{{ form.attendance === 'yes' ? 'WEDDING ADMISSION' : 'WEDDING REPLY' }}</span></header>
          <h2 class="serif">{{ form.name }}</h2>
          <div class="ticket-grid">
            <span><small>DATE</small><b>{{ wedding.dateDisplay }}</b></span>
            <span><small>GUESTS</small><b>{{ form.attendance === 'yes' ? `${form.guestCount} 人` : '—' }}</b></span>
            <span v-if="form.attendance !== 'no'"><small>ARRIVAL</small><b>{{ formatArrivalTime(form.arrivalTime) }}</b></span>
            <span v-if="form.attendance !== 'no'"><small>TRANSFER</small><b>{{ formatTransfer() }}</b></span>
            <span><small>VENUE</small><b>{{ wedding.venue.name }}</b></span>
            <span><small>STATUS</small><b>{{ form.attendance === 'yes' ? '确认出席' : form.attendance === 'no' ? '无法出席' : '暂未确定' }}</b></span>
          </div>
          <div class="ticket-code"><i v-for="index in 12" :key="index"></i></div>
        </article>
        <button class="ivory-button pressable" @click="submitted = false; step = 2">修改回复</button>
        <button class="text-button" @click="router.push('/')">返回邀请函</button>
      </div>
    </section>

    <template v-else>
      <header v-photo-motion class="rsvp-hero">
        <img class="cover-image" :src="images.handoverStage" alt="" />
        <div class="rsvp-shade"></div>
        <div v-reveal class="rsvp-hero__copy">
          <span class="eyebrow">BE OUR GUEST</span>
          <h1 class="serif">确认出席</h1>
          <p>请在 {{ wedding.rsvpDeadline }} 前告诉我们，你是否会来到现场。</p>
        </div>
      </header>

      <section class="rsvp-panel light-chapter">
        <div class="step-head"><span class="chapter-index">STEP 0{{ step }} / 02</span><i><b :style="{ width: step === 1 ? '50%' : '100%' }"></b></i></div>

        <div v-if="step === 1" v-reveal>
          <h2 class="step-title serif">这一天，你会来吗？</h2>
          <p class="step-copy">无论答案是什么，都谢谢你认真回应这份邀请。</p>
          <div class="attendance-options">
            <button v-for="option in [
              { value: 'yes', index: '01', label: '欣然出席' },
              { value: 'unsure', index: '02', label: '暂未确定' },
              { value: 'no', index: '03', label: '遗憾缺席' },
            ]" :key="option.value" class="attendance-option pressable" :class="{ 'is-active': form.attendance === option.value }" @click="chooseAttendance(option.value as RsvpPayload['attendance'])">
              <span><small>{{ option.index }}</small><b class="serif">{{ option.label }}</b></span><i><b></b></i>
            </button>
          </div>
          <button class="dark-button pressable" @click="nextStep">
            <span>{{ form.attendance === 'yes' ? '填写出席信息' : form.attendance === 'unsure' ? '填写初步信息' : '快速回复' }}</span><span>→</span>
          </button>
        </div>

        <form v-else v-reveal @submit.prevent="submit">
          <h2 class="step-title serif">{{ copy.title }}</h2>
          <p class="step-copy">{{ copy.description }}</p>
          <label class="form-field"><span class="field-label">姓名 *</span><input v-model="form.name" maxlength="30" placeholder="请输入你的姓名" /></label>
          <label v-if="form.attendance === 'yes'" class="form-field"><span class="field-label">出席人数</span><select v-model.number="form.guestCount"><option v-for="count in 6" :key="count" :value="count">{{ count }} 人</option></select></label>
          <div v-if="form.attendance !== 'no'" class="arrival-fields">
            <div class="arrival-fields__head">
              <span>ARRIVAL PLAN</span>
              <small>均为选填 · 可稍后补充</small>
            </div>
            <label class="form-field">
              <span class="field-label">交通方式（选填）</span>
              <select v-model="form.transportMode">
                <option value="">暂未确定</option>
                <option value="高铁">高铁</option>
                <option value="飞机">飞机</option>
                <option value="自驾">自驾</option>
                <option value="其他">其他</option>
              </select>
            </label>
            <label class="form-field">
              <span class="field-label">到达时间（选填）</span>
              <input v-model="form.arrivalTime" type="datetime-local" />
            </label>
            <label class="form-field">
              <span class="field-label">到达地点（选填）</span>
              <input v-model="form.arrivalLocation" list="arrival-location-options" maxlength="60" placeholder="如景德镇北站、景德镇罗家机场" />
              <datalist id="arrival-location-options">
                <option value="景德镇北站"></option>
                <option value="景德镇罗家机场"></option>
                <option value="乐平市站"></option>
                <option :value="wedding.venue.name"></option>
              </datalist>
            </label>
          </div>
          <label class="form-field message-field"><span class="field-label">想对我们说（选填）</span><textarea v-model="form.message" maxlength="300" placeholder="留下一句话……"></textarea><small>{{ form.message.length }} / 300</small></label>
          <p class="privacy-line privacy-line--dark">你填写的信息只用于本次婚礼服务。</p>
          <button class="dark-button pressable" :disabled="submitting" type="submit"><span>{{ submitting ? '正在保存…' : copy.action }}</span><span>→</span></button>
          <button class="previous-button" type="button" @click="step = 1">返回上一步</button>
        </form>
      </section>
    </template>
  </div>
</template>
