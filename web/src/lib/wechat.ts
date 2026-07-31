const SDK_URL = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
let sdkPromise: Promise<void> | undefined

interface WechatConfig {
  appId: string
  timestamp: number
  nonceStr: string
  signature: string
}

function isWechat() {
  return /MicroMessenger/i.test(navigator.userAgent)
}

function loadSdk() {
  if (window.wx) return Promise.resolve()
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('微信 JS-SDK 加载失败'))
    document.head.appendChild(script)
  })
  return sdkPromise
}

export async function configureWechatShare(options: {
  title: string
  description: string
  imageUrl: string
  link: string
}) {
  if (!isWechat()) return

  try {
    await loadSdk()
    const signedUrl = window.location.href.split('#')[0]
    const response = await fetch(`/api/wechat/jssdk?url=${encodeURIComponent(signedUrl)}`)
    if (!response.ok) return
    const config = (await response.json()) as WechatConfig

    window.wx?.config({
      debug: false,
      ...config,
      jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
    })
    window.wx?.ready(() => {
      const shareData = {
        title: options.title,
        desc: options.description,
        link: options.link,
        imgUrl: options.imageUrl,
      }
      window.wx?.updateAppMessageShareData(shareData)
      window.wx?.updateTimelineShareData({
        title: options.title,
        link: options.link,
        imgUrl: options.imageUrl,
      })
    })
  } catch {
    // Basic browser sharing remains available when WeChat enhancement is unavailable.
  }
}
