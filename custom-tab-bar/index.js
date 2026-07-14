Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/invite/index', text: '邀请', mark: 'star' },
      { pagePath: '/pages/schedule/index', text: '流程', mark: 'line' },
      { pagePath: '/pages/interact/index', text: '互动', mark: 'circle' },
      { pagePath: '/pages/rsvp/index', text: 'RSVP', mark: 'person' },
    ],
  },

  methods: {
    switchTab(event) {
      const { path, index } = event.currentTarget.dataset
      if (Number(index) === this.data.selected) return

      wx.switchTab({ url: path })
    },
  },
})
