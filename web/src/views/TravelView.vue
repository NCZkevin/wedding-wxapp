<script setup lang="ts">
import { wedding } from '@/data/wedding'
import { openMap } from '@/lib/browser'
</script>

<template>
  <div class="page-shell travel-page">
    <header class="travel-hero">
      <div class="travel-glow"></div>
      <div class="travel-grid"></div>
      <div v-reveal class="travel-hero__copy">
        <span class="eyebrow">A DAY IN JINGDEZHEN</span>
        <h1 class="serif">婚礼之外<small>顺游瓷都</small></h1>
        <p>如果时间刚好，也想邀请你沿着窑火留下的光，看看我们举办婚礼的这片土地。</p>
      </div>
      <div v-reveal="{ delay: 100 }" class="origin-card reveal--scale">
        <span class="origin-light"></span>
        <div>
          <small>ROUTE STARTS HERE</small>
          <h2 class="serif">{{ wedding.venue.name }}</h2>
          <p>{{ wedding.venue.address }}</p>
        </div>
        <span class="origin-mark"><i></i>起点</span>
      </div>
    </header>

    <section class="spots-section light-chapter">
      <div v-reveal class="spots-heading">
        <span class="chapter-index">04 PLACES · ONE CITY</span>
        <h2 class="section-heading">我们的私心推荐</h2>
        <p class="section-copy">距离与车程从婚礼酒店出发估算，周末和节假日请预留更多时间。</p>
      </div>
      <div class="spot-list">
        <article v-for="(spot, index) in wedding.travelSpots" :key="spot.id" v-reveal class="spot-card reveal--scale">
          <button v-photo-motion class="spot-visual pressable" @click="openMap(spot)">
            <img class="cover-image" :src="spot.image" :alt="spot.name" loading="lazy" />
            <span class="spot-shade"></span>
            <span class="spot-index serif">0{{ index + 1 }}</span>
            <span class="spot-time">{{ spot.bestTime }}</span>
          </button>
          <div class="spot-content">
            <span class="spot-label">{{ spot.label }}</span>
            <h3 class="spot-name serif">{{ spot.name }}</h3>
            <p>{{ spot.description }}</p>
            <div class="spot-meta">
              <span><small>DISTANCE</small><b>{{ spot.distance }}</b></span>
              <span><small>BY CAR</small><b>{{ spot.driveTime }}</b></span>
            </div>
            <button class="spot-action pressable" @click="openMap(spot)"><span>{{ spot.visitTime }}</span><b>地图导航 ↗</b></button>
          </div>
        </article>
      </div>
      <div v-reveal class="travel-note">
        <span></span>
        <h2 class="serif">慢一点，才看得见瓷的光</h2>
        <p>以上为常规路况下的参考距离。景点开放时间、预约方式及实际路线，请在出发前通过地图或官方渠道确认。</p>
      </div>
    </section>
  </div>
</template>
