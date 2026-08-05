<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import trackUrl from '../../../assets/audio/1.mp3'

const PAUSED_KEY = 'wedding-music-paused'
const TRACK_TITLE = '这是我一生中最勇敢的瞬间'

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const isReady = ref(false)
const isUnavailable = ref(false)
const showDetails = ref(true)
const userPaused = ref(readPausedPreference())
let detailsTimer: number | undefined

const statusText = computed(() => {
  if (isUnavailable.value) return 'MUSIC UNAVAILABLE'
  if (isPlaying.value) return 'NOW PLAYING'
  if (!isReady.value) return 'WEDDING SONG'
  return 'TAP TO PLAY'
})

function readPausedPreference() {
  try {
    return window.localStorage.getItem(PAUSED_KEY) === '1'
  } catch {
    return false
  }
}

function savePausedPreference(paused: boolean) {
  try {
    if (paused) window.localStorage.setItem(PAUSED_KEY, '1')
    else window.localStorage.removeItem(PAUSED_KEY)
  } catch {
    // Playback still works when storage is unavailable.
  }
}

function scheduleDetailsCollapse(delay = 4200) {
  window.clearTimeout(detailsTimer)
  detailsTimer = window.setTimeout(() => {
    showDetails.value = false
  }, delay)
}

async function playTrack(fromUser = false) {
  const player = audio.value
  if (!player || isUnavailable.value || (userPaused.value && !fromUser)) return

  if (fromUser) {
    userPaused.value = false
    savePausedPreference(false)
  }

  try {
    await player.play()
  } catch {
    // Browsers may reject playback until a real gesture; the control remains available.
    isPlaying.value = false
  }
}

function pauseTrack() {
  const player = audio.value
  if (!player) return

  userPaused.value = true
  savePausedPreference(true)
  player.pause()
  showDetails.value = true
  scheduleDetailsCollapse(3000)
}

function togglePlayback() {
  showDetails.value = true
  if (isPlaying.value) pauseTrack()
  else void playTrack(true)
}

function handleEntrance() {
  void playTrack()
}

function handleWechatReady() {
  void playTrack()
}

function handlePlaying() {
  isPlaying.value = true
  isReady.value = true
  showDetails.value = true
  scheduleDetailsCollapse()
}

function handlePause() {
  isPlaying.value = false
}

function handleError() {
  isPlaying.value = false
  isUnavailable.value = true
  showDetails.value = true
  window.clearTimeout(detailsTimer)
}

onMounted(() => {
  if (audio.value) audio.value.volume = 0.55
  window.addEventListener('wedding:music-request', handleEntrance)
  document.addEventListener('WeixinJSBridgeReady', handleWechatReady)
  scheduleDetailsCollapse(5200)

  if ('WeixinJSBridge' in window) void playTrack()
})

onBeforeUnmount(() => {
  window.removeEventListener('wedding:music-request', handleEntrance)
  document.removeEventListener('WeixinJSBridgeReady', handleWechatReady)
  window.clearTimeout(detailsTimer)
  audio.value?.pause()
})
</script>

<template>
  <div
    class="music-control"
    :class="{ 'is-playing': isPlaying, 'is-expanded': showDetails, 'is-unavailable': isUnavailable }"
  >
    <audio
      ref="audio"
      :src="trackUrl"
      loop
      playsinline
      preload="auto"
      @canplay="isReady = true"
      @playing="handlePlaying"
      @pause="handlePause"
      @error="handleError"
    ></audio>
    <button
      type="button"
      :aria-label="isPlaying ? `暂停背景音乐《${TRACK_TITLE}》` : `播放背景音乐《${TRACK_TITLE}》`"
      :aria-pressed="isPlaying"
      :disabled="isUnavailable"
      @click="togglePlayback"
    >
      <span class="music-control__copy" aria-hidden="true">
        <small>{{ statusText }}</small>
        <strong>{{ TRACK_TITLE }}</strong>
      </span>
      <span class="music-control__disc" aria-hidden="true">
        <i class="music-control__ring"></i>
        <i class="music-control__center"></i>
        <span class="music-control__bars"><i></i><i></i><i></i></span>
      </span>
    </button>
  </div>
</template>
