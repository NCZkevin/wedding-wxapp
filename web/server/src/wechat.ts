import { createHash, randomBytes } from 'node:crypto'
import { env } from './env.js'

interface CachedValue {
  value: string
  expiresAt: number
}

interface WechatResponse {
  access_token?: string
  ticket?: string
  expires_in?: number
  errcode?: number
  errmsg?: string
}

let accessTokenCache: CachedValue | undefined
let ticketCache: CachedValue | undefined

async function fetchWechat(url: URL) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error(`微信接口请求失败：${response.status}`)

  const result = (await response.json()) as WechatResponse
  if (result.errcode && result.errcode !== 0) {
    throw new Error(`微信接口返回错误：${result.errcode} ${result.errmsg || ''}`.trim())
  }
  return result
}

async function getAccessToken() {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) return accessTokenCache.value

  const url = new URL('https://api.weixin.qq.com/cgi-bin/token')
  url.searchParams.set('grant_type', 'client_credential')
  url.searchParams.set('appid', env.WECHAT_APP_ID)
  url.searchParams.set('secret', env.WECHAT_APP_SECRET)
  const result = await fetchWechat(url)
  if (!result.access_token) throw new Error('微信接口没有返回 access_token')

  accessTokenCache = {
    value: result.access_token,
    expiresAt: Date.now() + Math.max(60, (result.expires_in || 7200) - 300) * 1000,
  }
  return accessTokenCache.value
}

async function getJsapiTicket() {
  if (ticketCache && ticketCache.expiresAt > Date.now()) return ticketCache.value

  const accessToken = await getAccessToken()
  const url = new URL('https://api.weixin.qq.com/cgi-bin/ticket/getticket')
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('type', 'jsapi')
  const result = await fetchWechat(url)
  if (!result.ticket) throw new Error('微信接口没有返回 jsapi_ticket')

  ticketCache = {
    value: result.ticket,
    expiresAt: Date.now() + Math.max(60, (result.expires_in || 7200) - 300) * 1000,
  }
  return ticketCache.value
}

export function createJsapiSignature(input: {
  ticket: string
  nonceStr: string
  timestamp: number
  url: string
}) {
  const source = [
    `jsapi_ticket=${input.ticket}`,
    `noncestr=${input.nonceStr}`,
    `timestamp=${input.timestamp}`,
    `url=${input.url}`,
  ].join('&')
  return createHash('sha1').update(source).digest('hex')
}

export async function createWechatConfig(url: string) {
  if (!env.WECHAT_APP_ID || !env.WECHAT_APP_SECRET) {
    throw new Error('微信公众号环境变量尚未配置')
  }

  const requestedUrl = new URL(url)
  const publicUrl = new URL(env.PUBLIC_BASE_URL)
  if (requestedUrl.origin !== publicUrl.origin) {
    throw new Error('不允许为其他域名生成微信签名')
  }

  requestedUrl.hash = ''
  const ticket = await getJsapiTicket()
  const nonceStr = randomBytes(16).toString('hex')
  const timestamp = Math.floor(Date.now() / 1000)

  return {
    appId: env.WECHAT_APP_ID,
    timestamp,
    nonceStr,
    signature: createJsapiSignature({
      ticket,
      nonceStr,
      timestamp,
      url: requestedUrl.toString(),
    }),
  }
}
