import { readonly, ref } from 'vue'

const message = ref('')
const visible = ref(false)
let timer: number | undefined

export function useToast() {
  const show = (nextMessage: string, duration = 2400) => {
    window.clearTimeout(timer)
    message.value = nextMessage
    visible.value = true
    timer = window.setTimeout(() => {
      visible.value = false
    }, duration)
  }

  return {
    message: readonly(message),
    visible: readonly(visible),
    show,
  }
}
