<script setup lang="ts">
withDefaults(defineProps<{ flourish?: boolean }>(), {
  flourish: false,
})
</script>

<template>
  <span class="signature-mark" :class="{ 'signature-mark--flourished': flourish }" aria-label="Kevin and Huan">
    <span>Kevin</span><b aria-hidden="true">&amp;</b><span>Huan</span>
  </span>
</template>
