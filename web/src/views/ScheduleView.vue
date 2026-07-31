<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { images, wedding } from '@/data/wedding'

const router = useRouter()
const weddingDate = new Date(wedding.date)
const now = new Date()
const sameDay =
  now.getFullYear() === weddingDate.getFullYear() &&
  now.getMonth() === weddingDate.getMonth() &&
  now.getDate() === weddingDate.getDate()

const eventState = computed(() => {
  if (sameDay) return '正在发生'
  return now < weddingDate ? '等待开场' : '珍藏回忆'
})

const activeIndex = computed(() => {
  if (!sameDay) return -1
  const minutes = now.getHours() * 60 + now.getMinutes()
  let current = -1
  wedding.schedule.forEach((item, index) => {
    const [hour, minute] = item.time.split(':').map(Number)
    if (minutes >= hour * 60 + minute) current = index
  })
  return current
})
</script>

<template>
  <div class="page-shell">
    <header class="sub-hero schedule-hero">
      <img class="cover-image" :src="images.stageBackdrop" alt="婚礼舞台" />
      <div class="sub-hero__shade"></div>
      <div class="sub-hero__copy">
        <span class="status-pill"><i></i>{{ eventState }}</span>
        <span class="eyebrow">THE WEDDING DAY</span>
        <h1 class="sub-hero__title serif">婚礼流程</h1>
        <p>{{ wedding.dateDisplay }} · {{ wedding.venue.name }}</p>
        <a class="outline-action pressable" href="/api/calendar.ics"><span>加入日历</span><span>＋</span></a>
      </div>
    </header>

    <section class="section timeline-section">
      <div class="chapter-row"><span class="chapter-index">PROGRAMME</span><span class="eyebrow">TIMELINE</span></div>
      <h2 class="section-heading">灯光依次亮起</h2>
      <p class="section-copy">婚礼当天，当前环节会被聚光灯点亮。建议提前 30 分钟到场。</p>
      <div class="timeline">
        <article
          v-for="(item, index) in wedding.schedule"
          :key="item.time"
          class="timeline-item"
          :class="{ 'is-active': activeIndex === index, 'is-past': activeIndex > index }"
        >
          <div class="timeline-rail"><span></span><i v-if="index !== wedding.schedule.length - 1"></i></div>
          <div class="timeline-content">
            <div class="timeline-head"><time class="serif">{{ item.time }}</time><b v-if="activeIndex === index">NOW</b></div>
            <h3 class="serif">{{ item.title }}</h3>
            <p>{{ item.detail }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section activities-section light-chapter">
      <div class="chapter-row"><span class="chapter-index">PARTICIPATE</span><span class="eyebrow">ACTIVITIES</span></div>
      <h2 class="section-heading">不只是旁观</h2>
      <p class="section-copy">拍下一张照片、留下一句话，让你也成为婚礼故事的一部分。</p>
      <button class="entry-card line-card pressable" @click="router.push('/interact')">
        <span class="entry-number serif">01</span>
        <span class="entry-main"><b class="serif">照片共创</b><small>上传你眼中的婚礼瞬间</small></span><span>↗</span>
      </button>
      <button class="entry-card line-card pressable" @click="router.push('/interact')">
        <span class="entry-number serif">02</span>
        <span class="entry-main"><b class="serif">留下祝福</b><small>把想说的话交给未来的我们</small></span><span>↗</span>
      </button>
    </section>

    <section class="guide-section">
      <img class="cover-image" :src="images.handoverStage" alt="" loading="lazy" />
      <div class="guide-shade"></div>
      <div class="guide-content">
        <div class="chapter-row"><span class="chapter-index">GUEST NOTES</span><span class="eyebrow">GUIDE</span></div>
        <h2 class="guide-title serif">宾客指南</h2>
        <div class="guide-grid">
          <div><small>建议着装</small><b class="serif">{{ wedding.dressCode.join(' / ') }}</b></div>
          <div><small>抵达时间</small><b class="serif">仪式前 30 分钟</b></div>
        </div>
        <p><b>温馨提示</b>仪式期间请将手机调至静音；拍照时请勿使用闪光灯。</p>
      </div>
    </section>
  </div>
</template>
