<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SignatureMark from '@/components/SignatureMark.vue'
import { images, wedding } from '@/data/wedding'
import { openMap, sharePage } from '@/lib/browser'
import { useToast } from '@/composables/useToast'

const DAY = 24 * 60 * 60 * 1000
const OPENING_STORAGE_KEY = 'wedding-basic-opening-seen-v1'
const router = useRouter()
const toast = useToast()
const now = ref(Date.now())
const opening = ref(sessionStorage.getItem(OPENING_STORAGE_KEY) !== '1')
const eggState = ref<'locked' | 'loading' | 'open'>('locked')
let countdownTimer: number | undefined
let eggTimer: number | undefined

const weddingFlow = ['接亲互动', '午饭', '迎宾留影', '婚礼仪式', '答谢晚宴']
const brideRecommendations = ['御窑厂', '陶瓷博物馆', '大地艺术节', '锄月']

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

function setOpeningLock(locked: boolean) {
  document.documentElement.classList.toggle('ri-opening-active', locked)
}

function closeOpening(startMusic = false) {
  if (!opening.value) return
  opening.value = false
  sessionStorage.setItem(OPENING_STORAGE_KEY, '1')
  setOpeningLock(false)
  if (startMusic) window.dispatchEvent(new Event('wedding:music-request'))
}

function unlockEgg() {
  if (eggState.value !== 'locked') return
  eggState.value = 'loading'
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  eggTimer = window.setTimeout(() => {
    eggState.value = 'open'
  }, reducedMotion ? 180 : 1650)
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
    // The native share sheet can be dismissed without needing an error message.
  }
}

onMounted(() => {
  setOpeningLock(opening.value)
  countdownTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  setOpeningLock(false)
  window.clearInterval(countdownTimer)
  window.clearTimeout(eggTimer)
})
</script>

