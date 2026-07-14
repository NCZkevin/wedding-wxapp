const wedding = {
  couple: {
    groom: '张凯文',
    bride: '刘明玥',
    display: '张凯文 × 刘明玥',
  },
  date: '2026-09-12T16:28:00+08:00',
  dateDisplay: '2026.09.12',
  venue: {
    name: '山水国际酒店',
    address: '山水国际酒店',
    // 确认酒店具体地址后填写，经纬度存在时会自动启用微信地图导航。
    latitude: null,
    longitude: null,
  },
  quote: '在光抵达之前，我们先抵达彼此',
  dressCode: ['黑', '深蓝', '银白'],
  schedule: [
    { time: '14:00', title: '嘉宾签到', detail: '领取席位卡，留下一张抵达照片' },
    { time: '15:00', title: '迎宾拍照', detail: '在蓝幕装置前与我们共同入镜' },
    { time: '16:28', title: '婚礼仪式', detail: '请提前入席，见证故事正式开场' },
    { time: '18:08', title: '晚宴', detail: '举杯、用餐，也欢迎随时记录此刻' },
    { time: '20:30', title: 'After Party', detail: '音乐响起之后，把夜晚交给快乐' },
  ],
}

module.exports = wedding
