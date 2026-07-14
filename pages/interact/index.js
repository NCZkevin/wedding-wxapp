const wedding = require('../../config/wedding')

Page({
  data: {
    wedding,
    photos: [],
    blessingText: '',
    recording: false,
    recordingDuration: 0,
    recordingDurationDisplay: '00',
    recordingPath: '',
    guestName: '',
    queryResult: '',
    blessingSubmitted: false,
  },

  onLoad() {
    this.recorderManager = wx.getRecorderManager()
    this.audio = wx.createInnerAudioContext()

    this.recorderManager.onStop((result) => {
      clearInterval(this.recordingTimer)
      this.setData({
        recording: false,
        recordingPath: result.tempFilePath,
      })
    })

    this.recorderManager.onError(() => {
      clearInterval(this.recordingTimer)
      this.setData({ recording: false })
      wx.showToast({ title: '录音失败，请检查麦克风权限', icon: 'none' })
    })
  },

  onShow() {
    if (this.getTabBar()) this.getTabBar().setData({ selected: 2 })
  },

  onUnload() {
    clearInterval(this.recordingTimer)
    if (this.audio) this.audio.destroy()
  },

  choosePhotos() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (result) => {
        const next = result.tempFiles.map((file) => file.tempFilePath)
        this.setData({ photos: [...this.data.photos, ...next].slice(0, 9) })
      },
    })
  },

  previewPhoto(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.src,
      urls: this.data.photos,
    })
  },

  removePhoto(event) {
    const index = Number(event.currentTarget.dataset.index)
    const photos = this.data.photos.filter((_, itemIndex) => itemIndex !== index)
    this.setData({ photos })
  },

  inputBlessing(event) {
    this.setData({ blessingText: event.detail.value, blessingSubmitted: false })
  },

  startRecording() {
    if (this.data.recording) return
    this.setData({ recording: true, recordingDuration: 0, recordingDurationDisplay: '00', recordingPath: '', blessingSubmitted: false })
    this.recorderManager.start({ duration: 60000, format: 'mp3' })
    this.recordingTimer = setInterval(() => {
      const duration = Math.min(60, this.data.recordingDuration + 1)
      this.setData({
        recordingDuration: duration,
        recordingDurationDisplay: String(duration).padStart(2, '0'),
      })
    }, 1000)
  },

  stopRecording() {
    if (!this.data.recording) return
    this.recorderManager.stop()
  },

  playRecording() {
    if (!this.data.recordingPath) return
    this.audio.src = this.data.recordingPath
    this.audio.play()
  },

  submitBlessing() {
    const text = this.data.blessingText.trim()
    if (!text && !this.data.recordingPath) {
      wx.showToast({ title: '写一句话或录一段声音吧', icon: 'none' })
      return
    }

    const blessings = wx.getStorageSync('wedding-blessings') || []
    blessings.push({ text, hasAudio: Boolean(this.data.recordingPath), createdAt: Date.now() })
    wx.setStorageSync('wedding-blessings', blessings)
    this.setData({ blessingSubmitted: true })
    wx.showToast({ title: '祝福已收下', icon: 'success' })
  },

  inputGuestName(event) {
    this.setData({ guestName: event.detail.value, queryResult: '' })
  },

  querySeat() {
    if (!this.data.guestName.trim()) {
      wx.showToast({ title: '请先输入姓名', icon: 'none' })
      return
    }
    this.setData({ queryResult: '座位表将在婚礼前更新，我们会第一时间通知你。' })
  },

  onShareAppMessage() {
    return {
      title: `一起记录我们的婚礼｜${wedding.couple.display}`,
      path: '/pages/interact/index',
    }
  },
})
