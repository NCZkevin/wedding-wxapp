const wedding = require('../../config/wedding')

const emptyForm = () => ({
  name: '',
  phone: '',
  attendance: 'yes',
  guestCount: 1,
  diet: '',
  message: '',
})

Page({
  data: {
    wedding,
    form: emptyForm(),
    countOptions: [1, 2, 3, 4, 5, 6],
    submitted: false,
    step: 1,
  },

  onLoad() {
    const saved = wx.getStorageSync('wedding-rsvp')
    if (saved && saved.name) {
      this.setData({ form: saved, submitted: true })
    }
  },

  chooseAttendance(event) {
    this.setData({ 'form.attendance': event.currentTarget.dataset.value })
  },

  nextStep() {
    this.setData({ step: 2 })
    wx.pageScrollTo({ scrollTop: 0, duration: 260 })
  },

  previousStep() {
    this.setData({ step: 1 })
    wx.pageScrollTo({ scrollTop: 0, duration: 260 })
  },

  inputField(event) {
    const key = `form.${event.currentTarget.dataset.field}`
    this.setData({ [key]: event.detail.value })
  },

  chooseCount(event) {
    const index = Number(event.detail.value)
    this.setData({ 'form.guestCount': this.data.countOptions[index] })
  },

  submitRsvp() {
    const form = {
      ...this.data.form,
      name: this.data.form.name.trim(),
      phone: this.data.form.phone.trim(),
      diet: this.data.form.diet.trim(),
      message: this.data.form.message.trim(),
    }

    if (!form.name) {
      wx.showToast({ title: '请填写姓名', icon: 'none' })
      return
    }

    if (!/^1\d{10}$/.test(form.phone)) {
      wx.showToast({ title: '请填写正确的手机号码', icon: 'none' })
      return
    }

    wx.setStorageSync('wedding-rsvp', { ...form, submittedAt: Date.now() })
    this.setData({ form, submitted: true })
    wx.pageScrollTo({ scrollTop: 0, duration: 300 })
    wx.showToast({ title: '回复已保存', icon: 'success' })
  },

  editRsvp() {
    this.setData({ submitted: false, step: 2 })
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
      return
    }
    this.goHome()
  },

  goHome() {
    wx.switchTab({ url: '/pages/invite/index' })
  },

  onShareAppMessage() {
    return {
      title: `${wedding.couple.display}邀请你参加婚礼`,
      path: '/pages/invite/index',
      imageUrl: '/assets/images/hero-sea.jpg',
    }
  },
})
