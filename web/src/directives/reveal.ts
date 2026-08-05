import type { Directive } from 'vue'

type RevealOptions = {
  delay?: number
}

let observer: IntersectionObserver | undefined
const completionTimers = new WeakMap<HTMLElement, number>()

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        element.classList.add('is-revealed')
        observer?.unobserve(element)
        const delay = Number(element.dataset.revealDelay || 0)
        const timer = window.setTimeout(() => {
          element.classList.remove('reveal')
          completionTimers.delete(element)
        }, delay + 900)
        completionTimers.set(element, timer)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )
  return observer
}

export const reveal: Directive<HTMLElement, RevealOptions | undefined> = {
  mounted(element, binding) {
    const delay = Math.max(0, binding.value?.delay ?? 0)
    element.classList.add('reveal')
    element.style.setProperty('--reveal-delay', `${delay}ms`)
    element.dataset.revealDelay = String(delay)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      element.classList.add('is-revealed')
      return
    }

    getObserver().observe(element)
  },
  unmounted(element) {
    observer?.unobserve(element)
    const timer = completionTimers.get(element)
    if (timer) window.clearTimeout(timer)
    completionTimers.delete(element)
  },
}

let photoObserver: IntersectionObserver | undefined

function getPhotoObserver() {
  photoObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-photo-active', entry.isIntersecting)
      }
    },
    { rootMargin: '10% 0px', threshold: 0.08 },
  )
  return photoObserver
}

export const photoMotion: Directive<HTMLElement> = {
  mounted(element) {
    element.classList.add('photo-motion')
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }
    getPhotoObserver().observe(element)
  },
  unmounted(element) {
    photoObserver?.unobserve(element)
  },
}