<template>
  <div class="page-shell invite-page ri-page">
    <Transition name="ri-power">
      <button
        v-if="opening"
        class="ri-opening"
        aria-label="轻触或按回车进入 Kevin 与 Huan 的婚礼邀请，并播放背景音乐"
        @click="closeOpening(true)"
      >
        <span class="ri-opening__stars" aria-hidden="true"></span>
        <span class="ri-opening__art">
          <img :src="images.beginScreen" alt="复古 Atari 电脑正在载入 Kevin 与 Huan 的婚礼邀请" />
          <span class="ri-opening__glow" aria-hidden="true"></span>
          <span class="ri-scanlines" aria-hidden="true"></span>
          <span class="ri-opening__sweep" aria-hidden="true"></span>
        </span>
        <span class="ri-opening__status">
          <span><i></i>LOVE.EXE READY</span>
          <strong>轻触屏幕&nbsp;&nbsp;/&nbsp;&nbsp;PRESS ENTER</strong>
          <small>A$=<b aria-hidden="true">█</b></small>
        </span>
      </button>
    </Transition>

    <header class="ri-event">
      <span class="ri-event__stars" aria-hidden="true"></span>
      <div class="ri-terminal-bar"><span>LOVE.EXE / EVENT INFO</span><span>READY_</span></div>
      <div v-reveal class="ri-event__identity">
        <p v-if="guestName">DEAR {{ guestName }} · THIS INVITATION IS FOR YOU</p>
        <span>THE WEDDING OF</span>
        <SignatureMark flourish />
        <small>张凯文 &amp; 刘明玥</small>
      </div>

      <div v-reveal="{ delay: 80 }" class="ri-event__date">
        <span>SEPTEMBER</span>
        <strong class="serif">09<span>/</span>12</strong>
        <p>2026 · SATURDAY</p>
      </div>

      <div v-reveal="{ delay: 140 }" class="ri-event__details">
        <div><small>GUEST ARRIVAL</small><b>17:00</b><span>迎宾留影</span></div>
        <div><small>DESTINATION</small><b>{{ wedding.venue.name }}</b><span>江西 · 景德镇 · 乐平</span></div>
      </div>

      <button v-reveal="{ delay: 180 }" class="ri-map-button pressable" @click="openMap(wedding.venue)">
        <span><small>ROUTE / 29.0072° N · 117.1283° E</small><b>打开地图导航</b></span><i>↗</i>
      </button>

      <div v-reveal="{ delay: 220 }" class="ri-countdown">
        <span>{{ countdown.ended ? 'LOVE.EXE IS RUNNING' : 'COUNTDOWN TO LOVE.EXE' }}</span>
        <b v-if="!countdown.ended">{{ countdown.days }}D&nbsp;&nbsp;{{ countdown.hours }}:{{ countdown.minutes }}:{{ countdown.seconds }}</b>
        <b v-else>THANK YOU FOR BEING HERE</b>
      </div>
      <span class="ri-scroll-hint">SCROLL TO READ THE STORY <i>↓</i></span>
    </header>

    <main>
      <section class="ri-prologue">
        <div v-reveal class="ri-spread-heading ri-spread-heading--night">
          <span>PROLOGUE · PLAYER SELECT</span>
          <h1 class="serif">序章</h1>
          <p>在成为“我们”之前，先认识两个属性相异的玩家。</p>
        </div>

        <div class="ri-player-spread">
          <article v-reveal class="ri-player-card ri-player-card--kevin reveal--image">
            <div class="ri-player-card__photo"><img :src="images.groomPortrait" alt="新郎张凯文单人肖像" loading="lazy" /></div>
            <div class="ri-player-card__copy"><span>PLAYER 01</span><h2>Kevin</h2><p>理性 · 逻辑 · 问题解决</p></div>
          </article>
          <span class="ri-player-link" aria-hidden="true"><i></i><b>SYNC</b><i></i></span>
          <article v-reveal="{ delay: 90 }" class="ri-player-card ri-player-card--huan reveal--image">
            <div class="ri-player-card__photo"><img :src="images.bridePortrait" alt="新娘刘明玥单人肖像" loading="lazy" /></div>
            <div class="ri-player-card__copy"><span>PLAYER 02</span><h2>Huan</h2><p>共情 · 洞察 · 链接</p></div>
          </article>
        </div>

        <div v-reveal class="ri-prologue__statement">
          <span>COMPATIBILITY / 100%</span>
          <p class="serif">属性相异，灵魂同频<br />天赋互补，心意相通</p>
        </div>
      </section>

      <section class="ri-see-you">
        <div v-reveal class="ri-spread-heading ri-spread-heading--paper ri-spread-heading--numbered">
          <span>CHAPTER 1 · I SEE YOU</span>
          <strong>01</strong>
          <h2 class="serif">看见你，<br />也被你看见。</h2>
        </div>

        <figure v-photo-motion class="ri-reeds-fullbleed">
          <img class="cover-image" :src="images.coupleReeds" alt="张凯文与刘明玥在芦苇地牵手的昼夜拼幅" loading="lazy" />
          <span class="ri-reeds-fullbleed__shade"></span>
          <figcaption><small>WHERE SWAYS THE GRAIN</small><b class="serif">沒有一棵樹看到另外一棵樹<br />我們卻在藍調里共鳴</b></figcaption>
        </figure>

        <div class="ri-see-you__spread">
          <figure v-reveal class="ri-see-you__portrait reveal--image">
            <div class="ri-editorial-frame"><img :src="images.coupleOutdoor" alt="张凯文与刘明玥在芦苇地的正面合影" loading="lazy" /></div>
            <figcaption>
              <small>Until I found you, where sways the grain.</small>
              <span>FOUND EACH OTHER · 2026</span>
            </figcaption>
          </figure>
          <blockquote v-reveal="{ delay: 90 }" class="ri-see-you__quote">
            <p class="serif"><span>有些相遇不是突然发生，</span><span>只是我们终于抵达彼此。</span></p>
          </blockquote>
        </div>
      </section>

      <section class="ri-life-with-you">
        <div v-reveal class="ri-spread-heading ri-spread-heading--night ri-spread-heading--numbered">
          <span>CHAPTER 2 · LIFE WITH YOU</span>
          <strong>02</strong>
          <h2 class="serif">与你生活，<br />是日常也是冒险。</h2>
        </div>

        <div class="ri-life-collage">
          <div class="ri-life-manifesto">
            <p v-reveal class="serif">人生主线<br /><b>相互托底</b></p>
            <i aria-hidden="true"></i>
            <p v-reveal="{ delay: 80 }" class="serif">生活支线<br /><b>共享乐趣</b></p>
          </div>
          <figure v-reveal class="ri-life-collage__hero reveal--image"><img :src="images.couplePlayfulWarm" alt="刘明玥与张凯文轻松俏皮的暖色合影" loading="lazy" /><figcaption>PLAYFUL MODE / ALWAYS ON</figcaption></figure>
          <figure v-reveal="{ delay: 70 }" class="ri-life-collage__small ri-life-collage__small--one reveal--image"><img :src="images.couplePlayful" alt="张凯文与刘明玥俏皮互动的合影" loading="lazy" /></figure>
          <figure v-reveal="{ delay: 110 }" class="ri-life-collage__small ri-life-collage__small--two reveal--image"><img :src="images.coupleSeated" alt="张凯文与刘明玥坐在一起的合影" loading="lazy" /></figure>
          <span class="ri-life-collage__index">LIFE<br />WITH<br />YOU</span>
        </div>

        <blockquote v-reveal class="ri-life-quote">
          <span>CO-OP MODE · CONNECTED</span>
          <p class="serif">默契相伴<br />无吵通关生活大小事</p>
          <small>我们没有约定谁迁就谁，只是在每一次选择里，自然地站到同一边。</small>
        </blockquote>

        <div class="ri-life-diptych">
          <figure v-reveal class="reveal--image"><img :src="images.coupleClose" alt="张凯文望向刘明玥的合影" loading="lazy" /><figcaption>LOOK AT YOU</figcaption></figure>
          <figure v-reveal="{ delay: 80 }" class="reveal--image"><img :src="images.coupleIntimate" alt="张凯文与刘明玥亲密依偎的合影" loading="lazy" /><figcaption>STAY WITH YOU</figcaption></figure>
        </div>
      </section>

      <section class="ri-new-life">
        <div v-reveal class="ri-spread-heading ri-spread-heading--paper ri-spread-heading--numbered">
          <span>CHAPTER … · NEW LIFE LOADING</span>
          <strong>∞</strong>
          <h2 class="serif">下一章节，<br />正在载入。</h2>
        </div>

        <figure v-photo-motion class="ri-new-life__back-view">
          <img class="cover-image" :src="images.coupleBackView" alt="张凯文与刘明玥牵手走向芦苇地的背影" loading="lazy" />
          <span class="ri-new-life__shade"></span>
          <figcaption><small>NEW MAP / UNKNOWN</small><b class="serif">与你并肩，<br />前方未知皆是惊喜。</b></figcaption>
        </figure>

        <article v-photo-motion class="ri-join-us">
          <img class="cover-image" :src="images.coupleToast" alt="张凯文与刘明玥举杯邀请朋友参加婚礼" loading="lazy" />
          <span class="ri-join-us__shade"></span>
          <span class="ri-scanlines" aria-hidden="true"></span>
          <div v-reveal class="ri-join-us__copy">
            <span>JOIN US · IT TAKES TWO</span>
            <small>全新双人关卡载入中</small>
            <h2 class="serif">邀请最好的你，<br />共同见证。</h2>
            <button class="ri-join-us__button pressable" @click="router.push('/rsvp')"><span>回应邀请</span><b>/ JOIN</b></button>
          </div>
        </article>
      </section>

      <section class="ri-day">
        <div v-reveal class="ri-heading ri-heading--night">
          <span>JOIN US · ABOUT THE DAY</span>
          <h2 class="serif">关于这一天</h2>
          <p>五个节点，组成我们共同抵达的这一天。</p>
        </div>

        <article v-reveal class="ri-day-card ri-day-card--flow reveal--scale">
          <div class="ri-day-card__head"><span>01</span><small>PROGRAMME</small></div>
          <h3 class="serif">婚礼流程</h3>
          <ol>
            <li v-for="(item, index) in weddingFlow" :key="item"><i>0{{ index + 1 }}</i><span>{{ item }}</span></li>
          </ol>
        </article>
      </section>

      <section class="ri-finale">
        <span class="ri-finale__stars" aria-hidden="true"></span>
        <div v-reveal class="ri-finale__terminal reveal--scale">
          <span>100 PRINT "SEE YOU THERE"</span>
          <h2 class="serif">这一天，<br />期待与你见面。</h2>
          <p>世界没有唯一的通关方式，<br />但我们希望这一段旅程，有你在场。</p>
          <button class="ri-rsvp-button pressable" @click="router.push('/rsvp')"><span>回应邀请</span><b>/ JOIN</b></button>
          <button class="ri-share-button" @click="shareInvitation">分享邀请函 ↗</button>
          <SignatureMark flourish />
          <small>RUNNING LOVE.EXE · TO BE CONTINUED_</small>
        </div>
      </section>

      <section class="ri-city" :class="{ 'is-locked': eggState === 'locked', 'is-loading': eggState === 'loading', 'is-open': eggState === 'open' }">
        <div v-reveal class="ri-city__unlock">
          <span class="ri-city__stars" aria-hidden="true"></span>
          <span class="ri-city__code" aria-hidden="true">BONUS_FILE_04<br />29.0072° N<br />117.1283° E</span>
          <span class="ri-city__orbit" aria-hidden="true"><i></i><i></i><b>+</b></span>

          <div class="ri-city__unlock-copy" aria-live="polite">
            <small>AFTER THE CREDITS · EASTER EGG</small>
            <b v-if="eggState === 'locked'" class="serif">主线故事已经结束，<br />这里还藏着一段旅程。</b>
            <b v-else-if="eggState === 'loading'" class="serif">正在读取隐藏章节…</b>
            <b v-else class="serif">隐藏章节已解锁</b>
            <span>{{ eggState === 'locked' ? '它不会自动出现。' : eggState === 'loading' ? 'LOADING CITY MEMORY' : '继续向下，打开我们的城市记忆。' }}</span>
          </div>

          <div class="ri-city__loader" :class="{ 'is-running': eggState === 'loading', 'is-complete': eggState === 'open' }" aria-hidden="true">
            <i></i><span>00</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>

          <button
            v-if="eggState !== 'open'"
            class="ri-city__unlock-action pressable"
            type="button"
            :disabled="eggState === 'loading'"
            @click="unlockEgg"
          >
            <span>{{ eggState === 'loading' ? '正在解锁' : '解锁片尾彩蛋' }}</span>
            <b>{{ eggState === 'loading' ? '···' : 'PRESS TO LOAD ↘' }}</b>
          </button>
          <span v-else class="ri-city__unlocked"><i></i> BONUS CHAPTER ONLINE <b>↓</b></span>
        </div>

        <Transition name="ri-bonus-reveal">
          <div v-if="eggState === 'open'" class="ri-city__content">
            <div class="ri-city__masthead">
              <span class="ri-city__edition">BONUS 04 · CITY MEMORY</span>
              <div class="ri-heading">
                <span>SIDE QUEST · BEYOND THE WEDDING</span>
                <h2 class="serif">不止婚礼</h2>
              </div>
              <span class="ri-city__seal serif" aria-hidden="true">景<br />德<br />镇</span>
              <figure class="ri-city__hero-photo">
                <img :src="images.imperialKiln" alt="景德镇御窑博物馆的拱形窑砖建筑" loading="lazy" />
                <figcaption>IMPERIAL KILN · JINGDEZHEN</figcaption>
              </figure>
              <figure class="ri-city__peek-photo">
                <img :src="images.taoxichuan" alt="景德镇陶溪川文创街区" loading="lazy" />
                <figcaption>29.2969° N</figcaption>
              </figure>
              <span class="ri-city__coordinates">29° N<br />117° E<br />江西</span>
            </div>

            <div class="ri-city__intro">
              <p class="serif">乐平，是新郎生长的故土。</p>
              <p class="serif">景德镇，是新娘 22 年故地重游后被触动、改写人生轨迹的城市。</p>
              <span>愿借我们的视角，邀你感受这座城市独有的生命力。</span>
            </div>

            <div class="ri-city__route" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>

            <div class="ri-city__picks">
              <article class="ri-recommendation ri-recommendation--bride">
                <div><small>HUAN'S FIELD NOTES</small><b>新娘推荐</b></div>
                <ul><li v-for="(place, index) in brideRecommendations" :key="place"><i>0{{ index + 1 }}</i><span>{{ place }}</span></li></ul>
              </article>
              <article class="ri-recommendation ri-recommendation--groom">
                <div><small>KEVIN'S LOCAL TABLE</small><b>新郎推荐</b></div>
                <span class="ri-recommendation__ticket">LP / FOOD / 01</span>
                <h3 class="serif">乐平地道美食</h3>
                <p>从熟悉的一口开始，尝尝这座小城最真实、最热闹的日常。</p>
              </article>
            </div>

            <button class="ri-city-action pressable" @click="router.push('/travel')">
              <span><small>CITY GUIDE / SIDE QUEST</small><b class="serif">打开我们的瓷都漫游地图</b></span><i>↗</i>
            </button>
          </div>
        </Transition>
      </section>
    </main>
  </div>
</template>

<style src="../styles/invite-retro.css"></style>
