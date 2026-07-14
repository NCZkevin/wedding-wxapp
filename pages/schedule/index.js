const wedding = require('../../config/wedding')

Page({
  data: {
    wedding,
    activeIndex: -1,
    eventState: '婚礼日程',
    activities: [
      { index: '01', title: '蓝幕合影', copy: '在迎宾装置前，留下属于今晚的一帧', action: '去互动' },
      { index: '02', title: '留声祝福', copy: '把想说的话录下来，交给未来的我们', action: '去互动' },
      { index: '03', title: '桌号查询', copy: '输入姓名，快速找到自己的座位', action: '去互动' },
      { index: '04', title: '照片共创', copy: '上传你眼中的婚礼，共同完成一本相册', action: '去互动' },
    ],
  },

  onShow() {
    if (this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
      this.getTabBar().refreshRsvp()
    }
    this.resolveActiveStep()
  },

  resolveActiveStep() {
    const now = new Date()
    const weddingDate = new Date(wedding.date)
    const sameDay = now.getFullYear() === weddingDate.getFullYear()
      && now.getMonth() === weddingDate.getMonth()
      && now.getDate() === weddingDate.getDate()

    if (!sameDay) {
      this.setData({ activeIndex: -1, eventState: now < weddingDate ? '等待开场' : '珍藏回忆' })
      return
    }

    const minutes = now.getHours() * 60 + now.getMinutes()
    let activeIndex = 0
    wedding.schedule.forEach((item, index) => {
      const [hour, minute] = item.time.split(':').map(Number)
      if (minutes >= hour * 60 + minute) activeIndex = index
    })
    this.setData({ activeIndex, eventState: '正在发生' })
  },

  addToCalendar() {
    const start = Math.floor(new Date(wedding.date).getTime() / 1000)
    const copySchedule = () => wx.setClipboardData({
      data: `${wedding.dateDisplay} 16:28｜${wedding.venue.name}`,
      success: () => wx.showToast({ title: '日程已复制', icon: 'none' }),
    })
    if (wx.addPhoneCalendar) {
      wx.addPhoneCalendar({
        title: `${wedding.couple.display}的婚礼`,
        startTime: start,
        endTime: start + 6 * 60 * 60,
        description: `婚礼地点：${wedding.venue.name}`,
        location: wedding.venue.address,
        success: () => wx.showToast({ title: '已加入日历', icon: 'success' }),
        fail: copySchedule,
      })
      return
    }
    copySchedule()
  },

  openInteract() {
    wx.switchTab({ url: '/pages/interact/index' })
  },

  onShareAppMessage() {
    return {
      title: `婚礼流程｜${wedding.couple.display}`,
      path: '/pages/schedule/index',
    }
  },
})
