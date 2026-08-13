import heroSea from '../../../assets/images/hero-sea.jpg'
import stageBackdrop from '../../../assets/images/stage-backdrop.jpg'
import welcomeInstallation from '../../../assets/images/welcome-installation.jpg'
import handoverStage from '../../../assets/images/handover-stage.jpg'
import floralSculpture from '../../../assets/images/floral-sculpture.jpg'
import coupleOutdoor from '../../../assets/images/1.jpg'
import couplePlayful from '../../../assets/images/2.jpg'
import coupleClose from '../../../assets/images/4.jpg'
import coupleToast from '../../../assets/images/5.jpg'
import coupleReeds from '../../../assets/images/7.jpg'
import groomPortrait from '../../../assets/images/8.jpg'
import bridePortrait from '../../../assets/images/9.jpg'
import couplePlayfulWarm from '../../../assets/images/10.jpg'
import coupleSeated from '../../../assets/images/11.jpg'
import coupleIntimate from '../../../assets/images/12.jpg'
import coupleBackView from '../../../assets/images/13.jpg'
import beginScreen from '../../../assets/images/begin.png'
import ceramicsMuseum from '../../../packages/travel/images/ceramics-museum.jpg'
import imperialKiln from '../../../packages/travel/images/imperial-kiln.jpg'
import taoxichuan from '../../../packages/travel/images/taoxichuan.jpg'
import sanbao from '../../../packages/travel/images/sanbao.jpg'

export const images = {
  heroSea,
  stageBackdrop,
  welcomeInstallation,
  handoverStage,
  floralSculpture,
  coupleOutdoor,
  couplePlayful,
  coupleClose,
  coupleToast,
  coupleReeds,
  groomPortrait,
  bridePortrait,
  couplePlayfulWarm,
  coupleSeated,
  coupleIntimate,
  coupleBackView,
  beginScreen,
}

export const wedding = {
  couple: {
    groom: '张凯文',
    bride: '刘明玥',
    display: '张凯文 × 刘明玥',
  },
  date: '2026-09-12T17:30:00+08:00',
  dateDisplay: '2026.09.12',
  rsvpDeadline: '2026 年 9 月 1 日',
  venue: {
    name: '乐平山水国际酒店',
    address: '江西省景德镇市乐平市后港镇大山坞666号',
    latitude: 29.007175,
    longitude: 117.128293,
  },
  quote: '在光抵达之前，我们先抵达彼此',
  schedule: [
    { time: '17:00', title: '迎宾拍照', detail: '在迎宾区与我们一起留下合影' },
    { time: '17:30', title: '婚礼仪式', detail: '请提前入席，见证我们的故事正式开场' },
    { time: '18:00', title: '晚宴', detail: '举杯、用餐，与我们共享这场相聚' },
  ],
  travelSpots: [
    {
      id: 'ceramics-museum',
      name: '景德镇中国陶瓷博物馆',
      label: '读懂千年瓷都',
      description: '从新石器陶器到明清御瓷，用两三个小时看见景德镇的时间脉络。',
      image: ceramicsMuseum,
      distance: '约46公里',
      driveTime: '约60分钟',
      visitTime: '建议游览 2–3 小时',
      bestTime: '适合上午',
      address: '景德镇市昌江区紫晶北路1号',
      latitude: 29.29324,
      longitude: 117.17553,
    },
    {
      id: 'imperial-kiln',
      name: '陶阳里 · 御窑博物馆',
      label: '走进窑火深处',
      description: '老城里弄、御窑遗址与拱形窑砖建筑交叠，是景德镇最具代表性的一站。',
      image: imperialKiln,
      distance: '约43公里',
      driveTime: '约55分钟',
      visitTime: '建议游览 2–3 小时',
      bestTime: '午后至傍晚',
      address: '景德镇市珠山区珠山中路187号',
      latitude: 29.296615,
      longitude: 117.207107,
    },
    {
      id: 'taoxichuan',
      name: '陶溪川文创街区',
      label: '看见瓷都当代一面',
      description: '旧厂房、烟囱、展览与年轻创作者在这里相遇，夜幕之后尤其动人。',
      image: taoxichuan,
      distance: '约41公里',
      driveTime: '约50分钟',
      visitTime: '建议游览 2 小时',
      bestTime: '适合傍晚',
      address: '景德镇市珠山区新厂西路150号',
      latitude: 29.296921,
      longitude: 117.236957,
    },
    {
      id: 'sanbao',
      name: '三宝国际陶艺村',
      label: '把时间放慢一些',
      description: '沿着山谷走进工作室、展馆与咖啡馆，在自然里感受陶艺生活。',
      image: sanbao,
      distance: '约43公里',
      driveTime: '约55分钟',
      visitTime: '建议游览半日',
      bestTime: '适合白天',
      address: '景德镇市珠山区三宝村四家里',
      latitude: 29.247141,
      longitude: 117.26534,
    },
  ],
} as const

export type TravelSpot = (typeof wedding.travelSpots)[number]
