<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const hidden = computed(() => route.name === 'rsvp' || route.name === 'admin')

const items = [
  { to: '/', label: '邀请', index: 'I' },
  { to: '/schedule', label: '流程', index: 'II' },
  { to: '/interact', label: '祝福', index: 'III' },
]
</script>

<template>
  <Transition name="nav">
    <nav v-if="!hidden" class="floating-nav" aria-label="婚礼邀请章节">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="floating-nav__item"
        :class="{ 'is-active': route.path === item.to }"
      >
        <span class="floating-nav__index">{{ item.index }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
      <RouterLink class="floating-nav__rsvp" to="/rsvp">回执</RouterLink>
    </nav>
  </Transition>
</template>
