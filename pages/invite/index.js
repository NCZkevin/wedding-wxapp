const wedding = require('../../config/wedding')

const DAY = 24 * 60 * 60 * 1000

Page({
  data: {
    wedding,
    countdown: { days: '000', hours: '00', minutes: '00', seconds: '00' },
    musicEnabled: false,
  },

  onLoad() {
    this.updateCountdown()
    this.countdownTimer = setInterval(() => this.updateCountdown(), 1000)
  },

  onShow() {
    if (this.getTabBar()) this.getTabBar().setData({ selected: 0 })
    this.setData({ musicEnabled: getApp().globalData.musicEnabled })
  },

  onUnload() {
    clearInterval(this.countdownTimer)
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
    wx.switchTab({ url: '/pages/rsvp/index' })
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
    wx.showToast({
      title: enabled ? '背景音乐将在上线前接入' : '已关闭背景音乐',
      icon: 'none',
    })
  },

  onShareAppMessage() {
    return {
      title: `${wedding.couple.display}｜${wedding.dateDisplay}`,
      path: '/pages/invite/index',
      imageUrl: '/assets/images/hero-sea.jpg',
    }
  },
})
