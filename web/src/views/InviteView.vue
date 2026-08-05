<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { images, wedding } from '@/data/wedding'
import { openMap, sharePage } from '@/lib/browser'
import { useToast } from '@/composables/useToast'

const DAY = 24 * 60 * 60 * 1000
const router = useRouter()
const toast = useToast()
const now = ref(Date.now())
const opening = ref(sessionStorage.getItem('wedding-opening-seen') !== '1')
let countdownTimer: number | undefined
let openingTimer: number | undefined

const guestName = computed(() => new URLSearchParams(window.location.search).get('guest')?.trim() || '')
const countdown = computed(() => {
  const distance = Math.max(0, new Date(wedding.date).getTime() - now.value)
  return {
    days: String(Math.floor(distance / DAY)).padStart(3, '0'),
    hours: String(Math.floor((distance % DAY) / 3_600_000)).padStart(2, '0'),
    minutes: String(Math.floor((distance % 3_600_000) / 60_000)).padStart(2, '0'),
    seconds: String(Math.floor((distance % 60_000) / 1000)).padStart(2, '0'),
    ended: distance === 0,
  }
})

function closeOpening() {
  opening.value = false
  sessionStorage.setItem('wedding-opening-seen', '1')
  window.clearTimeout(openingTimer)
}

async function shareInvitation() {
  try {
    const result = await sharePage({
      title: `${wedding.couple.display}｜婚礼邀请`,
      text: `${wedding.dateDisplay} · ${wedding.venue.name}`,
      url: `${window.location.origin}/`,
    })
    if (result === 'copied') toast.show('邀请链接已复制')
  } catch {
    // The share sheet can be dismissed without needing an error message.
  }
}

onMounted(() => {
  countdownTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
  if (opening.value) openingTimer = window.setTimeout(closeOpening, 2200)
})

onBeforeUnmount(() => {
  window.clearInterval(countdownTimer)
  window.clearTimeout(openingTimer)
})
</script>

