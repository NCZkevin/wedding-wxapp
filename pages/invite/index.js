const wedding = require('../../config/wedding')

const DAY = 24 * 60 * 60 * 1000

Page({
  data: {
    wedding,
    countdown: { days: '000', hours: '00', minutes: '00', seconds: '00' },
    musicEnabled: false,
    musicAvailable: false,
    opening: true,
    guestName: '',
    heroOffset: 0,
  },

  onLoad(options = {}) {
    const guestName = options.guest ? decodeURIComponent(options.guest) : ''
    this.setData({ guestName })
    this.updateCountdown()
    this.countdownTimer = setInterval(() => this.updateCountdown(), 1000)
    this.openingTimer = setTimeout(() => this.setData({ opening: false }), 2100)
  },

  onShow() {
    if (this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
      this.getTabBar().refreshRsvp()
    }
    this.setData({ musicEnabled: getApp().globalData.musicEnabled })
  },

  onUnload() {
    clearInterval(this.countdownTimer)
    clearTimeout(this.openingTimer)
  },

  onPageScroll(event) {
    const next = Math.min(36, Math.round(event.scrollTop * 0.045))
    if (next !== this.data.heroOffset) this.setData({ heroOffset: next })
  },

  updateCountdown() {
    const distance = Math.max(0, new Date(wedding.date).getTime() - Date.now())
    const days = Math.floor(distance / DAY)
    const hours = Math.floor((distance % DAY) / (60 * 60 * 1000))
    const minutes = Math.floor((distance % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((distance % (60 * 1000)) / 1000)

    this.setData({
      countdown: {
        days: String(days).padStart(3, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      },
    })
  },

  openSchedule() {
    wx.switchTab({ url: '/pages/schedule/index' })
  },

  openInteract() {
    wx.switchTab({ url: '/pages/interact/index' })
  },

  openRsvp() {
    wx.navigateTo({ url: '/pages/rsvp/index' })
  },

  skipOpening() {
    clearTimeout(this.openingTimer)
    this.setData({ opening: false })
  },

  openVenue() {
    const { latitude, longitude, name, address } = wedding.venue
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      wx.openLocation({ latitude, longitude, name, address, scale: 16 })
      return
    }

    wx.setClipboardData({
      data: address,
      success: () => wx.showToast({ title: '酒店名称已复制', icon: 'none' }),
    })
  },

  toggleMusic() {
    const enabled = !this.data.musicEnabled
    getApp().globalData.musicEnabled = enabled
    this.setData({ musicEnabled: enabled })
  },

  onShareAppMessage() {
    return {
      title: `${wedding.couple.display}｜${wedding.dateDisplay}`,
      path: '/pages/invite/index',
      imageUrl: '/assets/images/hero-sea.jpg',
    }
  },
})
