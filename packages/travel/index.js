const wedding = require('../../config/wedding')

Page({
  data: {
    wedding,
    spots: wedding.travelSpots,
  },

  openSpot(event) {
    const index = Number(event.currentTarget.dataset.index)
    const spot = this.data.spots[index]
    if (!spot) return

    wx.openLocation({
      latitude: spot.latitude,
      longitude: spot.longitude,
      name: spot.name,
      address: spot.address,
      scale: 15,
    })
  },

  onShareAppMessage() {
    return {
      title: `婚礼之外，顺游瓷都｜${wedding.couple.display}`,
      path: '/packages/travel/index',
      imageUrl: '/packages/travel/images/imperial-kiln.jpg',
    }
  },
})
