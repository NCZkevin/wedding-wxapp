const wedding = require('../../config/wedding')

Page({
  data: {
    wedding,
    activities: [
      { index: '01', title: '蓝幕合影', copy: '在迎宾装置前，留下属于今晚的一帧', action: '去互动' },
      { index: '02', title: '留声祝福', copy: '把想说的话录下来，交给未来的我们', action: '去互动' },
      { index: '03', title: '桌号查询', copy: '输入姓名，快速找到自己的座位', action: '去互动' },
      { index: '04', title: '照片共创', copy: '上传你眼中的婚礼，共同完成一本相册', action: '去互动' },
    ],
  },

  onShow() {
    if (this.getTabBar()) this.getTabBar().setData({ selected: 1 })
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
