<script setup lang="ts">
import { wedding } from '@/data/wedding'
import { openMap } from '@/lib/browser'

const localRestaurants = ['好口福', '张星铁板烧', '三中小吃', '欧记大排档']
const localDishes = ['乐平炒粉', '萝卜饺子', '油条包麻糍', '铁板烧']
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

      <section v-reveal class="food-guide reveal--scale">
        <span class="food-guide__grid" aria-hidden="true"></span>
        <span class="food-guide__glow" aria-hidden="true"></span>
        <div class="food-guide__topline">
          <span>LOCAL TASTE · LEPING</span>
          <span>04 PLACES</span>
        </div>
        <div class="food-guide__intro">
          <span class="food-guide__eyebrow"><i></i> 婚礼之外的本地菜单</span>
          <h2 class="serif">乐平味道</h2>
          <p>如果还留有一点胃口，不妨从这些熟悉的小店与小吃里，尝一尝乐平的日常。</p>
        </div>
        <ol class="food-guide__shops" aria-label="乐平本地美食店铺推荐">
          <li v-for="(restaurant, index) in localRestaurants" :key="restaurant">
            <small class="serif">0{{ index + 1 }}</small>
            <b class="serif">{{ restaurant }}</b>
          </li>
        </ol>
        <div class="food-guide__dishes">
          <span class="food-guide__dishes-title">RECOMMENDED BITES · 推荐品尝</span>
          <div>
            <span v-for="dish in localDishes" :key="dish"><i></i>{{ dish }}</span>
          </div>
        </div>
        <p class="food-guide__contact"><i></i><span>更多美食请咨询 Kevin</span></p>
      </section>
    </section>
  </div>
</template>
