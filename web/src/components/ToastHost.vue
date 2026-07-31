<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const toast = useToast()
</script>

<template>
  <Transition name="toast">
    <div v-if="toast.visible.value" class="toast-host" role="status">
      {{ toast.message.value }}
    </div>
  </Transition>
</template>
