<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import FloatingNavigation from '@/components/FloatingNavigation.vue'
import ToastHost from '@/components/ToastHost.vue'
import { images, wedding } from '@/data/wedding'
import { configureWechatShare } from '@/lib/wechat'

const route = useRoute()

const updateShare = () => {
  const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
  void configureWechatShare({
    title: `${wedding.couple.display}｜婚礼邀请`,
    description: `${wedding.dateDisplay} · ${wedding.venue.name}`,
    imageUrl: new URL(images.heroSea, window.location.origin).href,
    link: `${siteUrl}/`,
  })
}

onMounted(updateShare)
watch(() => route.fullPath, updateShare)
</script>

<template>
  <div class="site-frame">
    <div class="ambient ambient--left"></div>
    <div class="ambient ambient--right"></div>
    <main class="mobile-canvas">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
      <FloatingNavigation />
      <ToastHost />
    </main>
  </div>
</template>
