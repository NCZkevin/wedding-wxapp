Component({
  data: {
    selected: 0,
    hasRsvp: false,
    rsvpLabel: '确认出席',
    rsvpMeta: 'RSVP',
    list: [
      { pagePath: '/pages/invite/index', text: '邀请', mark: 'star' },
      { pagePath: '/pages/schedule/index', text: '流程', mark: 'line' },
      { pagePath: '/pages/interact/index', text: '互动', mark: 'circle' },
    ],
  },

  lifetimes: {
    attached() {
      this.refreshRsvp()
    },
  },

  methods: {
    switchTab(event) {
      const { path, index } = event.currentTarget.dataset
      if (Number(index) === this.data.selected) return

      wx.switchTab({ url: path })
    },

    openRsvp() {
      wx.navigateTo({ url: '/pages/rsvp/index' })
    },

    refreshRsvp() {
      const saved = wx.getStorageSync('wedding-rsvp')
      const hasRsvp = Boolean(saved && saved.name)
      let rsvpMeta = 'RSVP'
      if (hasRsvp && saved.attendance === 'yes') rsvpMeta = `${saved.guestCount || 1} 人`
      if (hasRsvp && saved.attendance === 'no') rsvpMeta = '遗憾缺席'
      if (hasRsvp && saved.attendance === 'unsure') rsvpMeta = '待确定'
      this.setData({
        hasRsvp,
        rsvpLabel: hasRsvp ? '已回复' : '确认出席',
        rsvpMeta,
      })
    },
  },
})