<template>
  <div class="page-shell invite-page">
    <button v-if="opening" class="opening-scene" aria-label="轻触进入婚礼邀请" @click="closeOpening">
      <span class="opening-glow"></span>
      <span class="opening-curtain opening-curtain--left"></span>
      <span class="opening-curtain opening-curtain--right"></span>
      <span class="opening-mark">
        <span class="opening-monogram serif">K</span>
        <i></i>
        <span class="opening-monogram serif">M</span>
        <span class="opening-caption">THE CURTAIN OPENS</span>
      </span>
      <span class="opening-skip">轻触进入</span>
    </button>

    <header class="hero">
      <img class="cover-image hero-image" :src="images.heroSea" alt="" />
      <div class="hero-shade"></div>
      <div class="hero-beam"></div>
      <div class="hero-top">
        <span class="micro-label">OUR WEDDING · 2026</span>
        <span class="hero-mark serif">K / M</span>
      </div>
      <div class="hero-content">
        <p v-if="guestName" class="guest-line">致 {{ guestName }}</p>
        <div class="name-lockup">
          <h1 class="hero-title serif">{{ wedding.couple.groom }}</h1>
          <div class="hero-cross"><i></i><span>×</span><i></i></div>
          <h1 class="hero-title serif">{{ wedding.couple.bride }}</h1>
        </div>
        <p class="hero-subtitle">我们的婚礼</p>
      </div>
      <div class="hero-meta">
        <p class="hero-date serif">{{ wedding.dateDisplay }}</p>
        <p class="hero-venue">{{ wedding.venue.name }}</p>
        <p class="hero-quote serif">{{ wedding.quote }}</p>
        <span class="scroll-cue"><i></i></span>
      </div>
    </header>

    <section class="section countdown-section light-chapter">
      <div class="chapter-row"><span class="chapter-index">ACT I</span><span class="eyebrow">SAVE THE DATE</span></div>
      <h2 class="section-heading">{{ countdown.ended ? '故事已经开场' : '距离故事开场' }}</h2>
      <div class="countdown-editorial">
        <div class="countdown-main">
          <strong class="countdown-number serif">{{ countdown.days }}</strong>
          <span class="countdown-unit"><b>天</b><small>DAYS</small></span>
        </div>
        <div class="countdown-rest">
          <span><b>{{ countdown.hours }}</b><small>HOURS</small></span>
          <span><b>{{ countdown.minutes }}</b><small>MINUTES</small></span>
          <span><b>{{ countdown.seconds }}</b><small>SECONDS</small></span>
        </div>
      </div>
      <p class="countdown-note serif">九月十二日，愿你与我们共同抵达。</p>
    </section>

    <section class="story-section">
      <img class="cover-image" :src="images.ceremonyStage" alt="深蓝色婚礼仪式舞台" loading="lazy" />
      <div class="story-shade"></div>
      <div class="story-copy">
        <span class="eyebrow">ACT II · OUR STORY</span>
        <h2 class="story-title serif">光落下的时候</h2>
        <p class="story-body">我们想把那些平常却珍贵的时刻，变成这一天的光。也想邀请你，来到故事真正发生的地方。</p>
        <div class="story-line"><i></i><span>TOGETHER, INTO THE LIGHT</span></div>
      </div>
    </section>

    <section class="portrait-section light-chapter">
      <div class="portrait-heading">
        <div class="chapter-row"><span class="chapter-index">ACT III · PORTRAITS</span><span class="eyebrow">THE TWO OF US</span></div>
        <h2 class="section-heading">我们，和我们喜欢的日常</h2>
        <p class="section-copy">从此以后，生活继续发生，只是每一个明天都有彼此。</p>
      </div>

      <figure class="portrait-feature">
        <img :src="images.coupleClose" alt="张凯文与刘明玥的婚纱照" loading="lazy" />
        <span class="portrait-feature__line"></span>
        <figcaption>
          <small>KEVIN &amp; MINGYUE</small>
          <span class="serif">并肩，向同一个以后</span>
        </figcaption>
      </figure>

      <div class="portrait-pair">
        <figure>
          <img :src="images.couplePlayful" alt="张凯文与刘明玥的轻松合影" loading="lazy" />
          <figcaption><span>01</span><small>LAUGHTER</small></figcaption>
        </figure>
        <figure>
          <img :src="images.coupleFormal" alt="张凯文与刘明玥的正式合影" loading="lazy" />
          <figcaption><span>02</span><small>TOGETHER</small></figcaption>
        </figure>
      </div>

      <div class="portrait-signature">
        <span class="serif">K</span><i></i><span class="serif">M</span>
      </div>
    </section>

    <section class="section entry-section">
      <div class="chapter-row"><span class="chapter-index">ACT IV</span><span class="eyebrow">EXPLORE</span></div>
      <h2 class="section-heading">关于这一天</h2>
      <div class="entry-list">
        <button class="entry-card line-card pressable" @click="router.push('/schedule')">
          <span class="entry-number serif">01</span>
          <span class="entry-main"><b class="serif">婚礼流程</b><small>签到 · 合影 · 仪式 · 晚宴</small></span>
          <span class="entry-arrow">↗</span>
        </button>
        <button class="entry-card line-card pressable" @click="router.push('/interact')">
          <span class="entry-number serif">02</span>
          <span class="entry-main"><b class="serif">参与这一天</b><small>照片共创 · 文字祝福</small></span>
          <span class="entry-arrow">↗</span>
        </button>
      </div>
    </section>

    <section class="section venue-section light-chapter">
      <div class="venue-card">
        <img class="cover-image" :src="images.welcomeInstallation" alt="婚礼迎宾装置" loading="lazy" />
        <div class="venue-overlay"></div>
        <div class="venue-content">
          <span class="chapter-index">ACT V · VENUE</span>
          <h2 class="venue-name serif">{{ wedding.venue.name }}</h2>
          <p class="venue-date">{{ wedding.dateDisplay }}</p>
          <button class="venue-button pressable" @click="openMap(wedding.venue)"><span>查看地图</span><span>↗</span></button>
        </div>
      </div>
    </section>

    <button class="city-section pressable" @click="router.push('/travel')">
      <img class="cover-image" :src="images.welcomeInstallation" alt="" loading="lazy" />
      <span class="city-shade"></span>
      <span class="city-route"><i></i><i></i><i></i><i></i></span>
      <span class="city-content">
        <span class="chapter-row"><span class="chapter-index">ACT VI · CITY GUIDE</span><span class="eyebrow">JINGDEZHEN</span></span>
        <span class="city-copy"><b class="city-title serif">婚礼之外，顺游瓷都</b><small>从酒店出发，去看窑火、老城与这座城市仍在生长的当代一面。</small></span>
        <span class="city-link"><i>四处私心推荐</i><i>查看漫游指南 ↗</i></span>
      </span>
    </button>

    <figure class="outdoor-portrait">
      <img class="cover-image" :src="images.coupleOutdoor" alt="张凯文与刘明玥的户外合影" loading="lazy" />
      <span class="outdoor-portrait__shade"></span>
      <figcaption>
        <small>ONE ORDINARY, BEAUTIFUL DAY</small>
        <span class="serif">是恋人，也是彼此最熟悉的朋友</span>
      </figcaption>
    </figure>

    <section class="invitation-end">
      <img class="cover-image" :src="images.floralSculpture" alt="银白色婚礼花艺装置" loading="lazy" />
      <div class="end-shade"></div>
      <div class="end-content">
        <span class="eyebrow">BE OUR GUEST</span>
        <h2 class="end-title serif">这一天，因你在场<br />而更加完整</h2>
        <button class="ivory-button pressable" @click="router.push('/rsvp')">回应邀请</button>
        <button class="text-button" @click="shareInvitation">分享邀请函</button>
        <p class="end-sign serif">K &amp; M · 2026</p>
      </div>
    </section>
  </div>
</template>
