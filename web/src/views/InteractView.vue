<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { images } from '@/data/wedding'
import { compressImage, getOrCreateClientId } from '@/lib/browser'
import { submitBlessing } from '@/lib/api'
import { useToast } from '@/composables/useToast'

interface SelectedPhoto {
  file: File
  preview: string
}

const toast = useToast()
const photos = ref<SelectedPhoto[]>([])
const name = ref('')
const message = ref('')
const submitting = ref(false)
const submitted = ref(false)

async function selectPhotos(event: Event) {
  const input = event.target as HTMLInputElement
  const remaining = 6 - photos.value.length
  const selected = Array.from(input.files || []).slice(0, remaining)

  for (const file of selected) {
    try {
      const compressed = await compressImage(file)
      photos.value.push({ file: compressed, preview: URL.createObjectURL(compressed) })
    } catch {
      toast.show(`无法读取图片：${file.name}`)
    }
  }
  input.value = ''
}

function removePhoto(index: number) {
  const [removed] = photos.value.splice(index, 1)
  if (removed) URL.revokeObjectURL(removed.preview)
}

async function submit() {
  if (!message.value.trim() && photos.value.length === 0) {
    toast.show('写一句话或选择一张照片吧')
    return
  }

  const form = new FormData()
  form.append('clientId', getOrCreateClientId('wedding-blessing-client-id'))
  form.append('name', name.value.trim())
  form.append('message', message.value.trim())
  photos.value.forEach(({ file }) => form.append('photos', file))

  submitting.value = true
  try {
    await submitBlessing(form)
    submitted.value = true
    toast.show('祝福已经收下')
  } catch (error) {
    toast.show(error instanceof Error ? error.message : '提交失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  photos.value.forEach(({ preview }) => URL.revokeObjectURL(preview))
})
</script>

<template>
  <div class="page-shell">
    <header class="sub-hero interact-hero">
      <img class="cover-image" :src="images.welcomeInstallation" alt="婚礼迎宾艺术装置" />
      <div class="sub-hero__shade"></div>
      <div class="gallery-frame gallery-frame--one"></div>
      <div class="gallery-frame gallery-frame--two"></div>
      <div class="sub-hero__copy">
        <span class="eyebrow">GUEST PARTICIPATION</span>
        <h1 class="interact-title serif">你不只是宾客<br />也是故事的一部分</h1>
        <p>上传一帧、留下一句话，让记忆拥有更多视角。</p>
      </div>
    </header>

    <section class="section photo-section light-chapter">
      <div class="chapter-row"><span class="chapter-index">01 · PHOTO</span><span class="eyebrow">CO-CREATE</span></div>
      <h2 class="section-heading">共同完成一本相册</h2>
      <p class="section-copy">你看到的细节、笑声和光，会在这里汇成属于所有人的婚礼画册。</p>

      <div v-if="photos.length" class="photo-gallery">
        <figure v-for="(photo, index) in photos" :key="photo.preview" class="photo-item">
          <img :src="photo.preview" alt="待上传的婚礼照片" />
          <figcaption>0{{ index + 1 }}</figcaption>
          <button aria-label="移除照片" @click="removePhoto(index)">×</button>
        </figure>
        <label v-if="photos.length < 6" class="photo-add pressable">
          <span>＋</span><small>继续添加</small>
          <input type="file" accept="image/*" multiple @change="selectPhotos" />
        </label>
      </div>
      <label v-else class="upload-stage pressable">
        <span class="upload-orbit upload-orbit--one"></span>
        <span class="upload-orbit upload-orbit--two"></span>
        <b>＋</b>
        <strong class="serif">上传你眼中的此刻</strong>
        <small>从相册选择，或直接拍摄 · 最多 6 张</small>
        <input type="file" accept="image/*" multiple @change="selectPhotos" />
      </label>
    </section>

    <section class="section blessing-section">
      <div class="chapter-row"><span class="chapter-index">02 · MESSAGE</span><span class="eyebrow">A NOTE FOR US</span></div>
      <h2 class="section-heading">把一句话留给未来</h2>
      <div class="blessing-fields">
        <label>
          <span class="field-label">你的名字（选填）</span>
          <input v-model="name" maxlength="30" placeholder="让我们知道祝福来自谁" />
        </label>
        <label>
          <span class="field-label">想对我们说</span>
          <textarea v-model="message" maxlength="300" placeholder="想对我们说些什么……"></textarea>
          <small>{{ message.length }} / 300</small>
        </label>
      </div>
      <p class="privacy-line">照片与文字仅用于我们的婚礼纪念，不会公开展示。</p>
      <button class="ivory-button pressable" :disabled="submitting || submitted" @click="submit">
        {{ submitting ? '正在送达…' : submitted ? '祝福已收下 ✓' : '提交祝福' }}
      </button>
    </section>
  </div>
</template>
